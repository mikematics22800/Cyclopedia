import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import MaxWinds from './MaxWinds'
import MinPressures from './MinPressures'
import SeasonACE from './SeasonACE'
import Landfalls from './Landfalls'
import MaxWindsLand from './MaxWindsLand'
import MinPressuresLand from './MinPressuresLand'
import Fatalities from './Fatalities'
import Cost from './Cost'

const Season = () => {
  const {season} = useContext(Context)

  const [retiredNames, setRetiredNames] = useState([])

  useEffect(() => {
    const retiredStorms = season.filter(storm => storm.retired == true)
    const retiredNames = retiredStorms.map((storm) => {
      return storm.id.split('_')[1]
    })
    setRetiredNames(retiredNames)
    console.log(retiredStorms)
  }, [season])

  return (
    <div id="season">
      <h1>Retired Names: {retiredNames.length > 0 ? retiredNames.join(", ") : "None"}</h1>
      <div className="charts">
        <MaxWinds/>
        <MinPressures/>
        <SeasonACE/>
        <Landfalls/>
        <MaxWindsLand/>
        <MinPressuresLand/>
        <Fatalities/>
        <Cost/>
      </div>
    </div>
  )
}

export default Season