'use client';

import { useCallback, useRef, useState } from 'react';
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';
import TotalsChart from './TotalsChart';

const Charts = () => {
  const graphsRef = useRef<HTMLDivElement>(null);
  const [hiddenByDatasetIndex, setHiddenByDatasetIndex] = useState<Record<number, boolean>>({});

  const handleLegendVisibilityChange = useCallback((datasetIndex: number, isVisible: boolean) => {
    setHiddenByDatasetIndex((prev) => ({
      ...prev,
      [datasetIndex]: !isVisible,
    }));
  }, []);

  return (
    <div className="graphs-container">
      <div ref={graphsRef} className="graphs">
      <TotalsChart/>
        <SeasonChart onLegendVisibilityChange={handleLegendVisibilityChange} />
        <StormChart hiddenByDatasetIndex={hiddenByDatasetIndex} />
      </div>
    </div>
  );
};

export default Charts;
