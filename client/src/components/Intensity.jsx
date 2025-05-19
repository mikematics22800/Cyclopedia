import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import LineChart from './LineChart'

const Intensity = () => {
  const {storm, dates} = useContext(Context)

  const [wind, setWind] = useState([])
  const [pressure, setPressure] = useState([])

  useEffect(() => {
    const data = storm.data
    const wind = data.map((point) => {
      return point.max_wind_kt
    })
    setWind(wind)

    const pressure = data.map((point) => {
      let pressure = point.min_pressure_mb
      if (pressure > 0) {
        return pressure
      }
      return null
    })
    setPressure(pressure)
  }, [storm])

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Max Wind (kt)",
        data: wind,
        borderColor: "red",
        backgroundColor: "pink",
        yAxisID: "y",
      },
      {
        label: "Min Pressure (mb)",
        data: pressure,
        borderColor: "blue",
        backgroundColor: "lightblue",
        yAxisID: "y1",
        spanGaps: true
      },
    ]
  }

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
        type: "linear",
        display: true,
        position: "left",
        ticks: {
          color: "white"
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
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
    <div className='chart'>
      <LineChart options={options} data={data}/>
    </div>
  )
}

export default Intensity