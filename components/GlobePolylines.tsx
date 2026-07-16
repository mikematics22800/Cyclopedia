'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { getBasinFromStormId } from '../libs/basins';
import { getStormYear } from '../libs/hurdat';
import {
  type CesiumEntity,
  type CesiumModule,
  type CesiumWithOccluder,
  longestVisibleSegment,
  removeEntitiesWithPrefix,
  trackAppearance,
} from '../libs/globeTrackUtils';

type TrackEntity = {
  entity: CesiumEntity;
  stormId: string;
};

type UseGlobePolylinesOptions = {
  viewerRef: RefObject<import('cesium').Viewer | null>;
  cesiumRef: RefObject<CesiumModule | null>;
  viewerReady: boolean;
};

export const useGlobePolylines = ({
  viewerRef,
  cesiumRef,
  viewerReady,
}: UseGlobePolylinesOptions) => {
  const { globalSeason, visibleBasins, stormId, year } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const trackEntitiesRef = useRef<TrackEntity[]>([]);
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  const visibleBasinsRef = useRef(visibleBasins);
  getVisiblePointCountRef.current = getVisiblePointCount;
  visibleBasinsRef.current = visibleBasins;

  const applyBasinVisibility = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    trackEntitiesRef.current.forEach(({ entity, stormId: id }) => {
      const basinId = getBasinFromStormId(id);
      const shouldShow = basinId != null && visibleBasinsRef.current.has(basinId);
      const inCollection = viewer.entities.contains(entity);

      if (shouldShow && !inCollection) {
        viewer.entities.add(entity);
      } else if (!shouldShow && inCollection) {
        viewer.entities.remove(entity);
      }
    });

    viewer.scene.requestRender();
  };

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewerReady || !viewer || !Cesium || viewer.isDestroyed()) return;

    trackEntitiesRef.current.forEach(({ entity }) => {
      if (viewer.entities.contains(entity)) {
        viewer.entities.remove(entity);
      }
    });
    trackEntitiesRef.current = [];
    removeEntitiesWithPrefix(viewer, 'track-');

    if (!globalSeason) return;

    globalSeason.forEach((stormTrack) => {
      const id = stormTrack.id;
      const stormYear = getStormYear(id);
      const { width, alpha, color } = trackAppearance(id, stormYear, stormId, year);
      const fullPositions = stormTrack.data.map((point) =>
        Cesium.Cartesian3.fromDegrees(point.lng, point.lat),
      );
      if (fullPositions.length < 2) return;

      const entity = viewer.entities.add({
        id: `track-${id}`,
        properties: {
          stormTrackId: id,
        },
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            const count = getVisiblePointCountRef.current(id);
            const sliced = fullPositions.slice(0, count);
            if (sliced.length < 2) return [];

            const activeViewer = viewerRef.current;
            if (!activeViewer || activeViewer.isDestroyed()) return sliced;

            const occluder = new (Cesium as CesiumWithOccluder).EllipsoidalOccluder(
              activeViewer.scene.globe.ellipsoid,
              activeViewer.camera.positionWC,
            );
            return longestVisibleSegment(sliced, occluder);
          }, false),
          width,
          material: Cesium.Color.fromCssColorString(color).withAlpha(alpha),
          arcType: Cesium.ArcType.GEODESIC,
        },
      });

      trackEntitiesRef.current.push({ entity, stormId: id });
    });

    applyBasinVisibility();
  }, [globalSeason, viewerReady, viewerRef, cesiumRef]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewerReady || !viewer || !Cesium || viewer.isDestroyed()) return;

    trackEntitiesRef.current.forEach(({ entity, stormId: id }) => {
      if (!viewer.entities.contains(entity)) return;

      const { width, alpha, color } = trackAppearance(id, getStormYear(id), stormId, year);
      if (entity.polyline) {
        entity.polyline.width = new Cesium.ConstantProperty(width);
        entity.polyline.material = new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(color).withAlpha(alpha),
        );
      }
    });

    viewer.scene.requestRender();
  }, [stormId, year, viewerReady, viewerRef, cesiumRef]);

  useEffect(() => {
    applyBasinVisibility();
  }, [visibleBasins]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.scene.requestRender();
  }, [getVisiblePointCount, viewerRef]);
};
