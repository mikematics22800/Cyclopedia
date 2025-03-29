import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'

const MaxWinds = () => {
  const {season, names} = useContext(Context)

  const [maxWinds, setMaxWinds] = useState([])

  useEffect(() => {
    const maxWinds = season.map((storm) => {
      const winds = storm.data.map((point) => {
        return point.max_wind_kt
      })
      return Math.max(...winds)
    })
    setMaxWinds(maxWinds)
  }, [season])

  const data = {
    labels: names,
    datasets: [
      {
        data: maxWinds,
        borderColor: "red",
        backgroundColor: "red",
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
        text: 'Maximum Wind (kt)',
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

export default MaxWinds