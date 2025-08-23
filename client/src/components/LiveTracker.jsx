import { useContext } from "react";
import { Context } from "../App";
import { getLatestPoint, getStormStatus } from "./LiveStorms";

// Convert ADVDATE format to required format "MM/DD/YYYY at HH:MM AM/PM EST"
const convertToUTC = (dateStr) => {
  try {
    // Parse the date string components: "1100 PM AST Sun Aug 03 2025"
    const parts = dateStr.split(" ");
    if (parts.length !== 7) {
      throw new Error("Invalid date format");
    }
    
    const [time, ampm, timezone, month, date, year] = parts;
    
    // Parse time: "1100" -> "11:00"
    const hours = time.slice(0, -2);
    const minutes = time.slice(-2);
    
    // Convert to 24-hour format
    let hour24 = parseInt(hours);
    if (ampm === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    // Create a date object in the local timezone first
    const localDate = new Date(`${month} ${date} ${year} ${hour24}:${minutes}:00`);
    
    // Convert to EST by applying timezone offset
    let estOffset = 0;
    
    // Convert various timezones to EST
    switch (timezone) {
      case "AST": // Atlantic Standard Time (UTC-4)
        estOffset = 1; // AST is 1 hour ahead of EST
        break;
      case "HST": // Hawaii Standard Time (UTC-10)
        estOffset = -5; // HST is 5 hours behind EST
        break;
      case "CST": // Central Standard Time (UTC-6)
        estOffset = -1; // CST is 1 hour behind EST
        break;
      case "PST": // Pacific Standard Time (UTC-8)
        estOffset = -3; // PST is 3 hours behind EST
        break;
      case "MST": // Mountain Standard Time (UTC-7)
        estOffset = -2; // MST is 2 hours behind EST
        break;
      case "EST": // Eastern Standard Time (UTC-5)
        estOffset = 0; // No offset needed
        break;
      default:
        // Default to EST if unknown timezone
        estOffset = 0;
    }
    
    // Apply the offset to get EST time
    const estDate = new Date(localDate.getTime() + (estOffset * 60 * 60 * 1000));
    
    // Format to required format: "MM/DD/YYYY at HH:MM AM/PM EST"
    const monthStr = (estDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = estDate.getDate().toString().padStart(2, '0');
    const yearStr = estDate.getFullYear();
    
    // Convert to 12-hour format
    let hour12 = estDate.getHours();
    const ampm12 = hour12 >= 12 ? 'PM' : 'AM';
    if (hour12 === 0) hour12 = 12;
    if (hour12 > 12) hour12 -= 12;
    const hourStr = hour12.toString(); // Remove padStart to eliminate leading zeros
    const minuteStr = estDate.getMinutes().toString().padStart(2, '0');
    
    return `${monthStr}/${dayStr}/${yearStr} at ${hourStr}:${minuteStr} ${ampm12} EST`;
  } catch (error) {
    console.error("Date parsing error:", error);
    return dateStr; // Return original string if conversion fails
  }
};

// Parse date string to Date object
const parseDate = (dateStr) => {
  try {
    // Parse the date string components: "1100 PM AST Sun Aug 03 2025"
    const parts = dateStr.split(" ");
    if (parts.length !== 7) {
      throw new Error("Invalid date format");
    }
    
    const [time, ampm, timezone, dayOfWeek, month, date, year] = parts;
    
    // Parse time: "1100" -> "11:00"
    const hours = time.slice(0, -2);
    const minutes = time.slice(-2);
    
    return new Date(`${month} ${date} ${year} ${hours}:${minutes} ${ampm} ${timezone}`);
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date(0);
  }
};

// Find the current position for a storm (latest advisory, current observation)
const findCurrentPosition = (stormPoints) => {
  if (!stormPoints || stormPoints.length === 0) return null;
  
  // Group by advisory number
  const advisories = {};
  stormPoints.forEach(point => {
    const advisoryNum = parseInt(point.properties.ADVISNUM);
    if (!advisories[advisoryNum]) {
      advisories[advisoryNum] = [];
    }
    advisories[advisoryNum].push(point);
  });
  
  // Find the latest advisory
  const latestAdvisoryNum = Math.max(...Object.keys(advisories).map(Number));
  const latestAdvisoryPoints = advisories[latestAdvisoryNum];
  
  if (!latestAdvisoryPoints) return null;
  
  // Sort points in the latest advisory by date
  latestAdvisoryPoints.sort((a, b) => {
    const dateA = parseDate(a.properties.ADVDATE);
    const dateB = parseDate(b.properties.ADVDATE);
    return dateA - dateB;
  });
  
  // First try to find a current observation (TAU === 0.0)
  const currentObservation = latestAdvisoryPoints.find(point => point.properties.TAU === 0.0);
  
  if (currentObservation) {
    return currentObservation;
  }
  
  // If no current observation, return the first point in the latest advisory
  return latestAdvisoryPoints[0];
};

const LiveTracker = () => {
  const { liveHurdat, selectLiveStorm, selectedLiveStorm } = useContext(Context);

  // Group storms by STORM_ID
  const stormGroups = {};
  liveHurdat.forEach(feature => {
    const { STORM_ID } = feature.properties;
    if (!stormGroups[STORM_ID]) {
      stormGroups[STORM_ID] = [];
    }
    stormGroups[STORM_ID].push(feature);
  });

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {Object.entries(stormGroups).map(([stormId, points]) => {
        const currentPosition = findCurrentPosition(points);
        
        if (!currentPosition) return null;

        const { STORMNAME, STORMTYPE, MAXWIND, GUST, MSLP } = currentPosition.properties;
        const { status, color } = getStormStatus(STORMTYPE, MAXWIND);
        
        const isSelected = stormId === selectedLiveStorm;
        return (
          <div 
            key={stormId} 
            className={`bg-gray-700 w-full max-w-80 cursor-pointer transition-all duration-200 rounded-lg hover:ring-2 hover:ring-white ${
              isSelected ? 'ring-2 ring-white' : ''
            }`}
            style={{ borderLeft: `4px solid ${color}` }}
            onClick={() => selectLiveStorm(stormId)}
          >
            <ul className='storm-data'>
              {/* Storm Header */}
              <li className='flex flex-col pb-2 border-b border-gray-600'>
                <h1 className='text-lg font-bold' style={{color: color}}>
                  {status} {STORMNAME.split(' ').pop()}
                </h1>     
              </li>
              
              {/* Wind Data */}
              <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
                <h2 className='text-sm font-semibold'>Maximum Wind</h2>
                <h2 className='text-lg font-bold'>{MAXWIND} kt</h2>
              </li>
              
              {/* Gust Data */}
              <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
                <h2 className='text-sm font-semibold'>Maximum Wind Gusts</h2>
                <h2 className='text-lg font-bold'>{GUST} kt</h2>
              </li>
              
              {/* Pressure Data */}
              <li className='flex justify-between items-center p-2 hover:bg-gray-700 transition-colors duration-200'>
                <h2 className='text-sm font-semibold'>Minimum Pressure</h2>
                <h2 className='text-lg font-bold'>{MSLP} mb</h2>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default LiveTracker; 