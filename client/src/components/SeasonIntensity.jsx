import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const WindsAndPressures = () => {
  const {names, maxWinds, season} = useContext(Context)
  const [minPressures, setMinPressures] = useState([])

  useEffect(() => {
    const minPressures = season.map((storm) => {
      const pressures = storm.data.map((point) => {
        return point.min_pressure_mb
      })
      return Math.min(...pressures)
    })
    setMinPressures(minPressures)
  }, [season])

  const data = {
    labels: names,
    datasets: [
      {
        label: 'Maximum Wind (kt)',
        data: maxWinds,
        borderColor: "red",
        backgroundColor: "red",
        yAxisID: 'y'
      },
      {
        label: 'Minimum Pressure (mb)',
        data: minPressures,
        borderColor: "blue",
        backgroundColor: "blue",
        yAxisID: 'y1'
      }
    ]
  }

  const options = {
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
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (label.includes('Pressure')) {
              return `${label}: ${value} mb`
            } else {
              return `${label}: ${value} kt`
            }
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
          color: "white"
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
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
  };

  return (
    <div className='chart'>
      <BarChart options={options} data={data}/>
    </div>
  )
}

export default WindsAndPressures
