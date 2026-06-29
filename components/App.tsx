'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import Image from 'next/image';
import { getArchive } from "../libs/hurdat";
import { calculateSeasonACE } from "../libs/calculateACE";
import { AppProvider } from "../contexts/AppContext";
import Interface from "../components/Interface";
import LoadingScreen from "../components/LoadingScreen";
import Tracker from "./Tracker";
import Charts from "./Charts";

export default function App() {
  const [basin, setBasin] = useState<string>('atl');
  const [year, setYear] = useState<number>(2025);
  const [season, setSeason] = useState<any[] | null>(null);
  const [storm, setStorm] = useState<any | null>(null);
  const [stormId, setStormId] = useState<string>('');
  const [dates, setDates] = useState<string[]>([]);
  const [windField, setWindField] = useState<boolean>(year >= 2004);
  const [names, setNames] = useState<string[]>([]);
  const [seasonACE, setSeasonACE] = useState<number[]>([]);
  const [charts, setCharts] = useState<boolean>(false);
  const [maxWinds, setMaxWinds] = useState<number[]>([]);
  const [globe, setGlobe] = useState(false)
  

  useEffect(() => {
    if (year < 1949 && basin === 'pac') setYear(1949);
    if (typeof window !== 'undefined') {
      const cache = localStorage.getItem(`cyclopedia-${basin}-${year}`);
      if (cache) {
        setSeason(JSON.parse(cache));
      } else {
        setSeason(null);
        setStorm(null);
        setStormId('');
        getArchive(basin, year).then(data => {
          if (data) {
            setSeason(data);
            localStorage.setItem(`cyclopedia-${basin}-${year}`, JSON.stringify(data));
          }
        });
      }
    }
  }, [basin, year]);

  useEffect(() => {
    setWindField(year >= 2004);
  }, [year]);

  useLayoutEffect(() => {
    if (!season?.length) return;
    setStormId((prev) => {
      if (!prev || prev === 'season' || !season.some((s) => s.id === prev)) {
        return season[0].id;
      }
      return prev;
    });
  }, [season]);

  useEffect(() => {
    if (season && stormId) {
      const found = season.find((s) => s.id === stormId);
      setStorm(found ?? null);
    } else {
      setStorm(null);
    }
  }, [stormId, season]);

  useEffect(() => {
    if (storm) {
      const dates = storm.data.map((point: any) => {
        const dateArray = point?.date.toString().split("");
        const month = dateArray.slice(4,6).join("");
        const day = dateArray.slice(-2).join("");
        return `${month}/${day}`;
      });
      setDates(dates);
    } else {
      setDates([]);
    }
  }, [storm, year]);

  useEffect(() => {
    if (season) {
      const names = season.map((storm) => {
        return storm.id.split('_')[1];
      });
      setNames(names);
  
      const maxWinds = season.map((storm) => {
        const winds = storm.data.map((point: any) => {
          return point.max_wind_kt;
        });
        return Math.max(...winds);
      });
      setMaxWinds(maxWinds);
  
      setSeasonACE(calculateSeasonACE(season));
    }
  }, [season, year]);

  const toggleCharts = useCallback(() => {
    setCharts(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    basin,
    setBasin, 
    year, 
    setYear, 
    season, 
    storm, 
    stormId, 
    setStormId, 
    dates, 
    windField, 
    setWindField,
    names,
    maxWinds,
    seasonACE,
    charts,
    toggleCharts,
    globe,
    setGlobe
  }), [
    basin,
    setBasin,
    year,
    setYear,
    season,
    storm,
    stormId,
    setStormId,
    dates,
    windField,
    setWindField,
    names,
    maxWinds,
    seasonACE,
    charts,
    toggleCharts,
    globe,
    setGlobe
  ]);

  return (
    <AppProvider value={value}>
      <div className="app app-background">
        {season && storm ? (
          <>
            <nav aria-label="Site header">
              <div className="flex items-center gap-2">
                <Image
                  src="/cyclone.png"
                  alt="Cyclopedia"
                  width={40}
                  height={40}
                  priority
                  unoptimized
                />
                <h1 className="storm-font text-4xl text-white italic tracking-tight">
                  CYCLOPEDIA
                </h1>
              </div>
              <div className="nav-buttons shrink-0">
                <button
                  type="button"
                  className={`font-bold nav-button${!charts ? ' nav-button--selected' : ''}`}
                  onClick={() => setCharts(false)}
                  aria-pressed={!charts}
                >
                  Tracking Maps
                </button>
                <button
                  type="button"
                  className={`font-bold nav-button${charts ? ' nav-button--selected' : ''}`}
                  onClick={() => setCharts(true)}
                  aria-pressed={charts}
                >
                  Intensity Charts
                </button>
              </div>
            </nav>
            <div className="desktop-view">
              <Interface />
              {!charts ? <Tracker /> : <Charts />}
            </div>
            <div className="mobile-view">
              <Tracker />
              <Interface mobileSheet />
            </div>
          </>
        ) : (
          <LoadingScreen />
        )}
      </div>
    </AppProvider>
  );
}
