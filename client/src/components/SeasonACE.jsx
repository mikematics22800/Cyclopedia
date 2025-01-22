import { useState, useEffect, useContext } from 'react'
import { Context } from '../App'
import BarChart from './BarChart'
import { sum } from '../libs/sum'

const SeasonACE = () => {
  const {season} = useContext(Context)

  const [names, setNames] = useState(null)
  const [seasonACE, setSeasonACE] = useState(null)

  useEffect(() => {
    const tropicalStorms = season.filter(storm => storm.data.map((point) => {return point.status}).includes("TS") || storm.data.map((point) => {return point.status}).includes("SS"))
    const names = tropicalStorms.map((storm) => {
      return storm.id.split('_')[1]
    })
    setNames(names)

    const seasonACE = tropicalStorms.map((storm) => {
      let ACE = 0
      let windArray = []
      storm.data.forEach((point) => {
        const wind = point.max_wind_kt
        const hour = point.time_utc
        if (["TS", "SS", "HU"].includes(point.status)) {
          if (hour % 600 == 0) {
            ACE += Math.pow(wind, 2)/10000
            if (windArray.length > 0) {
              const average = sum(windArray)/windArray.length
              ACE += Math.pow(average, 2)/10000
              windArray = []
            }
          } else {
            windArray.push(wind)
          }
        }
      })
      return ACE
    })
    setSeasonACE(seasonACE)
  }, [season]) 

  const data = {
    labels: names,
    datasets: [
      {
        data: seasonACE?.map((ACE) => {return ACE.toFixed(1)}),
        borderColor: "purple",
        backgroundColor: "purple"
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
        text: `Accumulated Cyclone Energy: ${sum(seasonACE).toFixed(1)}`
      }
    },
  };

  return <BarChart options={options} data={data}/>
}

export default SeasonACE