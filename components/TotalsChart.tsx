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

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type YearTotal = {
  year: number;
  count: number;
  ACE: number;
};

const COUNT_MAX_BY_BASIN: Record<string, number> = {
  atl: 35,
  epac: 35,
  ind: 20,
  wpac: 60,
  shem: 60,
};

const ACE_MAX_BY_BASIN: Record<string, number> = {
  atl: 350,
  epac: 350,
  ind: 100,
  wpac: 600,
  shem: 600,
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

const TotalsChart = () => {
  const { basin, year } = useAppContext();
  const [totals, setTotals] = useState<YearTotal[]>([]);

  useEffect(() => {
    let cancelled = false;

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
      }7 
    }

    loadTotals();

    return () => {
      cancelled = true;
    };
  }, [basin]);

  const countMax = COUNT_MAX_BY_BASIN[basin] ?? 35;
  const aceMax = ACE_MAX_BY_BASIN[basin] ?? 350;

  const selectedYearIndex = useMemo(
    () => totals.findIndex((entry) => entry.year === year),
    [totals, year],
  );

  const chartData = useMemo(
    () => ({
      labels: totals.map((entry) => String(entry.year)),
      datasets: [
        {
          label: 'Tropical Cyclones',
          data: totals.map((entry) => entry.count),
          borderColor: 'red',
          backgroundColor: 'pink',
          ...pointHighlightColors(totals.length, selectedYearIndex, 'pink', 'red'),
          yAxisID: 'y' as const,
        },
        {
          label: 'Accumulated Cyclone Energy',
          data: totals.map((entry) => entry.ACE),
          borderColor: 'purple',
          backgroundColor: 'rgba(168, 85, 247, 0.25)',
          ...pointHighlightColors(
            totals.length,
            selectedYearIndex,
            '#e9d5ff',
            'rgba(168, 85, 247, 0.45)',
          ),
          yAxisID: 'y1' as const,
        },
      ],
    }),
    [totals, selectedYearIndex],
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
              if (v == null) return label;
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
    <div className="relative h-96 w-full">
      <Line data={chartData} options={options} plugins={[selectedYearLinePlugin]} />
    </div>
  );
};

export default TotalsChart;
