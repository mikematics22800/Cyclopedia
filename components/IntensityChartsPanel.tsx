'use client';

import { useState } from 'react';
import SeasonIntensity from './SeasonIntensity';
import Intensity from './Intensity';
import { STORM_INTENSITY_PAIR_OPTIONS, type StormIntensityMetricPair } from './intensityMetricPair';

/** Season + storm intensity charts with one shared metric pairing control. */
export default function IntensityChartsPanel() {
  const [pairing, setPairing] = useState<StormIntensityMetricPair>('wind-pressure');

  return (
    <div className="chart-wrapper chart-wrapper--stacked w-full">
      <div className="chart flex w-full flex-col gap-4">
        <div
          className="flex flex-wrap justify-center gap-1.5 shrink-0"
          role="group"
          aria-label="Intensity metric pairing"
        >
          {STORM_INTENSITY_PAIR_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPairing(id)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors sm:text-sm ${
                pairing === id
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/15 bg-slate-900/40 text-white/80 hover:border-white/25 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <SeasonIntensity pairing={pairing} />
        <Intensity pairing={pairing} />
      </div>
    </div>
  );
}
