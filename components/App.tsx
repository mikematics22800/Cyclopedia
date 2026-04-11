'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getArchive, getLive, getCone } from "../libs/hurdat";
import { sum } from "../libs/sum";
import { AppProvider } from "../contexts/AppContext";
import Interface from "../components/Interface";
const Map = dynamic(() => import("../components/Map"), { ssr: false });
import ArchiveCharts from "../components/ArchiveCharts";
import LoadingScreen from "../components/LoadingScreen";
import { useGsapReveal } from "../components/hooks/useGsapReveal";

export default function App() {
  const navRef = useRef<HTMLElement>(null);

  const [basin, setBasin] = useState<string>('atl');
  const [year, setYear] = useState<number>(2025);
  const [season, setSeason] = useState<any[] | null>(null);
  const [storm, setStorm] = useState<any | null>(null);
  const [stormId, setStormId] = useState<string>('season');
  const [dates, setDates] = useState<string[]>([]);
  const [windField, setWindField] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);
  const [seasonACE, setSeasonACE] = useState<number[]>([]);
  const [map, setMap] = useState<boolean>(true);
  const [maxWinds, setMaxWinds] = useState<number[]>([]);
  const [liveHurdat, setLiveHurdat] = useState<any[]>([]);
  const [forecastCone, setForecastCone] = useState<any[]>([]);
  const [tracker, setTracker] = useState<boolean>(false);
  const [liveStormId, setLiveStormId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
    getLive().then(data => {
      setLiveHurdat(data || []);
    });
    getCone().then(data => {
      setForecastCone(data || []);
    });  
  }, []);

  useEffect(() => {
    setStormId('season');
    if (year < 1949 && basin === 'pac') setYear(1949);
    if (typeof window !== 'undefined') {
      const cache = localStorage.getItem(`cyclopedia-${basin}-${year}`);
      if (cache) {
        setSeason(JSON.parse(cache));
        const data = JSON.parse(cache);
      } else {
        setSeason(null);
        setStorm(null);
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
    if (season && stormId !== 'season') {
      const storm = season.find(storm => storm.id === stormId);
      setStorm(storm);
    } else if (stormId === 'season') {
      setStorm(null);
    }
  }, [stormId, season]);

  useEffect(() => {
    if (storm && stormId !== 'season') {
      const dates = storm.data.map((point: any) => {
        const dateArray = point?.date.toString().split("");
        const month = dateArray.slice(4,6).join("");
        const day = dateArray.slice(-2).join("");
        return `${month}/${day}`;
      });
      setDates(dates);
    } else if (stormId === 'season') {
      setDates([]);
    }
  }, [storm, year, stormId]);

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

  const toggleTracker = useCallback(() => {
    setTracker(prev => !prev);
  }, []);

  const mainReady = Boolean(season && (stormId === "season" || storm));
  useGsapReveal(navRef, [mainReady], {
    selector: "[data-nav-reveal]",
    y: -12,
    stagger: 0.08,
    delay: 0.06,
  });

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
    liveHurdat,
    forecastCone,
    tracker,
    liveStormId,
    setLiveStormId
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
    liveHurdat,
    forecastCone,
    tracker,  
    liveStormId,
    setLiveStormId
  ]);

  return (
    <AppProvider value={value}>
      <div className="app app-background">
        {season && (stormId === 'season' || storm) ? (
          <>
            <nav ref={navRef}>
              <div data-nav-reveal className="flex items-center gap-2">
                <Image
                  src="/cyclone.png"
                  alt="Cyclopedia"
                  width={40}
                  height={40}
                  className="drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]"
                  priority
                  unoptimized
                />
                <h1 className="storm-font text-3xl sm:text-4xl text-white italic hidden sm:block tracking-tight">
                  CYCLOPEDIA
                </h1>
              </div>
              <div data-nav-reveal className="flex items-center gap-3 sm:gap-4">
                {!tracker && (
                  <button
                    type="button"
                    className="button !hidden sm:!flex"
                    onClick={toggleCharts}
                  >
                    <span>{map ? "Charts" : "Map"}</span>
                  </button>
                )}
                <button type="button" className="button" onClick={toggleTracker}>
                  <span>{tracker ? "Historical Archive" : "Live Tracker"}</span>
                </button>
              </div>
            </nav>
            <div className="desktop-view">
              <Interface/>
              {map ? <Map/> : tracker ? <Map/> : <ArchiveCharts stormId={stormId}/>}
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
