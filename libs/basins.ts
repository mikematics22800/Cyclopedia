export const BASINS = {
  atl: { label: 'Atlantic', startYear: 1851, endYear: 2025, nested: false },
  epac: { label: 'E Pacific', startYear: 1949, endYear: 2025, nested: false },
  wpac: { label: 'W Pacific', startYear: 1945, endYear: 2024, nested: false },
  ind: { label: 'N Indian', startYear: 1945, endYear: 2024, nested: false },
  shem: { label: 'S Hemisphere', startYear: 1945, endYear: 2024, nested: false },
} as const;

export type BasinId = keyof typeof BASINS;

/** Years in a basin's nominal range with no archive file on disk. */
export const BASIN_MISSING_YEARS: Record<BasinId, readonly number[]> = {
  atl: [],
  epac: [],
  wpac: [],
  ind: [1958],
  shem: [],
};

export const END_YEAR = Math.max(...Object.values(BASINS).map((b) => b.endYear));

/** Legacy basin code kept for cached API/localStorage requests. */
export const BASIN_ALIASES: Record<string, BasinId> = {
  pac: 'epac',
};

export function resolveBasinId(basin: string): BasinId | undefined {
  if (basin in BASINS) return basin as BasinId;
  return BASIN_ALIASES[basin];
}

const STORM_PREFIX_TO_BASIN: Record<string, BasinId> = {
  AL: 'atl',
  EP: 'epac',
  CP: 'epac',
  WP: 'wpac',
  IO: 'ind',
  SH: 'shem',
};

export function getBasinFromStormId(stormId: string): BasinId | undefined {
  return STORM_PREFIX_TO_BASIN[stormId.slice(0, 2)];
}

export function getBasinYears(basin: string): number[] {
  const id = resolveBasinId(basin);
  if (!id) return [];

  const { startYear, endYear } = BASINS[id];
  const missing = new Set(BASIN_MISSING_YEARS[id]);
  const years: number[] = [];

  for (let y = startYear; y <= endYear; y++) {
    if (!missing.has(y)) years.push(y);
  }

  return years;
}

export function isBasinYearAvailable(basin: string, year: number): boolean {
  return getBasinYears(basin).includes(year);
}

export function getAvailableBasinsForYear(year: number): BasinId[] {
  return (Object.keys(BASINS) as BasinId[]).filter((id) =>
    isBasinYearAvailable(id, year),
  );
}

export function getBasinStartYear(basin: string): number {
  const years = getBasinYears(basin);
  return years[0] ?? END_YEAR;
}

export function getBasinEndYear(basin: string): number {
  const years = getBasinYears(basin);
  return years[years.length - 1] ?? END_YEAR;
}

export function clampBasinYear(basin: string, year: number): number {
  const years = getBasinYears(basin);
  if (!years.length) return year;
  if (years.includes(year)) return year;
  if (year < years[0]) return years[0];
  if (year > years[years.length - 1]) return years[years.length - 1];

  return years.reduce((nearest, candidate) =>
    Math.abs(candidate - year) < Math.abs(nearest - year) ? candidate : nearest,
  );
}

export function getGlobalYears(): number[] {
  const years = new Set<number>();
  for (const id of Object.keys(BASINS) as BasinId[]) {
    for (const year of getBasinYears(id)) {
      years.add(year);
    }
  }
  return [...years].sort((a, b) => a - b);
}

export function getGlobalStartYear(): number {
  const years = getGlobalYears();
  return years[0] ?? END_YEAR;
}

export function getGlobalEndYear(): number {
  const years = getGlobalYears();
  return years[years.length - 1] ?? END_YEAR;
}

export function isGlobalYearAvailable(year: number): boolean {
  return getGlobalYears().includes(year);
}

export function clampGlobalYear(year: number): number {
  const years = getGlobalYears();
  if (!years.length) return year;
  if (years.includes(year)) return year;
  if (year < years[0]) return years[0];
  if (year > years[years.length - 1]) return years[years.length - 1];

  return years.reduce((nearest, candidate) =>
    Math.abs(candidate - year) < Math.abs(nearest - year) ? candidate : nearest,
  );
}

export function getArchiveFilePath(basin: string, year: number): string | null {
  const id = resolveBasinId(basin);
  if (!id) return null;

  const { nested } = BASINS[id];
  const yearStr = String(year);

  if (nested) {
    return ['archive', id, yearStr, `${yearStr}.json`].join('/');
  }

  return ['archive', id, `${yearStr}.json`].join('/');
}
