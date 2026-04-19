'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getArchive } from "../libs/hurdat";
import { sum } from "../libs/sum";
import { AppProvider } from "../contexts/AppContext";
import Interface from "../components/Interface";
const Map = dynamic(() => import("../components/Map"), { ssr: false });
import ArchiveCharts from "./Charts";
import LoadingScreen from "../components/LoadingScreen";
export default function App() {
  const [basin, setBasin] = useState<string>('atl');
  const [year, setYear] = useState<number>(2025);
  const [season, setSeason] = useState<any[] | null>(null);
  const [storm, setStorm] = useState<any | null>(null);
  const [stormId, setStormId] = useState<string>('');
  const [dates, setDates] = useState<string[]>([]);
  const [windField, setWindField] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);
  const [seasonACE, setSeasonACE] = useState<number[]>([]);
  const [map, setMap] = useState<boolean>(true);
  const [maxWinds, setMaxWinds] = useState<number[]>([]);
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
  
      const seasonACE = season.map((storm) => {
        let ACE = 0;
        let windArray: number[] = [];
        storm.data.forEach((point: any) => {
          const wind = point.max_wind_kt;
          const hour = point.time_utc;
          if (["TS", "SS", "HU"].includes(point.status)) {
            if (hour % 600 == 0) {
              ACE += Math.pow(wind, 2)/10000;
              if (windArray.length > 0) {
                const average = sum(windArray)/windArray.length;
                ACE += Math.pow(average, 2)/10000;
                windArray = [];
              }
            } else {
              windArray.push(wind);
            }
          }
        });
        return ACE;
      });
      setSeasonACE(seasonACE);
    }
  }, [season, year]);

  const toggleCharts = useCallback(() => {
    setMap(prev => !prev);
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
    map,
    toggleCharts,
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
    map,
    toggleCharts,
  ]);

  return (
    <AppProvider value={value}>
      <div className="app app-background">
        {season && storm ? (
          <>
            <nav>
              <div className="flex items-center gap-2">
                <Image
                  src="/cyclone.png"
                  alt="Cyclopedia"
                  width={40}
                  height={40}
                  priority
                  unoptimized
                />
                <h1 className="storm-font text-3xl lg:text-4xl text-white italic hidden lg:block tracking-tight">
                  CYCLOPEDIA
                </h1>
              </div>
            </nav>
            <div className="desktop-view">
              <Interface/>
              {map ? <Map/> : <ArchiveCharts />}
            </div>
            <div className="mobile-map">
              <Map/>
            </div>  
            <div className="mobile-interface">
              <Interface/>
            </div>
          </>
        ) : (
          <LoadingScreen />
        )}
      </div>
    </AppProvider>
  );
}
