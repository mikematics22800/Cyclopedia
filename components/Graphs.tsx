'use client';

import { useCallback, useRef, useState } from 'react';
import SeasonChart from './SeasonGraph';
import StormChart from './StormGraph';

const Graphs = () => {
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
        <SeasonChart onLegendVisibilityChange={handleLegendVisibilityChange} />
        <StormChart hiddenByDatasetIndex={hiddenByDatasetIndex} />
      </div>
    </div>
  );
};

export default Graphs;
