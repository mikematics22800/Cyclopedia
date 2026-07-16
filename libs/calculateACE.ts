import type { Storm, StormDataPoint } from './hurdat';

const SYNOPTIC_TIMES = new Set(['0000', '0600', '1200', '1800']);
const ACE_STATUSES = new Set(['TS', 'SS', 'HU', 'TY', 'CY']);
const ACE_MIN_WIND_KT = 34;

function isUnknownMetric(value: number | null | undefined): boolean {
  return value == null || value === 0 || value === -999;
}

export function formatSynopticTime(timeUtc: number | string): string {
  return String(timeUtc).padStart(4, '0');
}

export function isSynopticTime(timeUtc: number | string): boolean {
  return SYNOPTIC_TIMES.has(formatSynopticTime(timeUtc));
}

export function isAceEligible(point: StormDataPoint): boolean {
  return (
    ACE_STATUSES.has(point.status) &&
    !isUnknownMetric(point.max_wind_kt) &&
    point.max_wind_kt >= ACE_MIN_WIND_KT &&
    isSynopticTime(point.time_utc)
  );
}

export function aceContribution(maxWindKt: number): number {
  return maxWindKt ** 2 / 10_000;
}

/** Total ACE for a single storm (NHC synoptic-time formula). */
export function calculateStormACE(data: StormDataPoint[]): number {
  return data.reduce(
    (ace, point) => (isAceEligible(point) ? ace + aceContribution(point.max_wind_kt) : ace),
    0,
  );
}

/** Cumulative ACE at each track point (flat between synoptic contributions). */
export function cumulativeStormACESeries(data: StormDataPoint[]): number[] {
  let ace = 0;
  return data.map((point) => {
    if (isAceEligible(point)) {
      ace += aceContribution(point.max_wind_kt);
    }
    return ace;
  });
}

/** Per-storm ACE values for a season. */
export function calculateSeasonACE(season: Storm[]): number[] {
  return season.map((storm) => calculateStormACE(storm.data));
}

/** Sum of all storm ACE values in a season. */
export function calculateSeasonTotalACE(season: Storm[]): number {
  return calculateSeasonACE(season).reduce((total, ace) => total + ace, 0);
}
