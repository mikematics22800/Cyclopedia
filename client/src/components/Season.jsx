import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import MaxWinds from './MaxWinds'
import MinPressures from './MinPressures'
import SeasonACE from './SeasonACE'
import { sum } from '../libs/sum'

const Season = () => {
  const {season} = useContext(Context)

  const [fatalities, setFatalities] = useState(0)
  const [cost, setCost] = useState(0)
  const [retiredNames, setRetiredNames] = useState([])

  useEffect(() => {
    const fatalities = season.map((storm) => {
      return storm.fatalities
    })
    setFatalities(sum(fatalities))
    const costs = season.map((storm) => {
      return storm.cost_usd
    })
    const cost = sum(costs)
    setCost((cost/1000000).toFixed(1))
    const retiredStorms = season.filter(storm => storm.retired == true)
    const retiredNames = retiredStorms.map((storm) => {
      return storm.id.split('_')[1]
    })
    setRetiredNames(retiredNames)
  }, [season])

  return (
    <div id="season">
      <h1>Fatalities: {fatalities}</h1>
      <h1>Cost (Million USD): ${cost}</h1>
      <h1>Retired Names: {retiredNames.length > 0 ? retiredNames.join(", ") : "None"}</h1>
      <div className="charts">
        <MaxWinds/>
        <MinPressures/>
        <SeasonACE/>
      </div>
    </div>
  )
}

export default Season