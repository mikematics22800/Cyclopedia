import {
  BASINS,
  type BasinId,
  getArchiveFilePath,
  getAvailableBasinsForYear,
  isBasinYearAvailable,
  isGlobalYearAvailable,
  resolveBasinId,
} from './basins';

interface FetchOptions {
  method: string;
  headers: {
    'Content-Type': string;
  };
}

interface WindRadii {
  ne: number;
  se: number;
  sw: number;
  nw: number;
}

interface StormDataPoint {
  date: number;
  time_utc: number;
  status: string | null;
  max_wind_kt: number | null;
  record?: string | null;
  min_pressure_mb?: number | null;
  lat: number;
  lng: number;
  '34kt_wind_nm'?: WindRadii;
  '50kt_wind_nm'?: WindRadii;
  '64kt_wind_nm'?: WindRadii;
}

interface Storm {
  id: string;
  data: StormDataPoint[];
  retired: boolean;
  cost_usd: number;
  dead_or_missing: number;
}

type YearArchives = Record<BasinId, Storm[]>;

const options: FetchOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const inflight = new Map<string, Promise<YearArchives>>();

export const getArchive = async (
  basin: string,
  year: number,
): Promise<Storm[] | undefined> => {
  if (!isBasinYearAvailable(basin, year)) return [];

  const relativePath = getArchiveFilePath(basin, year);
  if (!relativePath) return [];

  try {
    const response = await fetch(`/${relativePath}`, options);
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? (data as Storm[]) : [];
  } catch (err) {
    console.error('Server error', err);
  }
};

export const getYearArchive = async (year: number): Promise<YearArchives> => {
  if (!isGlobalYearAvailable(year)) {
    return {} as YearArchives;
  }

  const inflightKey = String(year);
  const pending = inflight.get(inflightKey);
  if (pending) return pending;

  const promise = (async () => {
    const archives = {} as YearArchives;
    const availableBasins = getAvailableBasinsForYear(year);

    for (const basinId of Object.keys(BASINS) as BasinId[]) {
      if (!isBasinYearAvailable(basinId, year)) {
        archives[basinId] = [];
      }
    }

    try {
      const results = await Promise.all(
        availableBasins.map(async (basinId) => {
          const storms = await getArchive(basinId, year);
          return { basinId, storms };
        }),
      );

      if (results.some(({ storms }) => storms === undefined)) {
        return {} as YearArchives;
      }

      for (const { basinId, storms } of results) {
        archives[basinId] = storms ?? [];
      }

      return archives;
    } catch (err) {
      console.error('Server error', err);
      return {} as YearArchives;
    }
  })();

  inflight.set(inflightKey, promise);

  try {
    return await promise;
  } finally {
    inflight.delete(inflightKey);
  }
};

export const getBasinSeason = (
  archives: YearArchives,
  basin: string,
): Storm[] => {
  const basinId = resolveBasinId(basin);
  if (!basinId) return [];
  return archives[basinId] ?? [];
};

export const getAllBasinSeasons = (
  archives: YearArchives,
  year: number,
): Storm[] =>
  getAvailableBasinsForYear(year).flatMap(
    (basinId) => archives[basinId] ?? [],
  );

export const getStormOrigin = (storm: Storm): { lat: number; lng: number } | null => {
  for (const point of storm.data) {
    const lat = Number(point.lat);
    const lng = Number(point.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }
  return null;
};

export const getStormYear = (stormId: string): number => {
  const match = stormId.match(/^[A-Z]{2}\d{2}(\d{4})_/);
  return match ? Number(match[1]) : 0;
};

export type { Storm, StormDataPoint, WindRadii, YearArchives };
