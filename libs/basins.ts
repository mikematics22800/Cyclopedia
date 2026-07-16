export const BASINS = {
  n_atlantic: { label: 'N Atlantic', startYear: 1851, endYear: 2025, nested: false },
  e_pacific: { label: 'E Pacific', startYear: 1876, endYear: 2025, nested: false },
  w_pacific: { label: 'W Pacific', startYear: 1884, endYear: 2024, nested: false },
  n_indian: { label: 'N Indian', startYear: 1842, endYear: 2024, nested: false },
  s_indian: { label: 'S Indian', startYear: 1848, endYear: 2025, nested: false },
  s_pacific: { label: 'S Pacific', startYear: 1897, endYear: 2025, nested: false },
  s_atlantic: { label: 'S Atlantic', startYear: 2004, endYear: 2011, nested: false },
} as const;

export type BasinId = keyof typeof BASINS;

/** Years in a basin's nominal range with no archive file on disk. */
export const BASIN_MISSING_YEARS: Record<BasinId, readonly number[]> = {
  n_atlantic: [],
  e_pacific: [
    1877, 1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889,
    1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1903,
    1904, 1905, 1906, 1907, 1908, 1909, 1910, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931,
    1932, 1933, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1947,
    1948,
  ],
  w_pacific: [],
  n_indian: [
    1843, 1844, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1855, 1856, 1857,
    1858, 1859, 1860, 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868, 1869, 1870,
    1871, 1872, 1873, 1874, 1875, 1876,
  ],
  s_indian: [1849, 1850, 1853],
  s_pacific: [1903, 1904],
  s_atlantic: [2005, 2006, 2007, 2008, 2009],
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

/** Legacy basin codes kept for cached requests and deep links. */
export const BASIN_ALIASES: Record<string, BasinId> = {
  atl: 'n_atlantic',
  epac: 'e_pacific',
  pac: 'e_pacific',
  wpac: 'w_pacific',
  ind: 'n_indian',
  shem: 's_indian',
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
  SA: 's_atlantic',
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

export function getTotalsFilePath(basin: string): string | null {
  const id = resolveBasinId(basin);
  if (!id) return null;

  return ['archive', id, 'totals.json'].join('/');
}
