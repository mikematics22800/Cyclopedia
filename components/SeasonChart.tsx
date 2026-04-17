'use client';

import { useState, useEffect, useMemo } from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { ChartEvent, LegendElement, LegendItem, TooltipItem } from "chart.js";
import { Bar } from 'react-chartjs-2';
import { useAppContext } from '../contexts/AppContext';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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

type SeasonIntensityProps = {
  onLegendVisibilityChange?: (label: string, isVisible: boolean) => void;
};

const SeasonIntensity = ({ onLegendVisibilityChange }: SeasonIntensityProps) => {
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

  const datasets = [
    {
      label: 'Maximum Wind (kt)',
      data: maxWinds,
      borderColor: 'red',
      backgroundColor: 'red',
      ...primaryAxes,
    },
    {
      label: 'Accumulated Cyclone Energy',
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

  const data = {
    labels: names,
    datasets,
  };

  const desktopScales = {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      ticks: { color: 'white', stepSize: 50 },
      min: 0,
      max: 200,
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      ticks: { color: 'white', stepSize: 50 },
      min: 850,
      max: 1050,
      grid: { drawOnChartArea: false },
    },
    x: { ticks: { ...categoryTickHighlight } },
  };

  const mobileScales = {
    x: {
      type: 'linear' as const,
      display: true,
      position: 'top' as const,
      ticks: { color: 'white', stepSize: 50 },
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
      ticks: { color: 'white', stepSize: 50 },
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
        onClick: function (
          this: LegendElement<'bar'>,
          event: ChartEvent,
          legendItem: LegendItem,
          legend: LegendElement<'bar'>
        ) {
          const defaultLegendClick = Chart.defaults.plugins.legend.onClick;
          defaultLegendClick?.call(this, event, legendItem, legend);

          const datasetIndex = legendItem.datasetIndex;
          if (typeof datasetIndex !== 'number') return;

          const label = legendItem.text || legend.chart.data.datasets[datasetIndex]?.label;
          if (!label) return;

          onLegendVisibilityChange?.(label, legend.chart.isDatasetVisible(datasetIndex));
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
    <div className="relative lg:h-96 h-[36rem] w-full min-h-0">
      <Bar options={options} data={data} />
    </div>
  );
};

export default SeasonIntensity;
