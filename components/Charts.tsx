'use client';

import { useCallback, useRef, useState } from 'react';
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';

const IntensityCharts = () => {
  const chartsRef = useRef<HTMLDivElement>(null);
  const [hiddenByLabel, setHiddenByLabel] = useState<Record<string, boolean>>({});

  const handleLegendVisibilityChange = useCallback((label: string, isVisible: boolean) => {
    setHiddenByLabel((prev) => ({
      ...prev,
      [label]: !isVisible,
    }));
  }, []);

  return (
    <div className="charts-container">
      <div ref={chartsRef} className="charts">
        <div className="chart-wrapper chart-wrapper--stacked w-full">
        <div className="chart flex w-full flex-col gap-4">
          <SeasonChart onLegendVisibilityChange={handleLegendVisibilityChange} />
          <StormChart hiddenByLabel={hiddenByLabel} />
        </div>
      </div>
        </div>
    </div>
  );
};

export default IntensityCharts;
