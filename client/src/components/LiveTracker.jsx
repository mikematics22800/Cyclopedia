import { useContext } from "react";
import { Context } from "../App";

// Format storm name (now comes pre-formatted from API)
const formatStormName = (storm) => {
  return storm.stormName || storm.name;
};

// Determine storm status and color based on name and wind speed
const getStormStatus = (stormName, maxWindsStr) => {
  // Parse wind speed from string like "30 kt"
  const windSpeed = parseInt(maxWindsStr) || 0;
  
  let color;
  let status;
  
  // Determine type from name
  const nameLower = stormName.toLowerCase();
  
  if (nameLower.includes('depression')) {
    color = "dodgerblue";
    status = "Tropical Depression";
  } else if (nameLower.includes('subtropical storm')) {
    color = "#D0F0C0";
    status = "Subtropical Storm";
  } else if (nameLower.includes('subtropical depression')) {
    color = "aqua";
    status = "Subtropical Depression";
  } else if (nameLower.includes('storm') || nameLower.includes('tropical storm')) {
    color = "lime";
    status = "Tropical Storm";
  } else if (nameLower.includes('hurricane') || nameLower.includes('typhoon') || nameLower.includes('cyclone')) {
    status = "Hurricane";
    // Category based on wind speed
    if (windSpeed <= 82) {
      color = "yellow";
    } else if (windSpeed > 82 && windSpeed <= 95) {
      color = "orange";
    } else if (windSpeed > 95 && windSpeed <= 110) {
      color = "red";
    } else if (windSpeed > 110 && windSpeed <= 135) {
      color = "hotpink";
    } else if (windSpeed > 135) {
      color = "pink";
    }
  } else if (nameLower.includes('extratropical')) {
    color = "#7F00FF";
    status = "Extratropical Cyclone";
  } else if (nameLower.includes('disturbance')) {
    color = "lightgray";
    status = "Tropical Disturbance";
  } else if (nameLower.includes('wave')) {
    color = "gray";
    status = "Tropical Wave";
  } else if (nameLower.includes('low')) {
    color = "white";
    status = "Tropical Low";
  } else {
    // Default to tropical storm
    color = "lime";
    status = "Tropical Storm";
  }
  
  return { status, color };
};

// Convert pressure from inHg to mb
const convertPressureToMb = (pressureStr) => {
  if (!pressureStr || pressureStr === 'N/A') return 'Unavailable';
  
  // Extract numeric value from string like "29.71 inHg"
  const match = pressureStr.match(/[\d.]+/);
  if (!match) return 'Unavailable';
  
  const inHg = parseFloat(match[0]);
  const mb = (inHg * 33.8639).toFixed(1);
  return `${mb} mb`;
};

// Format timestamp to EST with clean formatting
const formatTimestampEST = (timestampStr) => {
  if (!timestampStr) return '';
  
  try {
    // Parse the timestamp and convert to EST
    const date = new Date(timestampStr);
    
    // Format in EST timezone
    const dateOptions = {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York'
    };
    
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      hour12: true
    };
    
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    let timePart = date.toLocaleTimeString('en-US', timeOptions);
    
    // Remove :00 if minutes are zero (keep space before AM/PM)
    timePart = timePart.replace(/:00\s/, ' ');
    
    return `${datePart} at ${timePart} EST`;
  } catch (error) {
    return timestampStr;
  }
};

const LiveTracker = () => {
  const { liveHurdat, selectLiveStorm, selectedLiveStorm } = useContext(Context);

  // Check if data exists and has storms
  if (!liveHurdat || !liveHurdat.storms || liveHurdat.storms.length === 0) {
    return (
      <div className="flex flex-col gap-4 w-full items-center p-4">
        <h2 className="text-white text-lg">No active storms</h2>
      </div>
    );
  }

  const { storms } = liveHurdat;

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {storms.map((storm) => {
        const { id, name, maxWinds, gusts, minPressure, stormType, movement } = storm;
        const { status, color } = getStormStatus(name, maxWinds);
        const formattedName = formatStormName(storm);
        
        const isSelected = id === selectedLiveStorm;
        return (
          <div 
            key={id} 
            className={`bg-gray-700 w-full max-w-80 cursor-pointer transition-all duration-200 rounded-lg hover:ring-2 hover:ring-white ${
              isSelected ? 'ring-2 ring-white' : ''
            }`}
            style={{ borderLeft: `4px solid ${color}` }}
            onClick={() => selectLiveStorm(id)}
          >
            <ul className='storm-data'>
              {/* Storm Header */}
              <li className='flex flex-col pb-2 border-b border-gray-600'>
                <h1 className='text-lg font-bold' style={{color: color}}>
                  {stormType || status} {formattedName}
                </h1>     
              </li>
              
              {/* Wind Data */}
              {maxWinds && maxWinds !== 'N/A' && (
              <li className='flex justify-between items-center p-2 border-b border-gray-600'>
                <h2 className='text-sm font-semibold'>Maximum Wind</h2>
                  <h2 className='text-lg font-bold'>{maxWinds}</h2>
              </li>
              )}
              
              {/* Gust Data */}
              {gusts && gusts !== 'N/A' && (
              <li className='flex justify-between items-center p-2 border-b border-gray-600'>
                <h2 className='text-sm font-semibold'>Maximum Wind Gusts</h2>
                  <h2 className='text-lg font-bold'>{gusts}</h2>
              </li>
              )}
              
              {/* Pressure Data */}
              <li className='flex justify-between items-center p-2 border-b border-gray-600'>
                <h2 className='text-sm font-semibold'>Minimum Pressure</h2>
                <h2 className='text-lg font-bold'>{convertPressureToMb(minPressure)}</h2>
              </li>
              
              {/* Movement Data */}
              {movement && movement !== 'N/A' && (
                <li className='flex justify-between items-center p-2'>
                  <h2 className='text-sm font-semibold'>Movement</h2>
                  <h2 className='text-lg font-bold'>{movement}</h2>
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default LiveTracker; 