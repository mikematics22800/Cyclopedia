'use client';

import { useState, useEffect } from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from 'react-chartjs-2';
import { useAppContext } from '../contexts/AppContext';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const SeasonIntensity = () => {
  const { names, maxWinds, season } = useAppContext();
  const [minPressures, setMinPressures] = useState<number[]>([]);
  const [mobile, setMobile] = useState(false);

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

  if (!season) return null;

  const data = {
    labels: names,
    datasets: [
      {
        label: 'Maximum Wind (kt)',
        data: maxWinds,
        borderColor: "red",
        backgroundColor: "red",
        ...(mobile
          ? { xAxisID: 'x' as const, yAxisID: 'y' as const }
          : { yAxisID: 'y' as const }),
      },
      {
        label: 'Minimum Pressure (mb)',
        data: minPressures,
        borderColor: "blue",
        backgroundColor: "blue",
        ...(mobile
          ? { xAxisID: 'x1' as const, yAxisID: 'y' as const }
          : { yAxisID: 'y1' as const }),
      },
    ],
  };

  const options = {
    indexAxis: (mobile ? 'y' : 'x') as 'x' | 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "white"
        }
      },
      tooltip: {
        bodyColor: "white", 
        titleColor: "white",
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = mobile ? context.parsed.x : context.parsed.y;
            if (label.includes('Pressure')) {
              return `${label}: ${value} mb`;
            } else {
              return `${label}: ${value} kt`;
            }
          }
        }
      },
    },
    scales: !mobile
      ? {
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            ticks: {
              color: "white"
            },
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            ticks: {
              color: "white"
            },
            min: 860,
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            ticks: {
              color: "white"
            },
          },
        }
      : {
          x: {
            type: 'linear' as const,
            display: true,
            position: 'bottom' as const,
            beginAtZero: true,
            ticks: {
              color: "white",
            },
          },
          y: {
            type: 'category' as const,
            display: true,
            position: 'left' as const,
            ticks: {
              color: "white",
            },
          },
          x1: {
            type: 'linear' as const,
            display: true,
            position: 'top' as const,
            min: 860,
            ticks: {
              color: "white",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default SeasonIntensity;