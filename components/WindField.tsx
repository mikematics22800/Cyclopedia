'use client';

import { useEffect, useRef } from 'react';
import { polygon, type Polygon as LeafletPolygon } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { getBasinFromStormId } from '../libs/basins';
import { buildWindPopupHtml, calculateWindRadii, shiftRegionForMapView } from '../libs/mapUtils';
import { shiftMap } from '../libs/shiftMap';

type WindLayer = {
  polygon: LeafletPolygon;
  raw: [number, number][];
  anchorLng: number;
  pointIndex: number;
};

const WIND_LAYERS = [
  { key: '34kt_wind_nm' as const, color: 'yellow', label: '≥ 34 kt' },
  { key: '50kt_wind_nm' as const, color: 'orange', label: '≥ 50 kt' },
  { key: '64kt_wind_nm' as const, color: 'red', label: '≥ 64 kt' },
];

const WindField = () => {
  const map = useMap();
  const { storm, year, visibleBasins } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const layersRef = useRef<WindLayer[]>([]);
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  getVisiblePointCountRef.current = getVisiblePointCount;

  const stormBasinId = storm ? getBasinFromStormId(storm.id) : undefined;
  const basinVisible =
    stormBasinId != null && visibleBasins.has(stormBasinId);

  const applyPlaybackToLayers = (centerLng: number) => {
    if (!storm) return;
    const count = getVisiblePointCountRef.current(storm.id);

    layersRef.current.forEach(({ polygon: shape, raw, anchorLng, pointIndex }) => {
      const visible = pointIndex < count;
      if (visible) {
        shape.setLatLngs(shiftRegionForMapView(raw, anchorLng, centerLng));
      }
      shape.setStyle({ opacity: visible ? 0.45 : 0, fillOpacity: visible ? 0.45 : 0 });
    });
  };

  useEffect(() => {
    layersRef.current.forEach(({ polygon: shape }) => shape.remove());
    layersRef.current = [];
    if (year < 2002 || !storm || !basinVisible) return;

    storm.data.forEach((point, pointIndex) => {
      WIND_LAYERS.forEach(({ key, color, label }) => {
        const radii = point[key];
        if (!radii) return;

        const raw = calculateWindRadii(point.lat, point.lng, radii);
        if (raw.length < 3) return;

        const shape = polygon([], { color, weight: 2 });
        shape.bindPopup(buildWindPopupHtml(label), { className: 'storm-popup' });
        shape.addTo(map);
        layersRef.current.push({ polygon: shape, raw, anchorLng: point.lng, pointIndex });
      });
    });

    applyPlaybackToLayers(map.getCenter().lng);

    return () => {
      layersRef.current.forEach(({ polygon: shape }) => shape.remove());
      layersRef.current = [];
    };
  }, [storm, year, map, basinVisible]);

  useEffect(() => {
    applyPlaybackToLayers(map.getCenter().lng);
  }, [getVisiblePointCount, storm, map]);

  shiftMap(map, (centerLng) => {
    applyPlaybackToLayers(centerLng);
  });

  return null;
};

export default WindField;
