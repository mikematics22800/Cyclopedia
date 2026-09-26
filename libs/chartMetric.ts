export type ChartMetric = 'wind' | 'pressure' | 'ace' | 'cyclones';

export function chartMetricOf(dataset: object): ChartMetric | undefined {
  const metric = (dataset as { metric?: unknown }).metric;
  if (metric === 'wind' || metric === 'pressure' || metric === 'ace' || metric === 'cyclones') {
    return metric;
  }
  return undefined;
}
