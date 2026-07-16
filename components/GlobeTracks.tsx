'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { getBasinFromStormId, type BasinId } from '../libs/basins';
import {
  buildPopupHtml,
  dotIconDataUrl,
  formatDateTime,
  formatStormFullName,
  getPopupStormStatus,
  getStormStatus,
  strikeIconDataUrl,
} from '../libs/mapUtils';
import {
  type CesiumEntity,
  type CesiumModule,
  type CesiumWithOccluder,
  removeEntitiesWithPrefix,
} from '../libs/globeTrackUtils';

type PointLayer = {
  stormId: string;
  basinId: BasinId;
  points: Array<{ entity: CesiumEntity; index: number }>;
};

type UseGlobeTracksOptions = {
  viewerRef: RefObject<import('cesium').Viewer | null>;
  cesiumRef: RefObject<CesiumModule | null>;
  viewerReady: boolean;
  onClearPopup: () => void;
};

export const useGlobeTracks = ({
  viewerRef,
  cesiumRef,
  viewerReady,
  onClearPopup,
}: UseGlobeTracksOptions) => {
  const { globalSeason, visibleBasins } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const pointLayersRef = useRef<PointLayer[]>([]);
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  const visibleBasinsRef = useRef(visibleBasins);
  getVisiblePointCountRef.current = getVisiblePointCount;
  visibleBasinsRef.current = visibleBasins;

  const applyBasinVisibility = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    pointLayersRef.current.forEach(({ basinId, points }) => {
      const shouldShow = visibleBasinsRef.current.has(basinId);
      points.forEach(({ entity }) => {
        const inCollection = viewer.entities.contains(entity);
        if (shouldShow && !inCollection) {
          viewer.entities.add(entity);
        } else if (!shouldShow && inCollection) {
          viewer.entities.remove(entity);
        }
      });
    });

    viewer.scene.requestRender();
  };

  const applyPlaybackToPoints = () => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || viewer.isDestroyed()) return;

    pointLayersRef.current.forEach(({ stormId, basinId, points }) => {
      if (!visibleBasinsRef.current.has(basinId)) return;

      const count = getVisiblePointCountRef.current(stormId);
      points.forEach(({ entity, index }) => {
        if (!viewer.entities.contains(entity)) return;
        const playbackVisible = index < count;
        if (entity.billboard) {
          entity.billboard.show = new Cesium.ConstantProperty(playbackVisible);
        }
      });
    });

    viewer.scene.requestRender();
  };

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewerReady || !viewer || !Cesium || viewer.isDestroyed() || !globalSeason) return;

    onClearPopup();
    pointLayersRef.current.forEach(({ points }) => {
      points.forEach(({ entity }) => {
        if (viewer.entities.contains(entity)) {
          viewer.entities.remove(entity);
        }
      });
    });
    pointLayersRef.current = [];
    removeEntitiesWithPrefix(viewer, 'point-');

    globalSeason.forEach((stormTrack) => {
      const id = stormTrack.id;
      const basinId = getBasinFromStormId(id);
      if (!basinId) return;

      const name = id.split('_')[1];
      const points: PointLayer['points'] = [];

      stormTrack.data.forEach((point, index) => {
        const { formattedDate, formattedTime } = formatDateTime(point.date, point.time_utc);
        const { color } = getStormStatus(point);
        const fullName = formatStormFullName(name, getPopupStormStatus(point, id));
        const isLandfall = point.record === 'L';

        const position = Cesium.Cartesian3.fromDegrees(point.lng, point.lat);
        const entity = viewer.entities.add({
          id: `point-${id}-${index}`,
          properties: {
            stormTrackId: id,
          },
          position,
          show: new Cesium.CallbackProperty(() => {
            const activeViewer = viewerRef.current;
            if (!activeViewer || activeViewer.isDestroyed()) return false;

            const occluder = new (Cesium as CesiumWithOccluder).EllipsoidalOccluder(
              activeViewer.scene.globe.ellipsoid,
              activeViewer.camera.positionWC,
            );
            return occluder.isPointVisible(position);
          }, false) as unknown as boolean,
          billboard: {
            image: isLandfall ? strikeIconDataUrl(color) : dotIconDataUrl(color),
            width: isLandfall ? 25 : 10,
            height: isLandfall ? 25 : 10,
            show: true,
          },
          description: buildPopupHtml(fullName, formattedDate, formattedTime, point),
        });

        points.push({ entity, index });
      });

      pointLayersRef.current.push({ stormId: id, basinId, points });
    });

    applyBasinVisibility();
    applyPlaybackToPoints();
  }, [globalSeason, viewerReady, viewerRef, cesiumRef, onClearPopup]);

  useEffect(() => {
    applyBasinVisibility();
    applyPlaybackToPoints();
  }, [getVisiblePointCount, visibleBasins]);
};
