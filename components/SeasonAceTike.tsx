'use client';

import {useState, useEffect} from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from 'react-chartjs-2';
import { useAppContext } from '../contexts/AppContext';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const SeasonAceTike = ({
  onClick = () => {},
  expand = false,
}: {
  onClick?: () => void;
  expand?: boolean;
} = {}) => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.innerWidth < 480);
  }, []);

  const { names, seasonACE, year, season } = useAppContext();
  const calculateSeasonTIKE = () => {
    if (year < 2004) return [];
    
    if (!season) return [];
    
    return season.map((storm) => {
      let cumulativeTIKE = 0;
      storm.data.forEach((point) => {
        if (point['34kt_wind_nm'] && point['50kt_wind_nm'] && point['64kt_wind_nm']) {
          const wind34 = point['34kt_wind_nm'];
          const wind50 = point['50kt_wind_nm'];
          const wind64 = point['64kt_wind_nm'];
          
          const area34 = Math.PI * Math.pow((wind34.ne + wind34.se + wind34.sw + wind34.nw) / 4 * 1852, 2);
          const area50 = Math.PI * Math.pow((wind50.ne + wind50.se + wind50.sw + wind50.nw) / 4 * 1852, 2);
          const area64 = Math.PI * Math.pow((wind64.ne + wind64.se + wind64.sw + wind64.nw) / 4 * 1852, 2);
          
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
        }
      });
      return cumulativeTIKE;
    });
  };

  const seasonTIKE = calculateSeasonTIKE();
  const hasTIKEData = year >= 2004 && seasonTIKE.length > 0;

  if (!season) return null;

  const data = {
    labels: names,
    datasets: [
      {
        label: 'Accumulated Cyclone Energy',
        data: seasonACE?.map((ACE) => parseFloat(ACE.toFixed(1))),
        borderColor: "purple",
        backgroundColor: "purple",
        ...(mobile
          ? { xAxisID: 'x' as const, yAxisID: 'y' as const }
          : { yAxisID: 'y' as const }),
      },
      ...(hasTIKEData
        ? [
            {
              label: 'Track Integrated Kinetic Energy (TJ)',
              data: seasonTIKE?.map((TIKE) => parseFloat(TIKE.toFixed(1))),
              borderColor: "orange",
              backgroundColor: "orange",
              ...(mobile
                ? { xAxisID: 'x1' as const, yAxisID: 'y' as const }
                : { yAxisID: 'y1' as const }),
            },
          ]
        : []),
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
            if (label.includes('TIKE')) {
              return `${label}: ${value.toFixed(1)} TJ`;
            } else {
              return `${label}: ${value.toFixed(1)}`;
            }
          }
        }
      },
    },
    scales: !mobile ? {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: "white"
        },
      },
      ...(hasTIKEData ? {
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          ticks: {
            color: "white",
          },
        }
      } : {}),
      x: {
        ticks: {
          color: "white"
        },
      },
    } : {
      // indexAxis 'y': storm names on y (category), ACE/TIKE values on x / x1
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
      ...(hasTIKEData
        ? {
            x1: {
              type: 'linear' as const,
              display: true,
              position: 'top' as const,
              beginAtZero: true,
              ticks: {
                color: "white",
                callback: function (value: string | number) {
                  return Number(value).toFixed(0);
                },
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          }
        : {}),
    }
  };

  return (
    <div className={expand ? "chart-expand-wrapper" : "chart-wrapper"}>
      <div className={expand ? "chart-expand" : "chart"}>
        <Bar options={options} data={data} onClick={onClick}/>
      </div>
    </div>
  );
};

export default SeasonAceTike;