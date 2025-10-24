import Intensity from "./Intensity"
import AceTike from "./AceTike"
import WindsAndPressures from "./SeasonIntensity"
import SeasonAceTike from "./SeasonAceTike"
import { useContext } from "react"
import { Context } from "../App"

const ArchiveCharts = () => {
  const { year } = useContext(Context)
  
  return (
    <div className="charts-container">
      <div className="charts">
        <Intensity/>
        <AceTike/>
        <WindsAndPressures/>
        <SeasonAceTike/>
      </div>
    </div>
  )
}

export default ArchiveCharts