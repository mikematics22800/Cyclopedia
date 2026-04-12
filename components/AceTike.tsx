'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AceTike = () => {
  const { dates, storm, year } = useAppContext();
  const [ACEArray, setACEArray] = useState<number[]>([]);
  const [TIKEArray, setTIKEArray] = useState<number[]>([]);

  useEffect(() => {
    if (!storm) {
      setACEArray([]);
      setTIKEArray([]);
      return;
    }

    const data = storm.data;
    
    // Calculate ACEArray
    let ACEPoint = 0;
    let windArray: number[] = [];
    const calculatedACEArray = data.map((point: any) => {
      const wind = point.max_wind_kt;
      const hour = parseInt(point.time_utc);
      if (["TS", "SS", "HU"].includes(point.status)) {
        if (hour % 600 == 0) {
          ACEPoint += Math.pow(wind, 2)/10000;
          if (windArray.length > 0) {
            const average = sum(windArray)/windArray.length;
            ACEPoint += Math.pow(average, 2)/10000;
            windArray = [];
          }
        } else {
          windArray.push(wind);
        }
      }
      return ACEPoint;
    });
    setACEArray(calculatedACEArray);

    // Calculate TIKEArray if year >= 2004 and wind radii data is available
    if (year >= 2004) {
      let tikeArray: number[] = [];
      let cumulativeTIKE = 0;
      
      data.forEach((point: any) => {
        if (point['34kt_wind_nm'] && point['50kt_wind_nm'] && point['64kt_wind_nm']) {
          const wind34 = point['34kt_wind_nm'];
          const wind50 = point['50kt_wind_nm'];
          const wind64 = point['64kt_wind_nm'];
          
          // Calculate area of wind field for each wind speed threshold
          const area34 = Math.PI * Math.pow((wind34.ne + wind34.se + wind34.sw + wind34.nw) / 4 * 1852, 2);
          const area50 = Math.PI * Math.pow((wind50.ne + wind50.se + wind50.sw + wind50.nw) / 4 * 1852, 2);
          const area64 = Math.PI * Math.pow((wind64.ne + wind64.se + wind64.sw + wind64.nw) / 4 * 1852, 2);
          
          // Calculate kinetic energy for each wind speed threshold
          const rho = 1.15;
          const v34 = 34 * 0.514444;
          const v50 = 50 * 0.514444;
          const v64 = 64 * 0.514444;
          
          const ke34 = 0.5 * rho * Math.pow(v34, 2) * area34;
          const ke50 = 0.5 * rho * Math.pow(v50, 2) * area50;
          const ke64 = 0.5 * rho * Math.pow(v64, 2) * area64;
          
          const totalKE = ke34 + ke50 + ke64;
          const totalKETJ = totalKE / 1e12;
          
          cumulativeTIKE += totalKETJ;
          tikeArray.push(cumulativeTIKE);
        } else {
          tikeArray.push(cumulativeTIKE);
        }
      });
      
      setTIKEArray(tikeArray);
    } else {
      setTIKEArray([]);
    }
  }, [storm, year]);
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
        display: true,
        labels: {
          color: "white",
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyColor: "white", 
        titleColor: "white",
        borderColor: 'white',
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            if (context.dataset.label === 'Accumulated Cyclone Energy') {
              return `Accumulated Cyclone Energy: ${context.parsed.y.toFixed(1)}`;
            } else if (context.dataset.label === 'Track Integrated Kinetic Energy (TJ)') {
              return `Track Integrated Kinetic Energy (TJ): ${context.parsed.y.toFixed(1)} TJ`;
            }
            return context.dataset.label;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: "white",
          callback: function(value: any) {
            return value.toFixed(1);
          }
        },
      },
      y1: {
        type: 'linear' as const,
        display: year >= 2004,
        position: 'right' as const,
        ticks: {
          color: "white",
          callback: function(value: any) {
            return value.toFixed(0);
          }
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
    }
  };

  const datasets = [
    {
      label: 'Accumulated Cyclone Energy',
      data: ACEArray?.map((ACE) => parseFloat(ACE.toFixed(1))),
      borderColor: "purple",
      backgroundColor: "pink",
      yAxisID: 'y'
    }
  ];

  // Only add TIKE dataset if year >= 2004
  if (year >= 2004) {
    datasets.push({
      label: 'Track Integrated Kinetic Energy (TJ)',
      data: TIKEArray?.map((tike) => parseFloat(tike.toFixed(1))),
      borderColor: "orange",
      backgroundColor: "lightyellow",
      yAxisID: 'y1'
    });
  }

  const data = {
    labels: dates,
    datasets: datasets
  };

  return (
    <div className="chart-wrapper">
      <div className="chart">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default AceTike;
