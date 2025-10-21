import { useContext } from "react";
import { Context } from "../App";

// Format storm name - convert from ALL CAPS to Title Case
const formatStormName = (storm) => {
  const name = storm.stormName || storm.name;
  if (!name) return '';
  
  // Convert ALL CAPS to Title Case
  return name.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Determine storm status and color based on storm type and wind speed
const getStormStatus = (stormType, maxWindsStr) => {
  // Parse wind speed from string like "30 kt" or "45 kt"
  const windSpeed = parseInt(maxWindsStr) || 0;
  
  let color;
  let status = stormType;
  
  // Determine type from stormType
  const typeLower = stormType.toLowerCase();
  
  if (typeLower.includes('invest')) {
    color = "lightgray";
    status = "Invest";
  } else if (typeLower.includes('low')) {
    color = "white";
    status = "Tropical Low";
  } else if (typeLower.includes('disturbance')) {
    color = "lightgray";
    status = "Tropical Disturbance";
  } else if (typeLower.includes('wave')) {
    color = "gray";
    status = "Tropical Wave";
  } else if (typeLower.includes('extratropical')) {
    color = "#7F00FF";
    status = "Extratropical Cyclone";
  } else if (typeLower.includes('subtropical depression')) {
    color = "aqua";
    status = "Subtropical Depression";
  } else if (typeLower.includes('subtropical storm')) {
    color = "#D0F0C0";
    status = "Subtropical Storm";
  } else if (typeLower.includes('depression') || typeLower.includes('tropical depression')) {
    color = "dodgerblue";
    status = "Tropical Depression";
  } else if (typeLower.includes('tropical storm')) {
    color = "lime";
    status = "Tropical Storm";
  } else if (typeLower.includes('hurricane') || typeLower.includes('typhoon') || typeLower.includes('cyclone')) {
    status = typeLower.includes('hurricane') ? "Hurricane" : 
             typeLower.includes('typhoon') ? "Typhoon" : "Tropical Cyclone";
    // Category based on wind speed in knots
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
  } else {
    // Default to invest/disturbance for unknown types
    color = "lightgray";
    status = stormType;
  }
  
  return { status, color };
};

// Format pressure (already in mb format)
const formatPressure = (pressureStr) => {
  if (!pressureStr || pressureStr === 'N/A') return 'Unavailable';
  
  // Pressure is already in mb format like "994 mb"
  return pressureStr;
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
  
  // Filter out invests - only show named storms and tropical cyclones
  const activeStorms = storms.filter(storm => 
    !storm.stormType.toLowerCase().includes('invest')
  );

  // Check if we have any active storms after filtering
  if (activeStorms.length === 0) {
    return (
      <div className="flex flex-col gap-4 w-full items-center p-4">
        <h2 className="text-white text-lg">No active storms</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {activeStorms.map((storm) => {
        const { id, name, maxWinds, gusts, minPressure, stormType, movement } = storm;
        const { status, color } = getStormStatus(stormType, maxWinds);
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
              <li className='flex justify-between items-center p-2 border-b border-gray-600'>
                <h2 className='text-sm font-semibold'>Maximum Wind</h2>
                <h2 className='text-lg font-bold'>{maxWinds && maxWinds !== 'N/A' ? maxWinds : 'Unavailable'}</h2>
              </li>
              
              {/* Gust Data */}
              <li className='flex justify-between items-center p-2 border-b border-gray-600'>
                <h2 className='text-sm font-semibold'>Maximum Wind Gusts</h2>
                <h2 className='text-lg font-bold'>{gusts && gusts !== 'N/A' ? gusts : 'Unavailable'}</h2>
              </li>
              
              {/* Pressure Data */}
              <li className='flex justify-between items-center p-2 border-b border-gray-600'>
                <h2 className='text-sm font-semibold'>Minimum Pressure</h2>
                <h2 className='text-lg font-bold'>{formatPressure(minPressure)}</h2>
              </li>
              
              {/* Movement Data */}
              <li className='flex justify-between items-center p-2'>
                <h2 className='text-sm font-semibold'>Movement</h2>
                <h2 className='text-lg font-bold'>{movement && movement !== 'N/A' ? movement : 'Unavailable'}</h2>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default LiveTracker; 