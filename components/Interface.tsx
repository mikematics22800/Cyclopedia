'use client';

import { useRef, useCallback, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import StormMetrics from "./StormMetrics";
import SeasonMetrics from "./SeasonMetrics";
import { useGsapReveal } from "./hooks/useGsapReveal";
import SeasonGraph from './SeasonGraph';
import StormGraph from './StormGraph';
import Selectors from './Selectors';

const Interface = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hiddenByDatasetIndex, setHiddenByDatasetIndex] = useState<Record<number, boolean>>({});

  const { basin, year } = useAppContext();

  useGsapReveal(containerRef, [basin, year], {
    stagger: 0.065,
    y: 18,
  });

  const handleLegendVisibilityChange = useCallback((datasetIndex: number, isVisible: boolean) => {
    setHiddenByDatasetIndex((prev) => ({
      ...prev,
      [datasetIndex]: !isVisible,
    }));
  }, []);

  return (
    <div className="interface-scroll">
      <div ref={containerRef} className='interface'>
        <div className="w-full flex flex-col items-center overflow-hidden gap-2 lg:gap-4 pt-3">
        <div data-gsap-reveal className="drag-handle shrink-0" />
        <div
          data-gsap-reveal
          className="w-full flex flex-col items-center gap-2 lg:gap-4"
        >
        <div className="metrics">
          <Selectors />
          <SeasonMetrics />
          <StormMetrics />
        </div>
        </div>
        <div className="lg:hidden w-full p-4">
          <SeasonGraph onLegendVisibilityChange={handleLegendVisibilityChange} />
          <StormGraph hiddenByDatasetIndex={hiddenByDatasetIndex} />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Interface;
