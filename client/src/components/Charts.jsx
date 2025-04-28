import Intensity from "./Intensity"
import ACEChart from "./ACE"
import MaxWinds from "./MaxWinds"
import MinPressures from "./MinPressures"
import SeasonACE from "./SeasonACE"

const Charts = () => {
  return (
    <div className="charts-container">
      <div className="charts">
        <Intensity/>
        <ACEChart/>
        <MaxWinds/>
        <MinPressures/>
        <SeasonACE/>
      </div>
    </div>
  )
}

export default Charts