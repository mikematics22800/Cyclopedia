'use client';

import { useEffect, useRef } from 'react';
import { polygon, type Polygon as LeafletPolygon } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { buildWindPopupHtml, calculateWindRadii, shiftRegionForMapView } from '../libs/mapUtils';
import { shiftMap } from '../libs/shiftMap';

type WindLayer = {
  polygon: LeafletPolygon;
  raw: [number, number][];
  anchorLng: number;
};

const WIND_LAYERS = [
  { key: '34kt_wind_nm' as const, color: 'yellow', label: '≥ 34 kt' },
  { key: '50kt_wind_nm' as const, color: 'orange', label: '≥ 50 kt' },
  { key: '64kt_wind_nm' as const, color: 'red', label: '≥ 64 kt' },
];

const WindField = () => {
  const map = useMap();
  const { storm, year } = useAppContext();
  const layersRef = useRef<WindLayer[]>([]);

  useEffect(() => {
    layersRef.current.forEach(({ polygon: shape }) => shape.remove());
    layersRef.current = [];
    if (year < 2002 || !storm) return;

    storm.data.forEach((point) => {
      WIND_LAYERS.forEach(({ key, color, label }) => {
        const radii = point[key];
        if (!radii) return;

        const raw = calculateWindRadii(point.lat, point.lng, radii);
        if (raw.length < 3) return;

        const shape = polygon([], { color, weight: 2 });
        shape.bindPopup(buildWindPopupHtml(label), { className: 'storm-popup' });
        shape.addTo(map);
        layersRef.current.push({ polygon: shape, raw, anchorLng: point.lng });
      });
    });

    const centerLng = map.getCenter().lng;
    layersRef.current.forEach(({ polygon: shape, raw, anchorLng }) => {
      shape.setLatLngs(shiftRegionForMapView(raw, anchorLng, centerLng));
    });

    return () => {
      layersRef.current.forEach(({ polygon: shape }) => shape.remove());
      layersRef.current = [];
    };
  }, [storm, year, map]);

  shiftMap(map, (centerLng) => {
    layersRef.current.forEach(({ polygon: shape, raw, anchorLng }) => {
      shape.setLatLngs(shiftRegionForMapView(raw, anchorLng, centerLng));
    });
  });

  return null;
};

export default WindField;
