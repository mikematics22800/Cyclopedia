import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const MinPressures = () => {
  const {season} = useContext(Context)

  const [names, setNames] = useState([]);
  const [minPressures, setMinPressures] = useState([])

  useEffect(() => {
    const names = season.map((storm) => {
      return storm.id.split('_')[1]
    })
    setNames(names)

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
        data: minPressures,
        borderColor: "blue",
        backgroundColor: "blue",
      },
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Minimum Pressure (mb)',
      },
    },
    scales: {
      y: {
        min: 860
      }
    }
  };

  return <BarChart options={options} data={data}/>
}

export default MinPressures