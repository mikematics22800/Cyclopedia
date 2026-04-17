'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';
import type { StormDataPoint } from '../libs/hurdat';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function cumulativeAceSeries(data: StormDataPoint[]): number[] {
  let ACEPoint = 0;
  let windArray: number[] = [];
  return data.map((point) => {
    const wind = point.max_wind_kt;
    const hour = typeof point.time_utc === 'number' ? point.time_utc : parseInt(String(point.time_utc), 10);
    if (['TS', 'SS', 'HU'].includes(point.status)) {
      if (hour % 600 === 0) {
        ACEPoint += Math.pow(wind, 2) / 10000;
        if (windArray.length > 0) {
          const average = sum(windArray) / windArray.length;
          ACEPoint += Math.pow(average, 2) / 10000;
          windArray = [];
        }
      } else {
        windArray.push(wind);
      }
    }
    return ACEPoint;
  });
}

type StormIntensityProps = {
  hiddenByLabel?: Record<string, boolean>;
};

const StormIntensity = ({ hiddenByLabel = {} }: StormIntensityProps) => {
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
    setAceSeries(cumulativeAceSeries(data));
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
      hidden: hiddenByLabel['Maximum Wind (kt)'] ?? false,
    },
    {
      label: 'Accumulated Cyclone Energy',
      data: aceRounded,
      borderColor: 'purple',
      backgroundColor: 'rgba(168, 85, 247, 0.25)',
      pointBackgroundColor: '#e9d5ff',
      pointBorderColor: 'rgba(168, 85, 247, 0.45)',
      yAxisID: 'y' as const,
      hidden: hiddenByLabel['Accumulated Cyclone Energy'] ?? false,
    },
    {
      label: 'Minimum Pressure (mb)',
      data: pressure,
      borderColor: 'blue',
      backgroundColor: 'lightblue',
      yAxisID: 'y1' as const,
      spanGaps: true,
      hidden: hiddenByLabel['Minimum Pressure (mb)'] ?? false,
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
        min: 0,
        max: 200,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
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
      },
    },
  };

  return (
    <div className="relative h-64 w-full min-h-0 lg:h-96">
      <Line options={options} data={data} />
    </div>
  );
};

export default StormIntensity;
