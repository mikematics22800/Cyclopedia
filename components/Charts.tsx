'use client';

import { useCallback, useRef, useState } from 'react';
import type { Chart, Plugin } from 'chart.js';
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';
import TotalsChart from './TotalsChart';

const legendVerticalPaddingPlugin: Plugin = {
  id: 'legendVerticalPadding',
  beforeInit(chart: Chart) {
    const legend = chart.legend;
    if (!legend) return;

    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const originalFit = legend.fit.bind(legend);
    legend.fit = function fit() {
      originalFit();
      this.height += remPx * 0.5;
    };
  },
};

const chartLegendPlugins = [legendVerticalPaddingPlugin];

type ChartsProps = {
  embedded?: boolean;
};

const Charts = ({ embedded = false }: ChartsProps) => {
  const graphsRef = useRef<HTMLDivElement>(null);
  const [hiddenByDatasetIndex, setHiddenByDatasetIndex] = useState<Record<number, boolean>>({});

  const handleLegendVisibilityChange = useCallback((datasetIndex: number, isVisible: boolean) => {
    setHiddenByDatasetIndex((prev) => ({
      ...prev,
      [datasetIndex]: !isVisible,
    }));
  }, []);

  const chartContent = (
    <>
      <TotalsChart extraPlugins={chartLegendPlugins} />
      <SeasonChart
        extraPlugins={chartLegendPlugins}
        onLegendVisibilityChange={handleLegendVisibilityChange}
      />
      <StormChart hiddenByDatasetIndex={hiddenByDatasetIndex} />
    </>
  );

  if (embedded) {
    return (
      <div className="lg:hidden w-full py-4 -mx-4 px-0">
        {chartContent}
      </div>
    );
  }

  return (
    <div className="graphs-container">
      <div ref={graphsRef} className="graphs">
        {chartContent}
      </div>
    </div>
  );
};

export default Charts;
