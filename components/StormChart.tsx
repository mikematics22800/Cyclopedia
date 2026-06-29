'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { cumulativeStormACESeries } from '../libs/calculateACE';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
  type Plugin,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const aceThresholdLinePlugin: Plugin<'line'> = {
  id: 'ace-threshold-line',
  beforeDatasetsDraw: (chart) => {
    const aceDatasetIndex = chart.data.datasets.findIndex(
      (dataset) => dataset.label === 'Accumulated Cyclone Energy'
    );
    if (aceDatasetIndex === -1 || !chart.isDatasetVisible(aceDatasetIndex)) return;

    const yScale = chart.scales.y;
    if (!yScale) return;

    const thresholdPixel = yScale.getPixelForValue(100);
    const zeroPixel = yScale.getPixelForValue(0);
    if (!Number.isFinite(thresholdPixel) || !Number.isFinite(zeroPixel)) return;

    const { left, right } = chart.chartArea;
    const rangeStart = Math.min(zeroPixel, thresholdPixel);
    const rangeEnd = Math.max(zeroPixel, thresholdPixel);
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'purple';
    ctx.moveTo(left, rangeStart);
    ctx.lineTo(left, rangeEnd);
    ctx.moveTo(left, thresholdPixel);
    ctx.lineTo(right, thresholdPixel);
    ctx.stroke();
    ctx.restore();
  },
};

type StormChartProps = {
  hiddenByDatasetIndex?: Record<number, boolean>;
};

const StormChart = ({ hiddenByDatasetIndex = {} }: StormChartProps) => {
  const { storm, dates } = useAppContext();
  const [wind, setWind] = useState<number[]>([]);
  const [pressure, setPressure] = useState<(number | null)[]>([]);
  const [aceSeries, setAceSeries] = useState<number[]>([]);

  useEffect(() => {
    if (!storm) return;

    const data = storm.data;
    setWind(data.map((point) => point.max_wind_kt));
    setPressure(
      data.map((point) => {
        const p = point.min_pressure_mb;
        if (p && p > 0) return p;
        return null;
      })
    );
    setAceSeries(cumulativeStormACESeries(data));
  }, [storm]);

  const aceRounded = useMemo(
    () => aceSeries.map((v) => parseFloat(v.toFixed(1))),
    [aceSeries]
  );

  if (!storm) return null;

  const datasets = [
    {
      label: 'Maximum Wind (kt)',
      data: wind,
      borderColor: 'red',
      backgroundColor: 'pink',
      yAxisID: 'y' as const,
      hidden: hiddenByDatasetIndex[0] ?? false,
    },
    {
      label: 'Minimum Pressure (mb)',
      data: pressure,
      borderColor: 'blue',
      backgroundColor: 'lightblue',
      yAxisID: 'y1' as const,
      spanGaps: true,
      hidden: hiddenByDatasetIndex[1] ?? false,
    },
    {
      label: 'Accumulated Cyclone Energy',
      data: aceRounded,
      borderColor: 'purple',
      backgroundColor: 'rgba(168, 85, 247, 0.25)',
      pointBackgroundColor: '#e9d5ff',
      pointBorderColor: 'rgba(168, 85, 247, 0.45)',
      yAxisID: 'y' as const,
      hidden: hiddenByDatasetIndex[2] ?? false,
    },
  ];

  const data = { labels: dates, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        bodyColor: 'white',
        titleColor: 'white',
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            const label = context.dataset.label || '';
            const v = context.parsed.y;
            if (v == null) return label;
            if (label === 'Accumulated Cyclone Energy') {
              return `${label}: ${v.toFixed(1)}`;
            }
            if (label.includes('Pressure')) {
              return `${label}: ${v} mb`;
            }
            if (label.includes('Wind')) {
              return `${label}: ${v} kt`;
            }
            return `${label}: ${v}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'white',
          stepSize: 50,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.22)',
        },
        min: 0,
        max: 200,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        reverse: true,
        ticks: {
          color: 'white',
          stepSize: 50,
        },
        min: 850,
        max: 1050,
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.22)',
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full min-h-0 lg:h-96">
      <Line options={options} data={data} plugins={[aceThresholdLinePlugin]} />
    </div>
  );
};

export default StormChart;
