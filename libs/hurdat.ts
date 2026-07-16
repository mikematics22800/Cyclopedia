import { openDB, type IDBPDatabase } from 'idb';
import {
  BASINS,
  type BasinId,
  getArchiveFilePath,
  getAvailableBasinsForYear,
  isBasinYearAvailable,
  isGlobalYearAvailable,
  resolveBasinId,
} from './basins';
import { normalizeArchiveData } from './normalizeArchive';

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
  status: string;
  max_wind_kt: number;
  record?: string;
  min_pressure_mb?: number;
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

const DB_NAME = 'cyclopedia-new-archive';
const STORE_NAME = 'storms';
const DB_VERSION = 1;

const options: FetchOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

let dbPromise: Promise<IDBPDatabase> | null = null;

const memoryCache = new Map<string, Storm[]>();
const inflight = new Map<string, Promise<YearArchives>>();

const cacheKey = (year: number, basin: string) => `cyclopedia-${year}-${basin}`;

function getDB(): Promise<IDBPDatabase> | null {
  if (typeof window === 'undefined') return null;

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }

  return dbPromise;
}

async function readFromIndexedDB(key: string): Promise<Storm[] | undefined> {
  const db = getDB();
  if (!db) return undefined;

  const cached = await (await db).get(STORE_NAME, key);
  if (!cached) return undefined;

  memoryCache.set(key, cached);
  return cached;
}

async function writeToIndexedDB(key: string, storms: Storm[]): Promise<void> {
  memoryCache.set(key, storms);

  const db = getDB();
  if (!db) return;

  await (await db).put(STORE_NAME, storms, key);
}

async function migrateFromLocalStorage(
  year: number,
  basin: BasinId,
): Promise<Storm[] | undefined> {
  const keys = [cacheKey(year, basin), `cyclopedia-${basin}-${year}`];

  for (const key of keys) {
    const legacy = localStorage.getItem(key);
    if (!legacy) continue;

    try {
      const storms = JSON.parse(legacy) as Storm[];
      localStorage.removeItem(key);
      await writeToIndexedDB(cacheKey(year, basin), storms);
      return storms;
    } catch {
      localStorage.removeItem(key);
    }
  }

  return undefined;
}

async function readBasinFromCache(
  year: number,
  basin: BasinId,
): Promise<Storm[] | undefined> {
  const key = cacheKey(year, basin);

  return (
    memoryCache.get(key) ??
    (await readFromIndexedDB(key)) ??
    (typeof window !== 'undefined'
      ? await migrateFromLocalStorage(year, basin)
      : undefined)
  );
}

async function readCachedYearArchives(year: number): Promise<YearArchives | null> {
  const archives = {} as YearArchives;

  for (const basinId of Object.keys(BASINS) as BasinId[]) {
    if (!isBasinYearAvailable(basinId, year)) {
      archives[basinId] = [];
      continue;
    }

    const storms = await readBasinFromCache(year, basinId);
    if (storms === undefined) return null;
    archives[basinId] = storms;
  }

  return archives;
}

async function writeYearArchivesToCache(
  year: number,
  archives: YearArchives,
): Promise<void> {
  await Promise.all(
    (Object.keys(BASINS) as BasinId[])
      .filter((basinId) => isBasinYearAvailable(basinId, year))
      .map((basinId) =>
        writeToIndexedDB(cacheKey(year, basinId), archives[basinId] ?? []),
      ),
  );
}

export const getYearArchive = async (
  year: number,
): Promise<YearArchives | undefined> => {
  if (!isGlobalYearAvailable(year)) {
    return undefined;
  }

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
      return undefined;
    }

    for (const { basinId, storms } of results) {
      archives[basinId] = storms ?? [];
    }

    return archives;
  } catch (err) {
    console.error('Server error', err);
  }
};

export const getYearArchiveCached = async (year: number): Promise<YearArchives> => {
  const inflightKey = String(year);
  const pending = inflight.get(inflightKey);
  if (pending) return pending;

  const promise = (async () => {
    const cached = await readCachedYearArchives(year);
    if (cached) return cached;

    const data = await getYearArchive(year);
    if (!data) return {} as YearArchives;

    await writeYearArchivesToCache(year, data);

    return data;
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

export const getArchive = async (basin: string, year: number): Promise<Storm[] | undefined> => {
  if (!isBasinYearAvailable(basin, year)) return [];

  const relativePath = getArchiveFilePath(basin, year);
  if (!relativePath) return [];

  try {
    const response = await fetch(`/${relativePath}`, options);
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return normalizeArchiveData(await response.json());
  } catch (err) {
    console.error('Server error', err);
  }
};

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
