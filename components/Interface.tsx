'use client';

import { useMemo, useRef } from "react";
import { useAppContext } from "../contexts/AppContext";
import StormArchive from "./StormArchive";
import SeasonArchive from "./SeasonArchive";
import ArchiveCharts from "./ArchiveCharts";
import LiveTracker from "./LiveTracker";
import { MenuItem, Select, Checkbox } from "@mui/material";
import { useGsapReveal } from "./hooks/useGsapReveal";

const Interface = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { 
    basin, 
    setBasin, 
    year, 
    setYear, 
    stormId, 
    setStormId, 
    setWindField, 
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

  useGsapReveal(containerRef, [tracker, stormId, basin, year], {
    stagger: 0.065,
    y: 18,
  });

  return (
    <div ref={containerRef} className="interface">
      <div data-gsap-reveal className="drag-handle" />
      {!tracker && (
        <>
          <div data-gsap-reveal className="selectors">
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
            >
              <MenuItem value={"season"}>
                <p className="text-black font-bold">Season</p>
              </MenuItem>
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
          {year >= 2004 && stormId !== "season" && (
            <div
              data-gsap-reveal
              className="flex items-center gap-2"
            >
              <Checkbox
                className="!text-sky-400 !p-0"
                onChange={(e) => {
                  setWindField(e.target.checked);
                }}
              />
              <span className="text-white text-sm font-bold tracking-wide">
                Wind Field
              </span>
            </div>
          )}
          <div
            key={stormId}
            data-gsap-reveal
            className="w-full flex flex-col items-center"
          >
            {stormId === "season" ? <SeasonArchive /> : <StormArchive />}
          </div>
        </>
      )}
      {tracker && <LiveTracker />}
      {!tracker && (
        <div data-gsap-reveal className="sm:hidden w-full">
          <ArchiveCharts stormId={stormId} />
        </div>
      )}
    </div>
  );
};

export default Interface;
