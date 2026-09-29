import type { MessageKey } from './i18n';

/** Wind-speed bands that match the legend's first seven classification rows. */
export const WIND_CATEGORY_ITEMS = [
  {
    maxKt: 33,
    color: 'dodgerblue',
    colorClass: 'bg-[dodgerblue]',
    labelKey: 'tropicalDepression',
    windKey: 'windLt34',
  },
  {
    maxKt: 63,
    color: 'lime',
    colorClass: 'bg-[lime]',
    labelKey: 'tropicalStorm',
    windKey: 'wind34to63',
  },
  {
    maxKt: 82,
    color: 'yellow',
    colorClass: 'bg-[yellow]',
    labelKey: 'category1Hurricane',
    windKey: 'wind64to82',
  },
  {
    maxKt: 95,
    color: 'orange',
    colorClass: 'bg-[orange]',
    labelKey: 'category2Hurricane',
    windKey: 'wind83to95',
  },
  {
    maxKt: 112,
    color: 'red',
    colorClass: 'bg-[red]',
    labelKey: 'category3Hurricane',
    windKey: 'wind96to112',
  },
  {
    maxKt: 136,
    color: 'hotpink',
    colorClass: 'bg-[hotpink]',
    labelKey: 'category4Hurricane',
    windKey: 'wind113to136',
  },
  {
    maxKt: Number.POSITIVE_INFINITY,
    color: 'pink',
    colorClass: 'bg-[pink]',
    labelKey: 'category5Hurricane',
    windKey: 'windGte137',
  },
] as const satisfies readonly {
  maxKt: number;
  color: string;
  colorClass: string;
  labelKey: MessageKey;
  windKey: MessageKey;
}[];

/** CSS color for a storm's peak wind, using the legend category scale. */
export function colorForMaxWindKt(maxWind: number | null): string {
  if (maxWind == null || Number.isNaN(maxWind)) return 'white';
  if (maxWind < 34) return WIND_CATEGORY_ITEMS[0].color;
  const band = WIND_CATEGORY_ITEMS.find((item) => maxWind <= item.maxKt);
  return band?.color ?? WIND_CATEGORY_ITEMS[WIND_CATEGORY_ITEMS.length - 1].color;
}
