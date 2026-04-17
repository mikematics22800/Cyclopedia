/** Which two metrics to show together on intensity charts (storm timeline or season bars). */
export type StormIntensityMetricPair = 'wind-pressure' | 'wind-ace' | 'pressure-ace';

export const STORM_INTENSITY_PAIR_OPTIONS: { id: StormIntensityMetricPair; label: string }[] = [
  { id: 'wind-pressure', label: 'Wind & Pressure' },
  { id: 'wind-ace', label: 'Wind & ACE' },
  { id: 'pressure-ace', label: 'ACE & Pressure' },
];
