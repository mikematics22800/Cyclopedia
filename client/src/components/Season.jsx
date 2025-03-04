import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import MaxWinds from './MaxWinds'
import MinPressures from './MinPressures'
import SeasonACE from './SeasonACE'
import { sum } from '../libs/sum'

const Season = () => {
  const {season, seasonACE} = useContext(Context)

  const [deadOrMissing, setDeadOrMissing] = useState(0)
  const [cost, setCost] = useState(0)
  const [retiredNames, setRetiredNames] = useState([])

  useEffect(() => {
    const deadOrMissing = season.map((storm) => {
      return storm.dead_or_missing
    })
    setDeadOrMissing(sum(deadOrMissing))
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
    <div className='season'>
      <ul className='flex flex-col gap-1.5 w-full max-w-[48rem] text-white font-bold'>
        <li>
          <h1>Tropical Cyclones</h1>
          <h1>{season.length}</h1>
        </li>
        <li>
          <h1>Accumulated Cyclone Energy</h1>
          <h1>{sum(seasonACE).toFixed(1)}</h1>
        </li>
        <li>
          <h1>Dead/Missing</h1>
          <h1>{deadOrMissing}</h1>
        </li>
        <li>
          <h1>Cost (Million USD)</h1>
          <h1>${cost}</h1>
        </li>
        <li>
          <h1>Retired Names</h1>
          <h1>{retiredNames.length > 0 ? retiredNames.join(", ") : "None"}</h1>
        </li>
      </ul>
      <div className="charts">
        <MaxWinds/>
        <MinPressures/>
        <SeasonACE/>
      </div>
    </div>
  )
}

export default Season