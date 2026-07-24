'use client';

import { useRef, useCallback, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import Metrics from "./Metrics";
import { useGsapReveal } from "./hooks/useGsapReveal";
import { useMobileSheetDrag } from "./hooks/useMobileSheetDrag";
import TotalsChart from "./TotalsChart";
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';
import Selectors from './Selectors';
import Image from "next/image";
import { useBasinTotals } from "./hooks/useBasinTotals";

type InterfaceProps = {
  mobileSheet?: boolean;
};

const Interface = ({ mobileSheet = false }: InterfaceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hiddenByDatasetIndex, setHiddenByDatasetIndex] = useState<Record<number, boolean>>({});

  const { basin, year } = useAppContext();
  const totals = useBasinTotals(basin);
  const { dragHandleProps, sheetStyle, handleRef, snap } = useMobileSheetDrag(mobileSheet);

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

  const interfaceBody = (
    <div ref={containerRef} className='interface'>
      <div className="w-full flex flex-col items-center overflow-hidden gap-2 lg:gap-4">
        <div
          data-gsap-reveal
          className="w-full flex flex-col items-center gap-2 lg:gap-4"
        >
          <div className="metrics">
            <Selectors />
            <Metrics />
            <div className="lg:hidden w-full">
              {totals !== null && (
                <>
                  <TotalsChart totals={totals} />
                  <SeasonChart onLegendVisibilityChange={handleLegendVisibilityChange} />
                  <StormChart hiddenByDatasetIndex={hiddenByDatasetIndex} />
                </>
              )}
            </div>
            <div className="flex items-center w-full justify-between">
              <Image
                src="/NOAA.svg"
                alt="NOAA"
                width={50}
                height={50}
                priority
                unoptimized
              />
              <Image
                src="/JTWC.svg"
                alt="JTWC"
                width={50}
                height={50}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (mobileSheet) {
    return (
      <div
        className={`interface-sheet${snap === 'expanded' ? ' interface-sheet--expanded' : ''}`}
        style={sheetStyle}
      >
        <div className="interface-panel">
          <img
            src="/hurricane.jpg"
            alt=""
            aria-hidden
            className="interface-background"
          />
          <div
            ref={handleRef}
            {...dragHandleProps}
            className="drag-handle-container"
          >
            <div data-gsap-reveal className="drag-handle shrink-0" />
          </div>
          <div className="interface-scroll">
            {interfaceBody}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interface-scroll">
      <div className="interface-panel">
        {interfaceBody}
      </div>
    </div>
  );
};

export default Interface;
