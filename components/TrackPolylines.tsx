'use client';

import { useEffect, useRef } from 'react';
import { polyline, type Polyline as LeafletPolyline } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { getStormYear } from '../libs/hurdat';
import { projectPathForMapView } from '../libs/mapUtils';
import { shiftMap } from '../libs/shiftMap';

type TrackLayer = {
  polyline: LeafletPolyline;
  raw: [number, number][];
  id: string;
  stormYear: number;
};

const trackStyle = (
  id: string,
  stormYear: number,
  stormId: string,
  year: number,
) => {
  const isSelected = id === stormId;
  const isSelectedYear = stormYear === year;
  return {
    color: isSelected ? 'white' : 'gray',
    opacity: isSelected ? 1 : isSelectedYear ? 0.5 : 0.15,
    weight: isSelected ? 4 : isSelectedYear ? 2 : 1,
  };
};

const TrackPolylines = () => {
  const map = useMap();
  const { globalSeason, stormId, year, selectStorm } = useAppContext();
  const layersRef = useRef<TrackLayer[]>([]);
  const selectStormRef = useRef(selectStorm);
  selectStormRef.current = selectStorm;

  useEffect(() => {
    layersRef.current.forEach(({ polyline: line }) => line.remove());
    layersRef.current = [];

    if (!globalSeason) return;

    globalSeason.forEach((storm) => {
      const raw = storm.data.map(
        (point) => [point.lat, point.lng] as [number, number],
      );
      const stormYear = getStormYear(storm.id);
      const line = polyline([], trackStyle(storm.id, stormYear, stormId, year));
      line.on('click', () => {
        selectStormRef.current(storm.id);
      });
      line.addTo(map);
      layersRef.current.push({ polyline: line, raw, id: storm.id, stormYear });
    });

    const centerLng = map.getCenter().lng;
    layersRef.current.forEach(({ polyline: line, raw }) => {
      line.setLatLngs(projectPathForMapView(raw, centerLng));
    });
  }, [globalSeason, map]);

  useEffect(() => {
    layersRef.current.forEach(({ polyline: line, id, stormYear }) => {
      line.setStyle(trackStyle(id, stormYear, stormId, year));
    });
  }, [stormId, year]);

  shiftMap(map, (centerLng) => {
    layersRef.current.forEach(({ polyline: line, raw }) => {
      line.setLatLngs(projectPathForMapView(raw, centerLng));
    });
  });

  return null;
};

export default TrackPolylines;
