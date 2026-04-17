'use client';

import { useState, useEffect, useMemo } from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { TooltipItem } from "chart.js";
import { Bar } from 'react-chartjs-2';
import { useAppContext } from '../contexts/AppContext';
import type { StormIntensityMetricPair } from './intensityMetricPair';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type SeasonIntensityProps = {
  pairing: StormIntensityMetricPair;
};

function categoryAxisTicksForSelectedLabel(selectedIndex: number) {
  if (selectedIndex < 0) {
    return { color: 'white' as const };
  }
  return {
    color: (ctx: { index: number }) =>
      ctx.index === selectedIndex ? 'aqua' : 'rgba(255, 255, 255, 0.82)',
    font: (ctx: { index: number }) => ({
      weight: ctx.index === selectedIndex ? 700 : 500,
      size: ctx.index === selectedIndex ? 12 : 11,
    }),
  };
}

const SeasonIntensity = ({ pairing }: SeasonIntensityProps) => {
  const { names, maxWinds, season, seasonACE, stormId } = useAppContext();
  const [minPressures, setMinPressures] = useState<number[]>([]);
  const [mobile, setMobile] = useState(false);

  const selectedStormIndex = useMemo(() => {
    if (!season?.length || !stormId) return -1;
    return season.findIndex((s) => s.id === stormId);
  }, [season, stormId]);

  const categoryTickHighlight = useMemo(
    () => categoryAxisTicksForSelectedLabel(selectedStormIndex),
    [selectedStormIndex]
  );

  useEffect(() => {
    setMobile(window.innerWidth < 480);
  }, []);

  useEffect(() => {
    if (!season) return;

    const minPressures = season.map((storm) => {
      const pressures = storm.data
        .map((point) => point.min_pressure_mb)
        .filter((pressure): pressure is number => pressure !== undefined && pressure > 0);
      return pressures.length > 0 ? Math.min(...pressures) : 0;
    });
    setMinPressures(minPressures);
  }, [season]);

  const aceRounded = useMemo(
    () => seasonACE?.map((ACE) => parseFloat(ACE.toFixed(1))) ?? [],
    [seasonACE]
  );

  if (!season) return null;

  const primaryAxes = mobile
    ? { xAxisID: 'x' as const, yAxisID: 'y' as const }
    : { yAxisID: 'y' as const };
  const secondaryAxes = mobile
    ? { xAxisID: 'x1' as const, yAxisID: 'y' as const }
    : { yAxisID: 'y1' as const };

  const datasets = (() => {
    if (pairing === 'wind-pressure') {
      return [
        {
          label: 'Maximum Wind (kt)',
          data: maxWinds,
          borderColor: 'red',
          backgroundColor: 'red',
          ...primaryAxes,
        },
        {
          label: 'Minimum Pressure (mb)',
          data: minPressures,
          borderColor: 'blue',
          backgroundColor: 'blue',
          ...secondaryAxes,
        },
      ];
    }
    if (pairing === 'wind-ace') {
      return [
        {
          label: 'Maximum Wind (kt)',
          data: maxWinds,
          borderColor: 'red',
          backgroundColor: 'red',
          ...primaryAxes,
        },
        {
          label: 'Accumulated Cyclone Energy (ACE)',
          data: aceRounded,
          borderColor: 'purple',
          backgroundColor: 'purple',
          ...secondaryAxes,
        },
      ];
    }
    // ACE primary (left y / bottom x), pressure secondary (right y1 / top x1)
    return [
      {
        label: 'Accumulated Cyclone Energy (ACE)',
        data: aceRounded,
        borderColor: 'purple',
        backgroundColor: 'purple',
        ...primaryAxes,
      },
      {
        label: 'Minimum Pressure (mb)',
        data: minPressures,
        borderColor: 'blue',
        backgroundColor: 'blue',
        ...secondaryAxes,
      },
    ];
  })();

  const data = {
    labels: names,
    datasets,
  };

  const desktopScales =
    pairing === 'wind-pressure'
      ? {
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            ticks: { color: 'white' },
            min: 0,
            max: 200,
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            ticks: { color: 'white' },
            min: 850,
            max: 1050,
            grid: { drawOnChartArea: false },
          },
          x: { ticks: { ...categoryTickHighlight } },
        }
      : pairing === 'wind-ace'
        ? {
            y: {
              type: 'linear' as const,
              display: true,
              position: 'left' as const,
              ticks: { color: 'white' },
              min: 0,
              max: 200,
            },
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              ticks: {
                color: 'white',
                callback: (value: string | number) => Number(value).toFixed(1),
              },
              min: 0,
              max: 100,
              grid: { drawOnChartArea: false },
            },
            x: { ticks: { ...categoryTickHighlight } },
          }
        : {
            y: {
              type: 'linear' as const,
              display: true,
              position: 'left' as const,
              ticks: {
                color: 'white',
                callback: (value: string | number) => Number(value).toFixed(1),
              },
              min: 0,
              max: 100,
            },
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              ticks: { color: 'white' },
              min: 850,
              max: 1050,
              grid: { drawOnChartArea: false },
            },
            x: { ticks: { ...categoryTickHighlight } },
          };

  const mobileScales =
    pairing === 'wind-pressure'
      ? {
          x: {
            type: 'linear' as const,
            display: true,
            position: 'top' as const,
            ticks: { color: 'white' },
            min: 0,
            max: 200,
          },
          y: {
            type: 'category' as const,
            display: true,
            position: 'left' as const,
            ticks: { ...categoryTickHighlight },
          },
          x1: {
            type: 'linear' as const,
            display: true,
            position: 'bottom' as const,
            min: 850,
            max: 1050,
            ticks: { color: 'white' },
            grid: { drawOnChartArea: false },
          },
        }
      : pairing === 'wind-ace'
        ? {
            x: {
              type: 'linear' as const,
              display: true,
              position: 'top' as const,
              ticks: { color: 'white' },
              min: 0,
              max: 200,
            },
            y: {
              type: 'category' as const,
              display: true,
              position: 'left' as const,
              ticks: { ...categoryTickHighlight },
            },
            x1: {
              type: 'linear' as const,
              display: true,
              position: 'bottom' as const,
              ticks: {
                color: 'white',
                callback: (value: string | number) => Number(value).toFixed(1),
              },
              min: 0,
              max: 100,
              grid: { drawOnChartArea: false },
            },
          }
        : {
            x: {
              type: 'linear' as const,
              display: true,
              position: 'top' as const,
              ticks: {
                color: 'white',
                callback: (value: string | number) => Number(value).toFixed(1),
              },
              min: 0,
              max: 100,
            },
            y: {
              type: 'category' as const,
              display: true,
              position: 'left' as const,
              ticks: { ...categoryTickHighlight },
            },
            x1: {
              type: 'linear' as const,
              display: true,
              position: 'bottom' as const,
              min: 850,
              max: 1050,
              ticks: { color: 'white' },
              grid: { drawOnChartArea: false },
            },
          };

  const options = {
    indexAxis: (mobile ? 'y' : 'x') as 'x' | 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        onClick: () => {
          /* no-op: disable default click-to-hide-dataset */
        },
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        bodyColor: 'white',
        titleColor: 'white',
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const label = context.dataset.label || "";
            const value = mobile ? context.parsed.x : context.parsed.y;
            if (value === undefined || value === null) return label;
            if (label.includes('Energy') || label.includes('ACE')) {
              return `${label}: ${Number(value).toFixed(1)}`;
            }
            if (label.includes('Pressure')) {
              return `${label}: ${value} mb`;
            }
            return `${label}: ${value} kt`;
          },
        },
      },
    },
    scales: !mobile ? desktopScales : mobileScales,
  };

  return (
    <div className="relative h-96 w-full min-h-0">
      <Bar options={options} data={data} />
    </div>
  );
};

export default SeasonIntensity;
