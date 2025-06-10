import Intensity from "./Intensity"
import ACEChart from "./ACE"
import MaxWinds from "./MaxWinds"
import MinPressures from "./MinPressures"
import SeasonACE from "./SeasonACE"

const TrackerCharts = () => {
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

export default TrackerCharts