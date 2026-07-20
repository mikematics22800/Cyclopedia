export const BASINS = {
  n_atlantic: { label: 'N Atlantic', startYear: 1851, endYear: 2025, nested: false },
  e_pacific: { label: 'E Pacific', startYear: 1949, endYear: 2025, nested: false },
  w_pacific: { label: 'W Pacific', startYear: 1945, endYear: 2024, nested: false },
  n_indian: { label: 'N Indian', startYear: 1945, endYear: 2024, nested: false },
  s_indian: { label: 'S Indian', startYear: 1945, endYear: 2024, nested: false },
  s_pacific: { label: 'S Pacific', startYear: 1945, endYear: 2024, nested: false },
} as const;

export type BasinId = keyof typeof BASINS;

/** Years in a basin's nominal range with no archive file on disk. */
export const BASIN_MISSING_YEARS: Record<BasinId, readonly number[]> = {
  n_atlantic: [],
  e_pacific: [],
  w_pacific: [],
  n_indian: [1958],
  s_indian: [],
  s_pacific: [],
};

/**
 * First season year with complete wind metrics on every track point for
 * reliable basin ACE totals (derived from archive wind coverage).
 */
export const ACE_START_YEAR_BY_BASIN: Partial<Record<BasinId, number>> = {
  w_pacific: 1973,
  n_indian: 1981,
  s_indian: 1992,
  s_pacific: 1992,
};

export function isAceYearAvailable(basin: string, year: number): boolean {
  const id = resolveBasinId(basin);
  if (!id) return true;

  const startYear = ACE_START_YEAR_BY_BASIN[id];
  return startYear == null || year >= startYear;
}

export const END_YEAR = Math.max(...Object.values(BASINS).map((b) => b.endYear));

/** Legacy basin code aliases. */
export const BASIN_ALIASES: Record<string, BasinId> = {
  atl: 'n_atlantic',
  epac: 'e_pacific',
  wpac: 'w_pacific',
  ind: 'n_indian',
  shem: 's_indian',
  pac: 'e_pacific',
};

export function resolveBasinId(basin: string): BasinId | undefined {
  if (basin in BASINS) return basin as BasinId;
  return BASIN_ALIASES[basin];
}

const STORM_PREFIX_TO_BASIN: Record<string, BasinId> = {
  AL: 'n_atlantic',
  EP: 'e_pacific',
  CP: 'e_pacific',
  WP: 'w_pacific',
  IO: 'n_indian',
  SI: 's_indian',
  SP: 's_pacific',
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
