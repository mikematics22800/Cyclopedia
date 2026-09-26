'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Storm } from '../libs/hurdat';
import { t, type Lang, type MessageKey } from '../libs/i18n';

interface AppContextType {
  basin: string;
  selectBasin: (basin: string) => void;
  year: number;
  selectYear: (year: number) => void;
  season: Storm[] | null;
  globalSeason: Storm[] | null;
  displaySeason: Storm[] | null;
  isolateBasin: boolean;
  setIsolateBasin: (isolateBasin: boolean) => void;
  isolateStorm: boolean;
  setIsolateStorm: (isolateStorm: boolean) => void;
  storm: Storm | null;
  stormId: string;
  focusToken: number;
  setStormId: (stormId: string, options?: { focus?: boolean }) => void;
  selectStorm: (stormId: string) => void;
  dates: string[];
  windField: boolean;
  setWindField: (windField: boolean) => void;
  names: string[];
  maxWinds: number[];
  seasonACE: number[];
  charts: boolean;
  toggleCharts: () => void;
  globe: boolean;
  setGlobe: (globe: boolean) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export function useT() {
  const { lang } = useAppContext();
  return (key: MessageKey, vars?: Record<string, string | number>) => t(lang, key, vars);
}

interface AppProviderProps {
  children: ReactNode;
  value: AppContextType;
}

export const AppProvider = ({ children, value }: AppProviderProps) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
