'use client';

import { useEffect, useState } from 'react';

export type YearTotal = {
  year: number;
  count: number;
  ACE: number;
};

/** `null` while loading; array (possibly empty) once settled. */
export function useBasinTotals(basin: string): YearTotal[] | null {
  const [totals, setTotals] = useState<YearTotal[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTotals(null);

    async function loadTotals() {
      try {
        const response = await fetch(`/archive/${basin}/totals.json`);
        if (!response.ok) {
          if (!cancelled) setTotals([]);
          return;
        }
        const data: YearTotal[] = await response.json();
        if (!cancelled) setTotals(data);
      } catch {
        if (!cancelled) setTotals([]);
      }
    }

    loadTotals();

    return () => {
      cancelled = true;
    };
  }, [basin]);

  return totals;
}
