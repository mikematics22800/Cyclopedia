'use client';

import { useRef } from 'react';
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';

const IntensityCharts = () => {
  const chartsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="charts-container">
      <div ref={chartsRef} className="charts">
        <div className="chart-wrapper chart-wrapper--stacked w-full">
        <div className="chart flex w-full flex-col gap-4">
          <SeasonChart />
          <StormChart />
        </div>
      </div>
        </div>
    </div>
  );
};

export default IntensityCharts;
