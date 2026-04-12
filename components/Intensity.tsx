'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Intensity = () => {
  const { storm, dates } = useAppContext();
  const [wind, setWind] = useState<number[]>([]);
  const [pressure, setPressure] = useState<(number | null)[]>([]);

  useEffect(() => {
    if (!storm) return;
    
    const data = storm.data;
    const wind = data.map((point) => {
      return point.max_wind_kt;
    });
    setWind(wind);

    const pressure = data.map((point) => {
      let pressure = point.min_pressure_mb;
      if (pressure && pressure > 0) {
        return pressure;
      }
      return null;
    });
    setPressure(pressure);
  }, [storm]);

  if (!storm) return null;

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Maximum Wind (kt)",
        data: wind,
        borderColor: "red",
        backgroundColor: "pink",
        yAxisID: "y",
      },
      {
        label: "Minimum Pressure (mb)",
        data: pressure,
        borderColor: "blue",
        backgroundColor: "lightblue",
        yAxisID: "y1",
        spanGaps: true
      },
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        labels: {
          color: "white",
        },
      },
      tooltip: {
        bodyColor: "white", 
        titleColor: "white",
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        ticks: {
          color: "white"
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        ticks: {
          color: "white"
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: "white"
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default Intensity;
