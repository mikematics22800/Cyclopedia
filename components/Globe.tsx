'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  buildPopupHtml,
  buildWindPopupHtml,
  calculateWindRadii,
  dotIconDataUrl,
  formatDateTime,
  formatStormFullName,
  getStormStatus,
  strikeIconDataUrl,
} from '../libs/mapUtils';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import LoadingScreen from './LoadingScreen';

type CesiumModule = typeof import('cesium');
type CesiumEntity = import('cesium').Entity;

type GlobePopup = {
  content: string;
};

declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}

const getEntityWorldPosition = (
  viewer: import('cesium').Viewer,
  entity: CesiumEntity,
  Cesium: CesiumModule,
) => {
  const time = viewer.clock.currentTime;
  const entityPosition = entity.position?.getValue(time);
  if (entityPosition) return entityPosition;

  const hierarchy = entity.polygon?.hierarchy?.getValue(time);
  if (hierarchy?.positions?.length) {
    return Cesium.BoundingSphere.fromPoints(hierarchy.positions).center;
  }

  return undefined;
};

const Globe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<import('cesium').Viewer | null>(null);
  const cesiumRef = useRef<CesiumModule | null>(null);
  const selectedEntityRef = useRef<CesiumEntity | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [popup, setPopup] = useState<GlobePopup | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const { year, windField, season, storm, stormId, setStormId } = useAppContext();

  const closePopup = useCallback(() => {
    selectedEntityRef.current = null;
    setPopup(null);
    setPopupPosition(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let clickHandler: import('cesium').ScreenSpaceEventHandler | null = null;

    const initViewer = async () => {
      window.CESIUM_BASE_URL = '/cesium/';
      const Cesium = await import('cesium');
      if (cancelled || !containerRef.current) return;

      cesiumRef.current = Cesium;

      const viewer = new Cesium.Viewer(container, {
        animation: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        selectionIndicator: false,
        infoBox: false,
        terrain: undefined,
        skyBox: false,
        skyAtmosphere: false,
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
        baseLayer: new Cesium.ImageryLayer(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            credit: 'OpenStreetMap contributors',
          }),
        ),
      });

      viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
      viewer.scene.globe.enableLighting = false;
      viewer.cesiumWidget.canvas.style.background = 'transparent';
      const cameraController = viewer.scene.screenSpaceCameraController;
      cameraController.minimumZoomDistance = 1_000;
      viewer.cesiumWidget.creditContainer.classList.add('cesium-credit-hidden');

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-60, 30, 5_000_000),
      });

      clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      clickHandler.setInputAction((movement: { position: import('cesium').Cartesian2 }) => {
        const picked = viewer.scene.pick(movement.position);
        if (!picked?.id) {
          selectedEntityRef.current = null;
          setPopup(null);
          setPopupPosition(null);
          return;
        }

        const entity = picked.id as CesiumEntity;
        const trackId = entity.properties?.stormTrackId?.getValue(
          viewer.clock.currentTime,
        ) as string | undefined;
        if (trackId) {
          setStormId(trackId);
        }

        const description = entity.description?.getValue(viewer.clock.currentTime);
        if (typeof description === 'string' && description.trim()) {
          selectedEntityRef.current = entity;
          setPopup({ content: description });
          return;
        }

        selectedEntityRef.current = null;
        setPopup(null);
        setPopupPosition(null);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = viewer;
      setViewerReady(true);
    };

    initViewer();

    return () => {
      cancelled = true;
      setViewerReady(false);
      clickHandler?.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
      cesiumRef.current = null;
      selectedEntityRef.current = null;
    };
  }, [setStormId]);

  useEffect(() => {
    if (!viewerReady || !popup) return;

    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || viewer.isDestroyed()) return;

    const updatePosition = () => {
      const entity = selectedEntityRef.current;
      if (!entity) return;

      const worldPosition = getEntityWorldPosition(viewer, entity, Cesium);
      if (!worldPosition) {
        setPopupPosition(null);
        return;
      }

      const canvasPosition = viewer.scene.cartesianToCanvasCoordinates(
        worldPosition,
        new Cesium.Cartesian2(),
      );

      if (!canvasPosition) {
        setPopupPosition(null);
        return;
      }

      setPopupPosition({ x: canvasPosition.x, y: canvasPosition.y });
    };

    viewer.scene.postRender.addEventListener(updatePosition);
    updatePosition();

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.postRender.removeEventListener(updatePosition);
      }
    };
  }, [viewerReady, popup]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewerReady || !viewer || !Cesium || viewer.isDestroyed() || !season) return;

    selectedEntityRef.current = null;
    setPopup(null);
    setPopupPosition(null);
    viewer.entities.removeAll();

    season.forEach((stormTrack) => {
      const id = stormTrack.id;
      const name = id.split('_')[1];
      const isSelected = id === stormId;
      const positions = stormTrack.data.map((point) =>
        Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
      );

      viewer.entities.add({
        id: `track-${id}`,
        properties: {
          stormTrackId: id,
        },
        polyline: {
          positions,
          width: isSelected ? 4 : 2,
          material: Cesium.Color.fromCssColorString(isSelected ? 'white' : 'gray').withAlpha(
            isSelected ? 1 : 0.5,
          ),
          clampToGround: true,
        },
      });

      stormTrack.data.forEach((point, index) => {
        const { formattedDate, formattedTime } = formatDateTime(point.date, point.time_utc);
        const { status, color } = getStormStatus(point);
        const fullName = formatStormFullName(name, status);
        const isLandfall = point.record === 'L';

        viewer.entities.add({
          id: `point-${id}-${index}`,
          properties: {
            stormTrackId: id,
          },
          position: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
          billboard: {
            image: isLandfall ? strikeIconDataUrl(color) : dotIconDataUrl(color),
            width: isLandfall ? 25 : 10,
            height: isLandfall ? 25 : 10,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: buildPopupHtml(fullName, formattedDate, formattedTime, point),
        });
      });
    });

    if (year >= 2004 && windField && storm) {
      const windLayers = [
        { key: '34kt_wind_nm' as const, color: Cesium.Color.YELLOW, label: '≥34 kt' },
        { key: '50kt_wind_nm' as const, color: Cesium.Color.ORANGE, label: '≥50 kt' },
        { key: '64kt_wind_nm' as const, color: Cesium.Color.RED, label: '≥64 kt' },
      ];

      storm.data.forEach((point, index) => {
        windLayers.forEach(({ key, color, label }) => {
          const radii = point[key];
          if (!radii) return;

          const flatCoords = calculateWindRadii(point.lat, point.lng, radii).flatMap(
            ([lat, lng]) => [lng, lat],
          );
          if (flatCoords.length < 6) return;

          viewer.entities.add({
            id: `wind-${key}-${storm.id}-${index}`,
            properties: {
              stormTrackId: storm.id,
            },
            position: Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
              material: color.withAlpha(0.45),
              outline: true,
              outlineColor: color,
              outlineWidth: 2,
              height: 0,
            },
            description: buildWindPopupHtml(label),
          });
        });
      });
    }
  }, [season, stormId, windField, year, storm, viewerReady]);

  return (
    <div className="map relative">
      <div ref={containerRef} className="h-full w-full" />
      {popup && popupPosition && (
        <div
          className="globe-popup pointer-events-auto"
          style={{ left: popupPosition.x, top: popupPosition.y }}
        >
          <button
            type="button"
            className="globe-popup-close"
            aria-label="Close popup"
            onClick={closePopup}
          >
            ×
          </button>
          <div dangerouslySetInnerHTML={{ __html: popup.content }} />
        </div>
      )}
      {!viewerReady && <LoadingScreen overlay />}
    </div>
  );
};

export default Globe;
