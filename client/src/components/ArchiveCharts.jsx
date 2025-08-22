import Intensity from "./Intensity"
import ACE from "./ACE"
import ACE_TIKE from "./ACE_TIKE"
import MaxWinds from "./MaxWinds"
import MinPressures from "./MinPressures"
import SeasonACE from "./SeasonACE"
import SeasonTIKE from "./SeasonTIKE"
import { useContext } from "react"
import { Context } from "../App"

const ArchiveCharts = () => {
  const { year } = useContext(Context)
  
  return (
    <div className="charts-container">
      <div className="charts">
        <Intensity/>
        {year >= 2004 ? <ACE_TIKE/> : <ACE/>}
        <MaxWinds/>
        <MinPressures/>
        <SeasonACE/>
        {year >= 2004 && <SeasonTIKE/>}      
      </div>
    </div>
  )
}

export default ArchiveCharts