'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getArchive } from "../libs/hurdat";
import { calculateSeasonACE } from "../libs/calculateACE";
import { AppProvider } from "../contexts/AppContext";
import Interface from "../components/Interface";
const Map = dynamic(() => import("./Map"), { ssr: false });
import Globe from "../components/Globe";
import LoadingScreen from "../components/LoadingScreen";
import MapLegend from "./MapLegend";
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import { IconButton, Tooltip } from "@mui/material";
import Graphs from "./Graphs";

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
  const [graphs, setGraphs] = useState<boolean>(false);
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

  const toggleGraphs = useCallback(() => {
    setGraphs(prev => !prev);
  }, []);

  const toggleGlobe = useCallback(() => {
    setGlobe(prev => !prev);
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
    graphs,
    toggleGraphs,
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
    graphs,
    toggleGraphs,
    globe,
    setGlobe
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
              <div className="hidden lg:block">
                <Interface/>
              </div>
              {graphs ? <Graphs/> : <div className="w-full">
                {globe ? <Globe/> : <Map/>}
                <div className="map-controls-container">
                  <MapLegend />
                  <Tooltip
                    title={globe ? "Map" : "Globe"}
                    placement="bottom"
                    arrow
                  >
                    <div
                      className="map-button cursor-pointer"
                      onClick={toggleGlobe}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleGlobe();
                        }
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGlobe();
                        }}
                      >
                        {!globe ? <PublicIcon className="!text-2xl text-white" /> : <MapIcon className="!text-2xl text-white" />}
                      </IconButton>
                      </div>
                    </Tooltip>
                </div>
              </div>}
            </div>
          </>
        ) : (
          <LoadingScreen />
        )}
      </div>
    </AppProvider>
  );
}
