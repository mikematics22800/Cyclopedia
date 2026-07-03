'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Storm } from '../libs/hurdat';

interface AppContextType {
  basin: string;
  selectBasin: (basin: string) => void;
  year: number;
  selectYear: (year: number) => void;
  season: Storm[] | null;
  globalSeason: Storm[] | null;
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
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

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
