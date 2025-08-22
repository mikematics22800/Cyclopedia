import { useContext } from 'react'
import { Context } from '../App'
import LineChart from './LineChart'

const ACE_TIKE = () => {
  const { dates, ACEArray, TIKEArray, year } = useContext(Context)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
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
        bodyColor: "white", 
        titleColor: "white",
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'ACE') {
              return `ACE: ${context.parsed.y.toFixed(1)}`
            } else if (context.dataset.label === 'TIKE') {
              return `TIKE: ${context.parsed.y.toFixed(2)} TJ`
            }
            return context.dataset.label
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: "white",
          callback: function(value) {
            return value.toFixed(1)
          }
        },
        title: {
          display: true,
          text: 'ACE',
          color: "white"
        }
      },
      y1: {
        type: 'linear',
        display: year >= 2004,
        position: 'right',
        ticks: {
          color: "white",
          callback: function(value) {
            return value.toFixed(0)
          }
        },
        title: {
          display: year >= 2004,
          text: 'TIKE',
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
        title: {
          display: true,
          text: 'Date',
          color: "white"
        }
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
  ]

  // Only add TIKE dataset if year >= 2004
  if (year >= 2004) {
    datasets.push({
      label: 'Track Integrated Kinetic Energy (TJ)',
      data: TIKEArray?.map((tike) => parseFloat(tike.toFixed(2))),
      borderColor: "orange",
      backgroundColor: "lightyellow",
      fill: true,
      yAxisID: 'y1'
    })
  }

  const data = {
    labels: dates,
    datasets: datasets
  }

  return (
    <div className='chart'>
      <LineChart options={options} data={data}/>
    </div>
  )
}

export default ACE_TIKE
