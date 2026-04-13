'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGsapReveal } from './hooks/useGsapReveal';

const SeasonIntensity = dynamic(() => import('./SeasonIntensity'), {
  ssr: false,
});
const SeasonAceTike = dynamic(() => import('./SeasonAceTike'), { ssr: false });
const Intensity = dynamic(() => import('./Intensity'), { ssr: false });
const AceTike = dynamic(() => import('./AceTike'), { ssr: false });

const archiveChartsReveal = {
  selector: '.chart-wrapper',
  y: 28,
  stagger: 0.12,
  duration: 0.58,
} as const;

/** Season charts only; mobile Interface order (between season stats and storm stats). */
export function InterfaceSeasonCharts() {
  return (
    <div className="charts-container max-lg:order-4 lg:hidden w-full">
      <div className="charts">
        <SeasonIntensity />
        <SeasonAceTike />
      </div>
    </div>
  );
}

/** Storm charts only; mobile Interface order (below storm stats). */
export function InterfaceStormCharts() {
  return (
    <div className="charts-container max-lg:order-6 lg:hidden w-full">
      <div className="charts">
        <Intensity />
        <AceTike />
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
        <SeasonIntensity />
        <SeasonAceTike />
        <Intensity />
        <AceTike />
      </div>
    </div>
  );
};

export default ArchiveCharts;
