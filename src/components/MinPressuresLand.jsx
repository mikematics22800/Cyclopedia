import { useState, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const MinPressureLand = () => {
  const {landfallingStorms} = useContext(Context)

  const [names, setNames] = useState([]);
  const [minPressures, setMinPressures] = useState([]);

  useState(() => {
    const names = landfallingStorms.map((storm) => {
      return storm.id.split('_')[1]
    })
    setNames(names)

    const minPressures = landfallingStorms.map((storm) => {
      const pressures = storm.data.map((point) => {
        return point.min_pressure_mb
      })
      return Math.min(...pressures)
    })
    setMinPressures(minPressures)
  }, [landfallingStorms])

  const data = {
    labels: names,
    datasets: [
      {
        data: minPressures,
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
        text: "Minimum Inland Pressures (mb)",
      },
    },
  };

  return <BarChart options={options} data={data}/>  
}

export default MinPressureLand