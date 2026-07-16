'use client';

import { useEffect, useRef } from 'react';
import { polyline, type Polyline as LeafletPolyline } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { getBasinFromStormId, type BasinId } from '../libs/basins';
import { getStormYear } from '../libs/hurdat';
import { projectPathForMapView } from '../libs/mapUtils';
import { shiftMap } from '../libs/shiftMap';

type TrackLayer = {
  polyline: LeafletPolyline;
  raw: [number, number][];
  id: string;
  basinId: BasinId;
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

const MapPolylines = () => {
  const map = useMap();
  const { globalSeason, visibleBasins, stormId, year, selectStorm } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const layersRef = useRef<TrackLayer[]>([]);
  const selectStormRef = useRef(selectStorm);
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  const visibleBasinsRef = useRef(visibleBasins);
  selectStormRef.current = selectStorm;
  getVisiblePointCountRef.current = getVisiblePointCount;
  visibleBasinsRef.current = visibleBasins;

  const applyBasinVisibility = () => {
    layersRef.current.forEach(({ polyline: line, basinId }) => {
      const shouldShow = visibleBasinsRef.current.has(basinId);
      if (shouldShow && !map.hasLayer(line)) {
        line.addTo(map);
      } else if (!shouldShow && map.hasLayer(line)) {
        line.remove();
      }
    });
  };

  const applyPlaybackToLayers = (centerLng: number) => {
    layersRef.current.forEach(({ polyline: line, raw, id, basinId }) => {
      if (!map.hasLayer(line) || !visibleBasinsRef.current.has(basinId)) return;

      const count = getVisiblePointCountRef.current(id);
      const visible = raw.slice(0, count);
      line.setLatLngs(projectPathForMapView(visible, centerLng));
    });
  };

  const applyLayerStyles = () => {
    layersRef.current.forEach(({ polyline: line, id, basinId, stormYear }) => {
      if (!map.hasLayer(line)) return;
      line.setStyle(trackStyle(id, stormYear, stormId, year));
    });
  };

  useEffect(() => {
    layersRef.current.forEach(({ polyline: line }) => line.remove());
    layersRef.current = [];

    if (!globalSeason) return;

    globalSeason.forEach((storm) => {
      const basinId = getBasinFromStormId(storm.id);
      if (!basinId) return;

      const raw = storm.data.map(
        (point) => [point.lat, point.lng] as [number, number],
      );
      const stormYear = getStormYear(storm.id);
      const line = polyline([], trackStyle(storm.id, stormYear, stormId, year));
      line.on('click', () => {
        selectStormRef.current(storm.id);
      });
      line.addTo(map);
      layersRef.current.push({
        polyline: line,
        raw,
        id: storm.id,
        basinId,
        stormYear,
      });
    });

    applyBasinVisibility();
    applyLayerStyles();
    applyPlaybackToLayers(map.getCenter().lng);
  }, [globalSeason, map]);

  useEffect(() => {
    applyPlaybackToLayers(map.getCenter().lng);
  }, [getVisiblePointCount, map]);

  useEffect(() => {
    applyBasinVisibility();
    applyLayerStyles();
    applyPlaybackToLayers(map.getCenter().lng);
  }, [stormId, year, visibleBasins]);

  shiftMap(map, (centerLng) => {
    applyPlaybackToLayers(centerLng);
  });

  return null;
};

export default MapPolylines;
