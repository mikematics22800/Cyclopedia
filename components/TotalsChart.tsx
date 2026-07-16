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
import { getTotalsFilePath, isAceYearAvailable } from '../libs/basins';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type YearTotal = {
  year: number;
  count: number;
  ACE: number;
};

const COUNT_MAX_BY_BASIN: Record<string, number> = {
  n_atlantic: 35,
  e_pacific: 35,
  n_indian: 25,
  w_pacific: 60,
  s_indian: 35,
  s_pacific: 35,
  s_atlantic: 5,
};

const ACE_MAX_BY_BASIN: Record<string, number> = {
  n_atlantic: 350,
  e_pacific: 350,
  n_indian: 100,
  w_pacific: 600,
  s_indian: 350,
  s_pacific: 350,
  s_atlantic: 50,
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

    const xScale = chart.scales.x;
    const { top, bottom } = chart.chartArea;
    if (!xScale || bottom <= top) return;

    const xPixel = xScale.getPixelForValue(selectedYearIndex);
    if (!Number.isFinite(xPixel)) return;

    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'aqua';
    ctx.moveTo(xPixel, top);
    ctx.lineTo(xPixel, bottom);
    ctx.stroke();
    ctx.restore();
  },
};

const TotalsChart = ({ extraPlugins = [] }: { extraPlugins?: Plugin[] }) => {
  const { basin, year } = useAppContext();
  const [totals, setTotals] = useState<YearTotal[]>([]);
  const [showCyclones, setShowCyclones] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTotals() {
      try {
        const path = getTotalsFilePath(basin);
        if (!path) {
          if (!cancelled) setTotals([]);
          return;
        }
        const response = await fetch(`/${path}`);
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

  const chartData = useMemo(
    () => ({
      labels: chartTotals.map((entry) => String(entry.year)),
      datasets: [
        {
          label: 'Tropical Cyclones',
          data: chartTotals.map((entry) => entry.count),
          borderColor: 'red',
          backgroundColor: 'pink',
          ...pointHighlightColors(chartTotals.length, selectedYearIndex, 'pink', 'red'),
          yAxisID: 'y' as const,
        },
        {
          label: 'Accumulated Cyclone Energy',
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
          yAxisID: 'y1' as const,
        },
      ],
    }),
    [chartTotals, selectedYearIndex, basin],
  );

  const options = useMemo(
    () => ({
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
              const v = context.parsed.y;
              if (v == null) return undefined;
              if (label.includes('Energy') || label.includes('ACE')) {
                return `${label}: ${v.toFixed(1)}`;
              }
              return `${label}: ${v}`;
            },
          },
        },
      },
      scales: {
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
      },
    }),
    [aceMax, countMax, selectedYearIndex],
  );

  if (!totals.length) return null;

  return (
    <div className="relative lg:h-96 h-64 w-full">
      <Line data={chartData} options={options} plugins={[selectedYearLinePlugin, ...extraPlugins]} />
    </div>
  );
};

export default TotalsChart;
