'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { chartMetricOf } from '../libs/chartMetric';
import { t } from '../libs/i18n';
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
      (dataset) => chartMetricOf(dataset) === 'ace'
    );
    if (aceDatasetIndex === -1 || !chart.isDatasetVisible(aceDatasetIndex)) return;

    const isMobile = chart.options.indexAxis === 'y';
    const valueScale = isMobile ? chart.scales.x : chart.scales.y;
    if (!valueScale) return;

    const thresholdPixel = valueScale.getPixelForValue(100);
    const zeroPixel = valueScale.getPixelForValue(0);
    if (!Number.isFinite(thresholdPixel) || !Number.isFinite(zeroPixel)) return;

    const { left, right, top, bottom } = chart.chartArea;
    const rangeStart = Math.min(zeroPixel, thresholdPixel);
    const rangeEnd = Math.max(zeroPixel, thresholdPixel);
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'purple';
    if (isMobile) {
      ctx.moveTo(rangeStart, top);
      ctx.lineTo(rangeEnd, top);
      ctx.moveTo(thresholdPixel, top);
      ctx.lineTo(thresholdPixel, bottom);
    } else {
      ctx.moveTo(left, rangeStart);
      ctx.lineTo(left, rangeEnd);
      ctx.moveTo(left, thresholdPixel);
      ctx.lineTo(right, thresholdPixel);
    }
    ctx.stroke();
    ctx.restore();
  },
};

type StormChartProps = {
  hiddenByDatasetIndex?: Record<number, boolean>;
};

const StormChart = ({ hiddenByDatasetIndex = {} }: StormChartProps) => {
  const { storm, dates, lang } = useAppContext();
  const [wind, setWind] = useState<(number | null)[]>([]);
  const [pressure, setPressure] = useState<(number | null)[]>([]);
  const [aceSeries, setAceSeries] = useState<number[]>([]);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 480);
  }, []);

  useEffect(() => {
    if (!storm) return;

    const data = storm.data;
    setWind(data.map((point) => point.max_wind_kt));
    setPressure(data.map((point) => point.min_pressure_mb ?? null));
    setAceSeries(cumulativeStormACESeries(data));
  }, [storm]);

  const aceRounded = useMemo(
    () => aceSeries.map((v) => parseFloat(v.toFixed(1))),
    [aceSeries]
  );

  if (!storm) return null;

  const primaryAxes = mobile
    ? { xAxisID: 'x' as const, yAxisID: 'y' as const }
    : { yAxisID: 'y' as const };
  const secondaryAxes = mobile
    ? { xAxisID: 'x1' as const, yAxisID: 'y' as const }
    : { yAxisID: 'y1' as const };

  const datasets = [
    {
      label: t(lang, 'maximumWindKt'),
      metric: 'wind' as const,
      data: wind,
      borderColor: 'red',
      backgroundColor: 'pink',
      ...primaryAxes,
      hidden: hiddenByDatasetIndex[0] ?? false,
    },
    {
      label: t(lang, 'minimumPressureMb'),
      metric: 'pressure' as const,
      data: pressure,
      borderColor: 'blue',
      backgroundColor: 'lightblue',
      ...secondaryAxes,
      hidden: hiddenByDatasetIndex[1] ?? false,
    },
    {
      label: t(lang, 'ace'),
      metric: 'ace' as const,
      data: aceRounded,
      borderColor: 'purple',
      backgroundColor: 'rgba(168, 85, 247, 0.25)',
      pointBackgroundColor: '#e9d5ff',
      pointBorderColor: 'rgba(168, 85, 247, 0.45)',
      ...primaryAxes,
      hidden: hiddenByDatasetIndex[2] ?? false,
    },
  ];

  const data = { labels: dates, datasets };

  const desktopScales = {
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
  };

  const mobileScales = {
    x: {
      type: 'linear' as const,
      display: true,
      position: 'top' as const,
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
      reverse: true,
      min: 850,
      max: 1050,
      ticks: {
        color: 'white',
        stepSize: 50,
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  };

  const options = {
    indexAxis: (mobile ? 'y' : 'x') as 'x' | 'y',
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
            const metric = chartMetricOf(context.dataset);
            const v = mobile ? context.parsed.x : context.parsed.y;
            if (v == null) return label;
            if (metric === 'ace') {
              return `${label}: ${v.toFixed(1)}`;
            }
            if (metric === 'pressure') {
              return `${label}: ${v} ${t(lang, 'mb')}`;
            }
            if (metric === 'wind') {
              return `${label}: ${v} ${t(lang, 'kt')}`;
            }
            return `${label}: ${v}`;
          },
        },
      },
    },
    scales: !mobile ? desktopScales : mobileScales,
  };

  return (
    <div className="relative h-[48rem] lg:h-96 w-full min-h-0">
      <Line options={options} data={data} plugins={[aceThresholdLinePlugin]} />
    </div>
  );
};

export default StormChart;
