import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
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
      <ul>
        <li className='border-t-2'>
          <h2>Tropical Cyclones</h2>
          <h2>{season.length}</h2>
        </li>
        <li>
          <h2>Accumulated Cyclone Energy</h2>
          <h2>{sum(seasonACE).toFixed(1)}</h2>
        </li>
        <li>
          <h2>Dead/Missing</h2>
          <h2>{deadOrMissing}</h2>
        </li>
        <li>
          <h2>Cost (Million USD)</h2>
          <h2>${cost}</h2>
        </li>
        <li>
          <h2>Retired Names</h2>
          <h2>{retiredNames.length > 0 ? retiredNames.join(", ") : "None"}</h2>
        </li>
      </ul>
    </div>
  )
}

export default Season