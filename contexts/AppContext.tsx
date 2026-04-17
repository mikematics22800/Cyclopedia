'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Storm, GeoJSONFeature } from '../libs/hurdat';

interface AppContextType {
  basin: string;
  setBasin: (basin: string) => void;
  year: number;
  setYear: (year: number) => void;
  season: Storm[] | null;
  storm: Storm | null;
  stormId: string;
  setStormId: (stormId: string) => void;
  dates: string[];
  windField: boolean;
  setWindField: (windField: boolean) => void;
  names: string[];
  maxWinds: number[];
  seasonACE: number[];
  liveHurdat: GeoJSONFeature[];
  forecastCone: GeoJSONFeature[];
  tracker: boolean;
  liveStormId: string | null;
  setLiveStormId: (liveStormId: string | null) => void;
  map: boolean;
  toggleCharts: () => void;
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
