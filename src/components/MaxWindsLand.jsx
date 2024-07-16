import { useState, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const MaxWindsLand = () => {
  const {landfallingStorms} = useContext(Context)

  const [names, setNames] = useState([]);
  const [maxWinds, setMaxWinds] = useState([]);

  useState(() => {
    const names = landfallingStorms.map((storm) => {
      return storm.id.split('_')[1]
    })
    setNames(names)

    const maxWinds = landfallingStorms.map((storm) => {
      const winds = storm.data.map((point) => {
        return point.max_wind_kt
      })
      return Math.max(...winds)
    })
    setMaxWinds(maxWinds)
  }, [landfallingStorms])

  const data = {
    labels: names,
    datasets: [
      {
        data: maxWinds,
        backgroundColor: "red",
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
        text: "Maximum Winds on Land (kt)"
      },
    },
  };

  return <BarChart options={options} data={data}/>  
}

export default MaxWindsLand