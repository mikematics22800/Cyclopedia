import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import { sum } from '../libs/sum'

const SeasonArchive = () => {
  const {season, seasonACE, maxWinds} = useContext(Context)

  const [hurricanes, setHurricanes] = useState(0)
  const [majorHurricanes, setMajorHurricanes] = useState(0)
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
    const hurricanes = maxWinds.filter(wind => wind >= 64).length
    setHurricanes(hurricanes)
    const majorHurricanes = maxWinds.filter(wind => wind >= 96).length
    setMajorHurricanes(majorHurricanes)
  }, [season])

  return (
    <div className='season'>
      <ul className='season-data'>
        <li className='flex justify-center'>
          <h1 className='text-lg text-[violet]'>Season Overview</h1>
        </li>
        <li>
          <h2>Tropical Cyclones</h2>
          <h2>{season.length}</h2>
        </li>
        <li>
          <h2>Hurricanes</h2>
          <h2>{hurricanes}</h2>
        </li>
        <li>
          <h2>Major Hurricanes</h2>
          <h2>{majorHurricanes}</h2>
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
        <li className='rounded-b-lg'>
          <h2>Retired Names</h2>
          <h2>{retiredNames.length > 0 ? retiredNames.join(", ") : "None"}</h2>
        </li>
      </ul>
    </div>
  )
}

export default SeasonArchive