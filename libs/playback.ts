import type { Storm, StormDataPoint } from './hurdat';
import { formatDateTime } from './mapUtils';

/** Sortable archive timestamp: YYYYMMDD * 10000 + HHMM (UTC). */
export function pointTimestamp(date: number, timeUtc: number): number {
  const timeStr = String(timeUtc).padStart(4, '0');
  const normalizedTime = Number(timeStr.slice(0, 2)) * 100 + Number(timeStr.slice(2, 4));
  return Number(date) * 10_000 + normalizedTime;
}

export function pointToTimestamp(point: Pick<StormDataPoint, 'date' | 'time_utc'>): number {
  return pointTimestamp(point.date, point.time_utc);
}

/** Unique sorted timestamps across all storms in a season archive. */
export function buildSeasonTimestamps(storms: Storm[]): number[] {
  const unique = new Set<number>();

  for (const storm of storms) {
    for (const point of storm.data) {
      unique.add(pointToTimestamp(point));
    }
  }

  return Array.from(unique).sort((a, b) => a - b);
}

export type PlaybackSchedule = {
  timestamps: number[];
  /** Parallel to each storm's data array — precomputed point timestamps. */
  stormPointTimestamps: Map<string, number[]>;
};

export function buildPlaybackSchedule(storms: Storm[]): PlaybackSchedule {
  const stormPointTimestamps = new Map<string, number[]>();

  for (const storm of storms) {
    stormPointTimestamps.set(
      storm.id,
      storm.data.map((point) => pointToTimestamp(point)),
    );
  }

  return {
    timestamps: buildSeasonTimestamps(storms),
    stormPointTimestamps,
  };
}

/** Count of points visible at or before timestamp (binary search). Null timestamp = all points. */
export function visiblePointCount(
  pointTimestamps: number[],
  timestamp: number | null,
): number {
  if (timestamp === null) return pointTimestamps.length;
  if (pointTimestamps.length === 0) return 0;

  let lo = 0;
  let hi = pointTimestamps.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (pointTimestamps[mid] <= timestamp) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result + 1;
}

export function decodeTimestamp(timestamp: number): { date: number; time_utc: number } {
  return {
    date: Math.floor(timestamp / 10_000),
    time_utc: timestamp % 10_000,
  };
}

export function formatPlaybackTimestamp(timestamp: number): string {
  const { date, time_utc } = decodeTimestamp(timestamp);
  const { formattedDate, formattedTime } = formatDateTime(date, time_utc);
  return `${formattedDate} ${formattedTime} EST`;
}

export function isPointActiveAtTimestamp(
  point: Pick<StormDataPoint, 'date' | 'time_utc'>,
  timestamp: number | null,
): boolean {
  if (timestamp === null) return true;
  return pointToTimestamp(point) <= timestamp;
}

export function filterPointsUpToTimestamp<T extends Pick<StormDataPoint, 'date' | 'time_utc'>>(
  points: T[],
  timestamp: number | null,
): T[] {
  if (timestamp === null) return points;
  return points.filter((point) => isPointActiveAtTimestamp(point, timestamp));
}
