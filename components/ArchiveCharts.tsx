'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGsapReveal } from './hooks/useGsapReveal';

const IntensityChartsPanel = dynamic(() => import('./IntensityChartsPanel'), {
  ssr: false,
});

const archiveChartsReveal = {
  selector: '.chart-wrapper',
  y: 28,
  stagger: 0.12,
  duration: 0.58,
} as const;

/** Mobile: season + storm intensity in one panel (shared pairing); follows document order in Interface. */
export function InterfaceIntensityChartsPanel() {
  return (
    <div className="charts-container lg:hidden w-full">
      <div className="charts">
        <IntensityChartsPanel />
      </div>
    </div>
  );
}

const ArchiveCharts = () => {
  const chartsRef = useRef<HTMLDivElement>(null);

  // Desktop: this tree mounts only when the navbar switches from Map → Charts.
  useGsapReveal(chartsRef, [], archiveChartsReveal);

  return (
    <div className="charts-container">
      <div ref={chartsRef} className="charts">
        <IntensityChartsPanel />
      </div>
    </div>
  );
};

export default ArchiveCharts;
