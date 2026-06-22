'use client';

import { useCallback, useRef, useState } from 'react';
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';

const IntensityCharts = () => {
  const chartsRef = useRef<HTMLDivElement>(null);
  const [hiddenByDatasetIndex, setHiddenByDatasetIndex] = useState<Record<number, boolean>>({});

  const handleLegendVisibilityChange = useCallback((datasetIndex: number, isVisible: boolean) => {
    setHiddenByDatasetIndex((prev) => ({
      ...prev,
      [datasetIndex]: !isVisible,
    }));
  }, []);

  return (
    <div className="charts-container">
      <div ref={chartsRef} className="charts">
        <div className="chart-wrapper chart-wrapper--stacked w-full">
        <div className="chart flex w-full flex-col gap-4">
          <SeasonChart onLegendVisibilityChange={handleLegendVisibilityChange} />
          <StormChart hiddenByDatasetIndex={hiddenByDatasetIndex} />
        </div>
      </div>
        </div>
    </div>
  );
};

export default IntensityCharts;
