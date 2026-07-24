'use client';

import { useCallback, useRef, useState } from 'react';
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';
import TotalsChart from './TotalsChart';
import { useAppContext } from '../contexts/AppContext';
import { useBasinTotals } from './hooks/useBasinTotals';

const Charts = () => {
  const graphsRef = useRef<HTMLDivElement>(null);
  const { basin } = useAppContext();
  const totals = useBasinTotals(basin);
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
        {totals !== null && (
          <>
            <TotalsChart totals={totals} />
            <SeasonChart onLegendVisibilityChange={handleLegendVisibilityChange} />
            <StormChart hiddenByDatasetIndex={hiddenByDatasetIndex} />
          </>
        )}
      </div>
    </div>
  );
};

export default Charts;
