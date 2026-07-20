'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { getStormYear } from '../libs/hurdat';
import {
  type CesiumModule,
  type CesiumWithOccluder,
  longestVisibleSegment,
  removeEntitiesWithPrefix,
  trackAppearance,
} from '../libs/globeTrackUtils';

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
  const { globalSeason, stormId, year } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  getVisiblePointCountRef.current = getVisiblePointCount;

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewerReady || !viewer || !Cesium || viewer.isDestroyed()) return;

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

      viewer.entities.add({
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
    });
  }, [globalSeason, viewerReady, stormId, year, viewerRef, cesiumRef]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewerReady || !viewer || !Cesium || viewer.isDestroyed()) return;

    viewer.entities.values.forEach((entity) => {
      if (typeof entity.id !== 'string' || !entity.id.startsWith('track-')) return;
      const id = entity.id.slice('track-'.length);
      const { width, alpha, color } = trackAppearance(id, getStormYear(id), stormId, year);
      if (entity.polyline) {
        entity.polyline.width = new Cesium.ConstantProperty(width);
        entity.polyline.material = new Cesium.ColorMaterialProperty(
          Cesium.Color.fromCssColorString(color).withAlpha(alpha),
        );
      }
    });
  }, [stormId, year, viewerReady, viewerRef, cesiumRef]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.scene.requestRender();
  }, [getVisiblePointCount, viewerRef]);
};
