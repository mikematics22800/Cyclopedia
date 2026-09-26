'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartEvent,
  type LegendElement,
  type LegendItem,
  type Plugin,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppContext } from '../contexts/AppContext';
import { isAceYearAvailable } from '../libs/basins';
import { chartMetricOf } from '../libs/chartMetric';
import { t } from '../libs/i18n';
import type { YearTotal } from './hooks/useBasinTotals';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type TotalsChartProps = {
  totals: YearTotal[];
};

const COUNT_MAX_BY_BASIN: Record<string, number> = {
  n_atlantic: 35,
  e_pacific: 35,
  n_indian: 20,
  w_pacific: 60,
  s_indian: 35,
  s_pacific: 35,
};

const ACE_MAX_BY_BASIN: Record<string, number> = {
  n_atlantic: 350,
  e_pacific: 350,
  n_indian: 100,
  w_pacific: 600,
  s_indian: 250,
  s_pacific: 200,
};

function pointHighlightColors(
  length: number,
  selectedIndex: number,
  defaultBackground: string,
  defaultBorder: string,
) {
  return {
    pointBackgroundColor: Array.from({ length }, (_, index) =>
      index === selectedIndex ? 'aqua' : defaultBackground,
    ),
    pointBorderColor: Array.from({ length }, (_, index) =>
      index === selectedIndex ? 'aqua' : defaultBorder,
    ),
  };
}

const selectedYearLinePlugin: Plugin<'line'> = {
  id: 'selected-year-line',
  afterDatasetsDraw: (chart) => {
    const selectedYearIndex =
      (chart.options.plugins as { selectedYearLine?: { selectedIndex: number } } | undefined)
        ?.selectedYearLine?.selectedIndex ?? -1;
    if (selectedYearIndex < 0) return;

    const isMobile = chart.options.indexAxis === 'y';
    const categoryScale = isMobile ? chart.scales.y : chart.scales.x;
    const { left, right, top, bottom } = chart.chartArea;
    if (!categoryScale || bottom <= top) return;

    const pixel = categoryScale.getPixelForValue(selectedYearIndex);
    if (!Number.isFinite(pixel)) return;

    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'aqua';
    if (isMobile) {
      ctx.moveTo(left, pixel);
      ctx.lineTo(right, pixel);
    } else {
      ctx.moveTo(pixel, top);
      ctx.lineTo(pixel, bottom);
    }
    ctx.stroke();
    ctx.restore();
  },
};

const TotalsChart = ({ totals }: TotalsChartProps) => {
  const { basin, year, lang } = useAppContext();
  const [showCyclones, setShowCyclones] = useState(true);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 480);
  }, []);

  useEffect(() => {
    setShowCyclones(true);
  }, [basin]);

  const countMax = COUNT_MAX_BY_BASIN[basin] ?? 35;
  const aceMax = ACE_MAX_BY_BASIN[basin] ?? 350;

  const chartTotals = useMemo(() => {
    if (showCyclones) return totals;
    return totals.filter((entry) => isAceYearAvailable(basin, entry.year));
  }, [totals, showCyclones, basin]);

  const selectedYearIndex = useMemo(
    () => chartTotals.findIndex((entry) => entry.year === year),
    [chartTotals, year],
  );

  const chartData = useMemo(() => {
    const primaryAxes = mobile
      ? { xAxisID: 'x' as const, yAxisID: 'y' as const }
      : { yAxisID: 'y' as const };
    const secondaryAxes = mobile
      ? { xAxisID: 'x1' as const, yAxisID: 'y' as const }
      : { yAxisID: 'y1' as const };

    return {
      labels: chartTotals.map((entry) => String(entry.year)),
      datasets: [
        {
          label: t(lang, 'tropicalCyclones'),
          metric: 'cyclones' as const,
          data: chartTotals.map((entry) => entry.count),
          borderColor: 'red',
          backgroundColor: 'pink',
          ...pointHighlightColors(chartTotals.length, selectedYearIndex, 'pink', 'red'),
          ...primaryAxes,
        },
        {
          label: t(lang, 'ace'),
          metric: 'ace' as const,
          data: chartTotals.map((entry) =>
            isAceYearAvailable(basin, entry.year) ? entry.ACE : null,
          ),
          borderColor: 'purple',
          backgroundColor: 'rgba(168, 85, 247, 0.25)',
          ...pointHighlightColors(
            chartTotals.length,
            selectedYearIndex,
            '#e9d5ff',
            'rgba(168, 85, 247, 0.45)',
          ),
          ...secondaryAxes,
        },
      ],
    };
  }, [chartTotals, selectedYearIndex, basin, mobile, lang]);

  const options = useMemo(() => {
    const desktopScales = {
      x: {
        type: 'category' as const,
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.22)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'white',
          stepSize: 5,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.22)',
        },
        min: 0,
        max: countMax,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'white',
          stepSize: 50,
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: aceMax,
      },
    };

    const mobileScales = {
      x: {
        type: 'linear' as const,
        display: true,
        position: 'top' as const,
        ticks: {
          color: 'white',
          stepSize: 5,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.22)',
        },
        min: 0,
        max: countMax,
      },
      y: {
        type: 'category' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.22)',
        },
      },
      x1: {
        type: 'linear' as const,
        display: true,
        position: 'bottom' as const,
        ticks: {
          color: 'white',
          stepSize: 50,
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: aceMax,
      },
    };

    return {
      indexAxis: (mobile ? 'y' : 'x') as 'x' | 'y',
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      stacked: false,
      plugins: {
        selectedYearLine: {
          selectedIndex: selectedYearIndex,
        },
        title: {
          display: false,
        },
        legend: {
          display: true,
          onHover: (_event: ChartEvent, _legendItem: LegendItem, legend: LegendElement<'line'>) => {
            const canvas = legend.chart?.canvas;
            if (canvas) {
              canvas.style.cursor = 'pointer';
            }
          },
          onLeave: (_event: ChartEvent, _legendItem: LegendItem, legend: LegendElement<'line'>) => {
            const canvas = legend.chart?.canvas;
            if (canvas) {
              canvas.style.cursor = 'default';
            }
          },
          onClick: function (
            this: LegendElement<'line'>,
            event: ChartEvent,
            legendItem: LegendItem,
            legend: LegendElement<'line'>,
          ) {
            const defaultLegendClick = Chart.defaults.plugins.legend.onClick;
            defaultLegendClick?.call(this, event, legendItem, legend);

            if (legendItem.datasetIndex === 0) {
              setShowCyclones(legend.chart.isDatasetVisible(0));
            }
          },
          labels: {
            color: 'white',
          },
        },
        tooltip: {
          bodyColor: 'white',
          titleColor: 'white',
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const label = context.dataset.label || '';
              const metric = chartMetricOf(context.dataset);
              const v = mobile ? context.parsed.x : context.parsed.y;
              if (v == null) return undefined;
              if (metric === 'ace') {
                return `${label}: ${v.toFixed(1)}`;
              }
              return `${label}: ${v}`;
            },
          },
        },
      },
      scales: !mobile ? desktopScales : mobileScales,
    };
  }, [aceMax, countMax, mobile, selectedYearIndex]);

  if (!totals.length) return null;

  return (
    <div className="relative h-[48rem] lg:h-96 w-full min-h-0">
      <Line data={chartData} options={options} plugins={[selectedYearLinePlugin]} />
    </div>
  );
};

export default TotalsChart;
