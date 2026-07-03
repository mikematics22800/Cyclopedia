'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useAppContext } from '../contexts/AppContext';
import { getStormOrigin } from '../libs/hurdat';
import { shiftLngToReference } from '../libs/mapUtils';

const FOCUS_ZOOM = 6;

const MapStormFocus = () => {
  const map = useMap();
  const { storm, stormId, focusToken } = useAppContext();
  const lastFocusedTokenRef = useRef(0);

  useEffect(() => {
    if (!focusToken || focusToken === lastFocusedTokenRef.current) return;
    if (!storm?.data.length || storm.id !== stormId) return;

    const origin = getStormOrigin(storm);
    if (!origin) return;

    const { lat, lng } = origin;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    lastFocusedTokenRef.current = focusToken;

    const focus = () => {
      const size = map.getSize();
      if (size.x <= 0 || size.y <= 0) return;

      const centerLng = map.getCenter().lng;
      const shiftedLng = shiftLngToReference(lng, centerLng);
      if (!Number.isFinite(shiftedLng)) return;

      map.flyTo([lat, shiftedLng], FOCUS_ZOOM, { duration: 1 });
    };

    map.whenReady(focus);
  }, [focusToken, storm, stormId, map]);

  return null;
};

export default MapStormFocus;
