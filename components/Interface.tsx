'use client';

import { useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import { useAppContext } from "../contexts/AppContext";
import StormArchive from "./StormMetrics";
import SeasonArchive from "./SeasonMetrics";
import LiveTracker from "./Tracker";
import { MenuItem, Select } from "@mui/material";
import { useGsapReveal } from "./hooks/useGsapReveal";

const IntensityCharts = dynamic(() => import('./ArchiveCharts').then((mod) => mod.IntensityCharts), {
  ssr: false,
});

const Interface = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { 
    basin, 
    setBasin, 
    year, 
    setYear, 
    stormId, 
    setStormId, 
    season, 
    tracker
  } = useAppContext();

  const startYear = useMemo(() => basin === 'atl' ? 1850 : 1948, [basin]);
  const years = useMemo(() => new Array(2025 - startYear).fill(0), [startYear]);

  const stormIds = useMemo(() => {
    if (season) {
      return season.map((storm) => storm.id);
    }
    return null;
  }, [season]);

  useGsapReveal(containerRef, [basin, year, tracker], {
    stagger: 0.065,
    y: 18,
  });

  return (
    <div className="interface-scroll">
      <div ref={containerRef} className="interface">
        <div data-gsap-reveal className="drag-handle" />
        {!tracker && (
          <>
            <div className="selectors">
              <Select
                className="select min-w-[7.5rem]"
                size="small"
                value={basin}
                onChange={(e) => {
                  setBasin(e.target.value);
                }}
              >
                <MenuItem value="atl">
                  <p className="text-black font-bold">Atlantic</p>
                </MenuItem>
                <MenuItem value="pac">
                  <p className="text-black font-bold">Pacific</p>
                </MenuItem>
              </Select>
              <Select
                className="select min-w-[5.5rem]"
                size="small"
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                }}
              >
                {years.map((_, index) => {
                  const selectedYear = 2025 - index;
                  return (
                    <MenuItem key={index} value={selectedYear}>
                      <p className="text-black font-bold">{selectedYear}</p>
                    </MenuItem>
                  );
                })}
              </Select>
              <Select
                className="select min-w-[6.5rem]"
                size="small"
                value={stormId}
                onChange={(e) => {
                  setStormId(e.target.value);
                }}
                disabled={!stormIds?.length}
              >
                {stormIds?.map((id) => {
                  const name = id.split("_")[1];
                  return (
                    <MenuItem key={id} value={id}>
                      <p className="text-black font-bold">{name}</p>
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
            <div
              data-gsap-reveal
              className="w-full flex flex-col items-center overflow-hidden gap-3 p-3 archive-panel-shell"
            >
              <SeasonArchive />
              <div key={stormId} className="w-full flex flex-col items-center">
                <StormArchive />
              </div>
            </div>
            <div className="lg:hidden w-full">
              <IntensityCharts />
            </div>
          </>
        )}
        {tracker && <LiveTracker />}
      </div>
    </div>
  );
};

export default Interface;
