import { useContext } from "react";
import { Context } from "../App";
import { getLatestPoint, getStormStatus } from "./LiveStorms";

const LiveTracker = () => {
  const { liveHurdat } = useContext(Context);

  // Group storms by STORM_ID
  const stormsByKey = liveHurdat.reduce((acc, feature) => {
    const { STORM_ID } = feature.properties;
    if (!acc[STORM_ID]) {
      acc[STORM_ID] = [];
    }
    acc[STORM_ID].push(feature);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {Object.entries(stormsByKey).map(([stormId, points]) => {
        const latestPoint = getLatestPoint(points);
        
        // If no latest point found, use the last point in the array
        const effectiveLatestPoint = latestPoint || points[points.length - 1];
        
        if (!effectiveLatestPoint) return null;

        const { STORMNAME, STORMTYPE, MAXWIND, GUST, MSLP } = effectiveLatestPoint.properties;
        const { status, color } = getStormStatus(STORMTYPE, MAXWIND);
        
        return (
          <div key={stormId} className="p-4 flex flex-col gap-2 bg-gray-800 rounded-lg text-white font-bold w-full max-w-80 " style={{ borderLeft: `4px solid ${color}` }}>
            <h2 className="text-lg">{status} {STORMNAME.split(' ').pop()}</h2>                
            <p className="text-sm" >Maximum Wind: {MAXWIND} kt</p>
            <p className="text-sm">Maximum Wind Gusts: {GUST} kt</p>
            <p className="text-sm">Minimum Pressure: {MSLP} mb</p>
          </div>
        );
      })}
    </div>
  );
};

export default LiveTracker; 