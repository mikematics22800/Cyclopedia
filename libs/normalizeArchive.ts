import { Storm } from './hurdat';

function normalizeRetired(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

export function normalizeArchiveData(data: unknown): Storm[] {
  if (!Array.isArray(data)) return [];

  return data.map((storm) => {
    if (!storm || typeof storm !== 'object') return storm;

    const record = storm as Record<string, unknown>;
    delete record.image;

    const normalized: Record<string, unknown> = { ...record };

    if (normalized.dead_or_missing === undefined && normalized.dead_or_mising !== undefined) {
      normalized.dead_or_missing = normalized.dead_or_mising;
    }
    delete normalized.dead_or_mising;

    if ('retired' in normalized) {
      normalized.retired = normalizeRetired(normalized.retired);
    }

    if (Array.isArray(normalized.data)) {
      normalized.data = normalized.data.map((point) => {
        if (!point || typeof point !== 'object') return point;
        const trackPoint = { ...(point as Record<string, unknown>) };
        if (typeof trackPoint.date === 'string') {
          trackPoint.date = Number(trackPoint.date);
        }
        if (trackPoint.lat != null && typeof trackPoint.lat !== 'number') {
          trackPoint.lat = Number(trackPoint.lat);
        }
        if (trackPoint.lng != null && typeof trackPoint.lng !== 'number') {
          trackPoint.lng = Number(trackPoint.lng);
        }
        return trackPoint;
      });
    }

    return normalized as unknown as Storm;
  });
}
