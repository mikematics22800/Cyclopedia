import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import MaxWinds from './MaxWinds'
import MinPressures from './MinPressures'
import SeasonACE from './SeasonACE'
import Landfalls from './Landfalls'
import MaxWindsLandfall from './MaxWindsLandfall'
import MinPressuresLandfall from './MinPressuresLandfall'
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
      <h1 className="text-white mb-y font-bold text-xl my-5">
        Retired Names: {retiredNames.length > 0 ? retiredNames.join(", ") : "None"}
      </h1>
      <div className="bg-white p-5 rounded-md">
        <MaxWinds/>
        <MinPressures/>
        <SeasonACE/>
        <Landfalls/>
        <MaxWindsLandfall/>
        <MinPressuresLandfall/>
        <Fatalities/>
        <Cost/>
      </div>
    </div>
  )
}

export default Season