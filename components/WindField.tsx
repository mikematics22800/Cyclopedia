'use client';

import { useEffect, useRef } from 'react';
import { polygon, type Polygon as LeafletPolygon } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { t } from '../libs/i18n';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { buildWindPopupHtml, calculateWindRadii, shiftRegionForMapView } from '../libs/mapUtils';
import { shiftMap } from '../libs/shiftMap';

type WindLayer = {
  polygon: LeafletPolygon;
  raw: [number, number][];
  anchorLng: number;
  pointIndex: number;
};

const WIND_LAYERS = [
  { key: '34kt_wind_nm' as const, color: 'yellow', labelKey: 'windGte34' as const },
  { key: '50kt_wind_nm' as const, color: 'orange', labelKey: 'windGte50' as const },
  { key: '64kt_wind_nm' as const, color: 'red', labelKey: 'windGte64' as const },
];

const WindField = () => {
  const map = useMap();
  const { storm, year, lang } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const layersRef = useRef<WindLayer[]>([]);
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  getVisiblePointCountRef.current = getVisiblePointCount;

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
    if (year < 2002 || !storm) return;

    storm.data.forEach((point, pointIndex) => {
      WIND_LAYERS.forEach(({ key, color, labelKey }) => {
        const radii = point[key];
        if (!radii) return;

        const raw = calculateWindRadii(point.lat, point.lng, radii);
        if (raw.length < 3) return;

        const shape = polygon([], { color, weight: 2 });
        shape.bindPopup(buildWindPopupHtml(t(lang, labelKey), lang), { className: 'storm-popup' });
        shape.addTo(map);
        layersRef.current.push({ polygon: shape, raw, anchorLng: point.lng, pointIndex });
      });
    });

    applyPlaybackToLayers(map.getCenter().lng);

    return () => {
      layersRef.current.forEach(({ polygon: shape }) => shape.remove());
      layersRef.current = [];
    };
  }, [storm, year, map, lang]);

  useEffect(() => {
    applyPlaybackToLayers(map.getCenter().lng);
  }, [getVisiblePointCount, storm, map]);

  shiftMap(map, (centerLng) => {
    applyPlaybackToLayers(centerLng);
  });

  return null;
};

export default WindField;
