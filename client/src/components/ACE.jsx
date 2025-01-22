import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import LineChart from './LineChart'
import { sum } from '../libs/sum'

const ACE = () => {
  const {storm, dates} = useContext(Context)

  const [ACE, setACE] = useState(null)
  const [totalACE, setTotalACE] = useState(null) 

  useEffect(() => {
    const data = storm.data
    let ACEPoint = 0
    let windArray = []
    const ACE = data.map((point) => {
      const wind = point.max_wind_kt
      const hour = parseInt(point.time_utc)
      if (["TS", "SS", "HU"].includes(point.status)) {
        if (hour % 600 == 0) {
          ACEPoint += Math.pow(wind, 2)/10000
          if (windArray.length > 0) {
            const average = sum(windArray)/windArray.length
            ACEPoint += Math.pow(average, 2)/10000
            windArray = []
          }
        } else {
          windArray.push(wind)
        }
      }
      return ACEPoint
    })
    setACE(ACE)
    const totalACE = Math.max(...ACE)
    setTotalACE(totalACE)
  }, [storm])

  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Accumulated Cyclone Energy: ${totalACE?.toFixed(1)}`
      },
    },
  };

  const data = {
    labels: dates,
    datasets: [
      {
        data: ACE?.map((ACE) => {return ACE.toFixed(1)}),
        borderColor: "purple",
        backgroundColor: "pink"
      },
    ]
  }

  return <LineChart options={options} data={data}/>
}

export default ACE