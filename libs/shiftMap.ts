'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

/** Re-run shift logic on map move, throttled to one update per animation frame. No React state. */
export const shiftMap = (
  map: LeafletMap,
  shift: (centerLng: number) => void,
) => {
  const shiftRef = useRef(shift);
  shiftRef.current = shift;

  useEffect(() => {
    let rafId = 0;

    const run = () => {
      rafId = 0;
      shiftRef.current(map.getCenter().lng);
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(run);
    };

    map.on('move', schedule);
    map.on('zoomend', run);
    run();

    return () => {
      map.off('move', schedule);
      map.off('zoomend', run);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [map]);
};
