'use client';

import { useEffect, useRef } from 'react';
import { divIcon, marker, type Marker as LeafletMarker } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import {
  dotSvg,
  formatDateTime,
  formatPressureDisplay,
  formatStormFullName,
  formatWindDisplay,
  getPopupStormStatus,
  getStormStatus,
  strikeSvg,
} from '../libs/mapUtils';

type StormMarkerLayer = {
  stormId: string;
  markers: LeafletMarker[];
};

const MapTracks = () => {
  const map = useMap();
  const { globalSeason, selectStorm } = useAppContext();
  const { getVisiblePointCount } = usePlaybackContext();
  const layersRef = useRef<StormMarkerLayer[]>([]);
  const selectStormRef = useRef(selectStorm);
  const getVisiblePointCountRef = useRef(getVisiblePointCount);
  selectStormRef.current = selectStorm;
  getVisiblePointCountRef.current = getVisiblePointCount;

  const setMarkerVisible = (leafletMarker: LeafletMarker, visible: boolean) => {
    leafletMarker.setOpacity(visible ? 1 : 0);
  };

  const applyPlaybackToMarkers = () => {
    layersRef.current.forEach(({ stormId, markers }) => {
      const count = getVisiblePointCountRef.current(stormId);
      markers.forEach((leafletMarker, index) => {
        setMarkerVisible(leafletMarker, index < count);
      });
    });
  };

  useEffect(() => {
    layersRef.current.forEach(({ markers }) => {
      markers.forEach((leafletMarker) => leafletMarker.remove());
    });
    layersRef.current = [];

    if (!globalSeason) return;

    globalSeason.forEach((storm) => {
      const id = storm.id;
      const name = id.split('_')[1];
      const markers: LeafletMarker[] = [];

      storm.data.forEach((point) => {
        const { formattedDate, formattedTime } = formatDateTime(point.date, point.time_utc);
        const { color } = getStormStatus(point);
        const isLandfall = point.record === 'L';
        const fullName = formatStormFullName(name, getPopupStormStatus(point, id));

        const icon = divIcon({
          className: 'bg-opacity-0',
          html: isLandfall ? strikeSvg(color) : dotSvg(color),
          iconSize: isLandfall ? [25, 25] : [10, 10],
        });

        const leafletMarker = marker([point.lat, point.lng], { icon });
        leafletMarker.bindPopup(
          `<div class="popup-panel">
            <h1>${fullName}</h1>
            <ul>
              <li>${formattedDate} ${formattedTime} EST</li>
              <li>Maximum Wind: ${formatWindDisplay(point.max_wind_kt)}</li>
              <li>Minimum Pressure: ${formatPressureDisplay(point.min_pressure_mb)}</li>
            </ul>
          </div>`,
          { className: 'storm-popup' },
        );
        leafletMarker.on('click', () => selectStormRef.current(id));
        leafletMarker.addTo(map);
        markers.push(leafletMarker);
      });

      layersRef.current.push({ stormId: id, markers });
    });

    applyPlaybackToMarkers();
  }, [globalSeason, map]);

  useEffect(() => {
    applyPlaybackToMarkers();
  }, [getVisiblePointCount]);

  return null;
};

export default MapTracks;
