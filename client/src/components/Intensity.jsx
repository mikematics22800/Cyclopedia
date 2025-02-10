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
      return 0
    })
    setPressure(pressure)
  }, [storm])

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Maximum Wind (kt)",
        data: wind,
        borderColor: "red",
        backgroundColor: "pink",
        yAxisID: "y"
      },
      {
        label: "Minimum Pressure (mb) 0 = Unknown",
        data: pressure,
        borderColor: "blue",
        backgroundColor: "lightblue",
        yAxisID: "y1"
      },
    ]
  }

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };


  return <LineChart options={options} data={data}/>
}

export default Intensity