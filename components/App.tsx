'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAllBasinSeasons,
  getBasinSeason,
  getYearArchive,
  type YearArchives,
} from "../libs/hurdat";
import { calculateSeasonACE } from "../libs/calculateACE";
import {
  clampGlobalYear,
  getAvailableBasinsForYear,
  getBasinFromStormId,
  getGlobalEndYear,
  getGlobalStartYear,
  isBasinYearAvailable,
} from "../libs/basins";
import { AppProvider } from "../contexts/AppContext";
import { PlaybackProvider } from "../contexts/PlaybackContext";
import Interface from "../components/Interface";
import LoadingScreen from "../components/LoadingScreen";
import Tracker from "./Tracker";
import Charts from "./Charts";

export default function App() {
  const [basin, setBasin] = useState<string>('n_atlantic');
  const [year, setYear] = useState<number>(2025);
  const [yearArchives, setYearArchives] = useState<YearArchives | null>(null);
  const [stormIdRequest, setStormIdRequest] = useState<string>('');
  const [focusToken, setFocusToken] = useState(0);
  const [windField, setWindField] = useState<boolean>(year >= 2002);
  const [charts, setCharts] = useState<boolean>(false);
  const [globe, setGlobe] = useState(false);

  const season = useMemo(() => {
    if (!yearArchives) return null;
    const storms = getBasinSeason(yearArchives, basin);
    return storms.length ? storms : null;
  }, [yearArchives, basin]);

  const globalSeason = useMemo(() => {
    if (!yearArchives) return null;
    const storms = getAllBasinSeasons(yearArchives, year);
    return storms.length ? storms : null;
  }, [yearArchives, year]);

  const stormId = useMemo(() => {
    if (!season?.length) return '';
    if (stormIdRequest && season.some((s) => s.id === stormIdRequest)) {
      return stormIdRequest;
    }
    return season[0].id;
  }, [season, stormIdRequest]);

  const storm = useMemo(() => {
    if (!globalSeason?.length || !stormId) return null;
    return globalSeason.find((s) => s.id === stormId) ?? null;
  }, [globalSeason, stormId]);

  const dates = useMemo(() => {
    if (!storm) return [];
    return storm.data.map((point) => {
      const dateArray = point.date.toString().split("");
      const month = dateArray.slice(4, 6).join("");
      const day = dateArray.slice(-2).join("");
      return `${month}/${day}`;
    });
  }, [storm]);

  const names = useMemo(() => {
    if (!season) return [];
    return season.map((s) => s.id.split('_')[1]);
  }, [season]);

  const maxWinds = useMemo(() => {
    if (!season) return [];
    return season.map((s) => {
      const winds = s.data
        .map((point) => point.max_wind_kt)
        .filter((wind): wind is number => wind != null);
      return winds.length ? Math.max(...winds) : 0;
    });
  }, [season]);

  const seasonACE = useMemo(() => {
    if (!season) return [];
    return calculateSeasonACE(season);
  }, [season]);

  const requestMapFocus = useCallback(() => {
    setFocusToken((token) => token + 1);
  }, []);

  const selectBasin = useCallback((newBasin: string) => {
    setBasin((current) => (current === newBasin ? current : newBasin));
    setStormIdRequest('');
    requestMapFocus();
  }, [requestMapFocus]);

  const selectYear = useCallback((newYear: number) => {
    setYear((current) => (current === newYear ? current : newYear));
    setStormIdRequest('');
    setWindField(newYear >= 2002);
    requestMapFocus();
  }, [requestMapFocus]);

  const setStormId = useCallback((id: string, options?: { focus?: boolean }) => {
    setStormIdRequest(id);
    if (options?.focus ?? true) {
      requestMapFocus();
    }
  }, [requestMapFocus]);

  const selectStorm = useCallback((id: string) => {
    const stormBasin = getBasinFromStormId(id);
    if (stormBasin) {
      setBasin(stormBasin);
    }
    setStormIdRequest(id);
  }, []);

  useEffect(() => {
    if (isBasinYearAvailable(basin, year)) return;
    const availableBasins = getAvailableBasinsForYear(year);
    const nextBasin = availableBasins[0];
    if (!nextBasin || nextBasin === basin) return;
    setBasin(nextBasin);
    setStormIdRequest('');
  }, [year, basin]);

  useEffect(() => {
    const startYear = getGlobalStartYear();
    const endYear = getGlobalEndYear();
    if (year < startYear || year > endYear) {
      setYear(clampGlobalYear(year));
      return;
    }

    let cancelled = false;
    setYearArchives(null);
    getYearArchive(year).then((data) => {
      if (!cancelled) setYearArchives(data);
    });

    return () => {
      cancelled = true;
    };
  }, [year]);

  const toggleCharts = useCallback(() => {
    setCharts((prev) => !prev);
  }, []);

  const value = useMemo(() => ({
    basin,
    selectBasin,
    year,
    selectYear,
    season,
    globalSeason,
    storm,
    stormId,
    focusToken,
    setStormId,
    selectStorm,
    dates,
    windField,
    setWindField,
    names,
    maxWinds,
    seasonACE,
    charts,
    toggleCharts,
    globe,
    setGlobe,
  }), [
    basin,
    selectBasin,
    year,
    selectYear,
    season,
    globalSeason,
    storm,
    stormId,
    focusToken,
    setStormId,
    selectStorm,
    dates,
    windField,
    names,
    maxWinds,
    seasonACE,
    charts,
    toggleCharts,
    globe,
  ]);

  return (
    <AppProvider value={value}>
      <PlaybackProvider globalSeason={globalSeason} year={year}>
      <div className="app relative">
        <img
          src="/hurricane.jpg"
          alt=""
          aria-hidden
          className="app-background"
        />
        {globalSeason && storm ? (
          <>
            <nav aria-label="Site header">
              <div className="flex items-center gap-2">
                <img
                  src="/cyclone.png"
                  alt="Cyclopedia"
                  width={40}
                  height={40}
                />
                <h1 className="storm-font">
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
      </PlaybackProvider>
    </AppProvider>
  );
}
