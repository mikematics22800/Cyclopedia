'use client';

import { useRef, useState } from 'react';
import SeasonIntensity from './SeasonChart';
import StormIntensity from './StormChart';
import { useGsapReveal } from './hooks/useGsapReveal';

/** Season + storm intensity charts rendered together. */
export function IntensityCharts() {
  const [hiddenByLabel, setHiddenByLabel] = useState<Record<string, boolean>>({});

  const handleLegendVisibilityChange = (label: string, isVisible: boolean) => {
    setHiddenByLabel((prev) => ({
      ...prev,
      [label]: !isVisible,
    }));
  };

  return (
    <div className="chart-wrapper chart-wrapper--stacked w-full">
      <div className="chart flex w-full flex-col gap-4">
        <SeasonIntensity onLegendVisibilityChange={handleLegendVisibilityChange} />
        <StormIntensity hiddenByLabel={hiddenByLabel} />
      </div>
    </div>
  );
}

const archiveChartsReveal = {
  selector: '.chart-wrapper',
  y: 28,
  stagger: 0.12,
  duration: 0.58,
} as const;

const ArchiveCharts = () => {
  const chartsRef = useRef<HTMLDivElement>(null);

  // Desktop: this tree mounts only when the navbar switches from Map → Charts.
  useGsapReveal(chartsRef, [], archiveChartsReveal);

  return (
    <div className="charts-container">
      <div ref={chartsRef} className="charts">
        <IntensityCharts />
      </div>
    </div>
  );
};

export default ArchiveCharts;
