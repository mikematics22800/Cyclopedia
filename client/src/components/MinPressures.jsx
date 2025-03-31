import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const MinPressures = () => {
  const {season, names} = useContext(Context)

  const [minPressures, setMinPressures] = useState([])

  useEffect(() => {
    const minPressures = season.map((storm) => {
      const pressures = storm.data.map((point) => {
        if (!point.min_pressure_mb) {
          return 9999
        } else {
          return point.min_pressure_mb
        }
      })
      if (Math.min(...pressures) === 9999) {
        return null 
      } 
      return Math.min(...pressures)
    })
    console.log(minPressures)
    setMinPressures(minPressures)
  }, [season])

  const data = {
    labels: names,
    datasets: [
      {
        data: minPressures,
        borderColor: "blue",
        backgroundColor: "blue"
      },
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Minimum Pressure (mb)',
        color: "white"
      },
      tooltip: {
        bodyColor: "white", 
        titleColor: "white",
      },
    },
    scales: {
      y: {
        ticks: {
          color: "white"
        },
        min: 860
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
  )}

export default MinPressures