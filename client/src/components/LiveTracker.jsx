import { useContext } from "react";
import { Context } from "../App";
import { convertToUTC, getLatestPoint } from "./LiveStorms";

const getStormStatus = (STORMTYPE, MAXWIND) => {
  let color;
  let status;

  if (STORMTYPE === 'LO') {
    color = "white";
    status = "Tropical Low";
  } else if (STORMTYPE === 'DB') {
    color = "lightgray";
    status = "Tropical Disturbance";
  } else if (STORMTYPE === 'WV') {
    color = "gray";
    status = "Tropical Wave";
  } else if (STORMTYPE === 'EX') {
    color = "#7F00FF";
    status = "Extratropical Cyclone";
  } else if (STORMTYPE === 'SD') {
    color = "aqua";
    status = "Subtropical Depression";
  } else if (STORMTYPE === 'SS') {
    color = "#D0F0C0";
    status = "Subtropical Storm";
  } else if (STORMTYPE === 'TD' || STORMTYPE === 'STD') {
    color = "dodgerblue";
    status = "Tropical Depression";
  } else if (STORMTYPE === 'TS' || STORMTYPE === 'STS') {
    color = "lime";
    status = "Tropical Storm";
  } else if (STORMTYPE === 'HU' || STORMTYPE === 'TY') {
    if (MAXWIND <= 82) {
      color = 'yellow';
      status = 'Category 1 Hurricane';
    } else if (MAXWIND > 82 && MAXWIND <= 95) {
      color = 'orange';
      status = 'Category 2 Hurricane';
    } else if (MAXWIND > 95 && MAXWIND <= 110) {
      color = 'red';
      status = 'Category 3 Hurricane';
    } else if (MAXWIND > 110 && MAXWIND <= 135) {
      color = 'hotpink';
      status = 'Category 4 Hurricane';
    } else if (MAXWIND > 135) {
      color = 'pink';
      status = 'Category 5 Hurricane';
    }
  }
  return { status, color };
};

const LiveTracker = () => {
  const { liveHurdat } = useContext(Context);

  // Group storms by stormkey
  const stormsByKey = liveHurdat.reduce((acc, feature) => {
    const { stormkey } = feature.properties;
    if (!acc[stormkey]) {
      acc[stormkey] = [];
    }
    acc[stormkey].push(feature);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-white font-bold text-xl text-center">Active Storms</h1>
      {Object.entries(stormsByKey).map(([stormkey, points]) => {
        const latestPoint = getLatestPoint(points);
        if (!latestPoint) return null;

        const { STORMNAME, STORMTYPE, MAXWIND, GUST } = latestPoint.properties;
        const { status, color } = getStormStatus(STORMTYPE, MAXWIND);
        
        return (
          <div key={stormkey} className="p-4 flex flex-col gap-2 bg-gray-800 rounded-lg text-white font-bold" style={{ borderLeft: `4px solid ${color}` }}>
            <h2 className="text-lg">{status} {STORMNAME.split(' ').pop()}</h2>                
            <p className="text-sm" >Maximum Wind: {MAXWIND} kt</p>
            <p className="text-sm">Maximum Wind Gusts: {GUST} kt</p>
          </div>
        );
      })}
    </div>
  );
};

export default LiveTracker; 