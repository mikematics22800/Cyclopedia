'use client';

import { useMemo, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGsapReveal } from './hooks/useGsapReveal';

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Parse date string to Date object
const parseDate = (dateStr: string) => {
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
    
    // Convert to 24-hour format
    let hour24 = parseInt(hours);
    if (ampm === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    // Create a date object in the local timezone first
    const localDate = new Date(`${month} ${date} ${year} ${hour24}:${minutes}:00`);
    
    // Convert to UTC by applying timezone offset
    let utcOffset = 0;
    
    // Convert various timezones to UTC
    switch (timezone) {
      case "AST": // Atlantic Standard Time (UTC-4)
        utcOffset = 4; // AST is 4 hours behind UTC
        break;
      case "HST": // Hawaii Standard Time (UTC-10)
        utcOffset = 10; // HST is 10 hours behind UTC
        break;
      case "CST": // Central Standard Time (UTC-6)
        utcOffset = 6; // CST is 6 hours behind UTC
        break;
      case "PST": // Pacific Standard Time (UTC-8)
        utcOffset = 8; // PST is 8 hours behind UTC
        break;
      case "MST": // Mountain Standard Time (UTC-7)
        utcOffset = 7; // MST is 7 hours behind UTC
        break;
      case "EST": // Eastern Standard Time (UTC-5)
        utcOffset = 5; // EST is 5 hours behind UTC
        break;
      default:
        // Default to EST if unknown timezone
        utcOffset = 5;
    }
    
    // Apply the offset to get UTC time
    const utcDate = new Date(localDate.getTime() + (utcOffset * 60 * 60 * 1000));
    
    return utcDate;
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date(0);
  }
};

// Find the previous position for a storm
const findPreviousPosition = (stormPoints: any[], currentPosition: any) => {
  if (!stormPoints || stormPoints.length === 0 || !currentPosition) return null;
  
  // Group by advisory number
  const advisories: any = {};
  stormPoints.forEach(point => {
    const advisoryNum = parseInt(point.properties.ADVISNUM);
    if (!advisories[advisoryNum]) {
      advisories[advisoryNum] = [];
    }
    advisories[advisoryNum].push(point);
  });
  
  const currentAdvisoryNum = parseInt(currentPosition.properties.ADVISNUM);
  const currentAdvisoryPoints = advisories[currentAdvisoryNum];
  
  if (!currentAdvisoryPoints) return null;
  
  // Sort points in the current advisory by date
  currentAdvisoryPoints.sort((a: any, b: any) => {
    const dateA = parseDate(a.properties.ADVDATE);
    const dateB = parseDate(b.properties.ADVDATE);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Find the index of current position
  const currentIndex = currentAdvisoryPoints.findIndex((point: any) => point === currentPosition);
  
  // If there's a previous point in the same advisory, use it
  if (currentIndex > 0) {
    return currentAdvisoryPoints[currentIndex - 1];
  }
  
  // If no previous point in same advisory, check previous advisory
  const previousAdvisoryNum = currentAdvisoryNum - 1;
  if (advisories[previousAdvisoryNum] && advisories[previousAdvisoryNum].length > 0) {
    const previousAdvisoryPoints = advisories[previousAdvisoryNum];
    previousAdvisoryPoints.sort((a: any, b: any) => {
      const dateA = parseDate(a.properties.ADVDATE);
      const dateB = parseDate(b.properties.ADVDATE);
      return dateA.getTime() - dateB.getTime();
    });
    return previousAdvisoryPoints[previousAdvisoryPoints.length - 1];
  }
  
  return null;
};

// Find the current position for a storm (latest advisory, current observation)
const findCurrentPosition = (stormPoints: any[]) => {
  if (!stormPoints || stormPoints.length === 0) return null;
  
  // Group by advisory number
  const advisories: any = {};
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
  latestAdvisoryPoints.sort((a: any, b: any) => {
    const dateA = parseDate(a.properties.ADVDATE);
    const dateB = parseDate(b.properties.ADVDATE);
    return dateA.getTime() - dateB.getTime();
  });
  
  // First try to find a current observation (TAU === 0.0)
  const currentObservation = latestAdvisoryPoints.find((point: any) => point.properties.TAU === 0.0);
  
  if (currentObservation) {
    return currentObservation;
  }
  
  // If no current observation, return the first point in the latest advisory
  return latestAdvisoryPoints[0];
};

// Calculate movement direction in compass degrees and cardinal directions
const calculateMovementDirection = (currentPosition: any, previousPosition: any) => {
  if (!currentPosition || !previousPosition) return null;
  
  try {
    const [currentLng, currentLat] = currentPosition.geometry.coordinates[0];
    const [previousLng, previousLat] = previousPosition.geometry.coordinates[0];
    
    // Calculate bearing in degrees
    const dLng = (currentLng - previousLng) * Math.PI / 180;
    const lat1 = previousLat * Math.PI / 180;
    const lat2 = currentLat * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // Convert to compass bearing (0-360 degrees)
    bearing = (bearing + 360) % 360;
    
    // Convert to cardinal direction
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(bearing / 22.5) % 16;
    const cardinalDirection = directions[index];
    
    return {
      degrees: Math.round(bearing),
      cardinal: cardinalDirection
    };
  } catch (error) {
    console.error("Error calculating movement direction:", error);
    return null;
  }
};

// Calculate movement speed in knots (nautical miles per hour)
const calculateMovementSpeed = (currentPosition: any, previousPosition: any) => {
  if (!currentPosition || !previousPosition) return null;
  
  try {
    const [currentLng, currentLat] = currentPosition.geometry.coordinates[0];
    const [previousLng, previousLat] = previousPosition.geometry.coordinates[0];
    
    const distance = calculateDistance(currentLat, currentLng, previousLat, previousLng);
    
    const currentDate = parseDate(currentPosition.properties.ADVDATE);
    const previousDate = parseDate(previousPosition.properties.ADVDATE);
    
    const timeDiffHours = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60); // Convert ms to hours
    
    if (timeDiffHours <= 0) {
      return null;
    }
    
    const speedKmh = distance / timeDiffHours; // km/h
    
    if (isNaN(speedKmh)) {
      return null;
    }
    
    // Convert km/h to knots (1 knot = 1.852 km/h)
    const speedKnots = speedKmh / 1.852;
    
    return speedKnots;
  } catch (error) {
    console.error("Error calculating movement speed:", error);
    return null;
  }
};

// Get storm status and color
const getStormStatus = (STORMTYPE: string, MAXWIND: number) => {
  let color: string = "gray";
  let status: string = "Unknown";

  if (STORMTYPE === "LO") {
    color = "white";
    status = "Tropical Low";
  } else if (STORMTYPE === "DB") {
    color = "lightgray";
    status = "Tropical Disturbance";
  } else if (STORMTYPE === "WV") {
    color = "gray";
    status = "Tropical Wave";
  } else if (STORMTYPE === "EX" || STORMTYPE === "PTC") {
    color = "#7F00FF";
    status = "Extratropical Cyclone";
  } else if (STORMTYPE === "SD") {
    color = "aqua";
    status = "Subtropical Depression";
  } else if (STORMTYPE === "SS") {
    color = "#D0F0C0";
    status = "Subtropical Storm";
  } else if (STORMTYPE === "TD" || STORMTYPE === "STD") {
    color = "dodgerblue";
    status = "Tropical Depression";
  } else if (STORMTYPE === "TS" || STORMTYPE === "STS") {
    color = "lime";
    status = "Tropical Storm";
  } else if (STORMTYPE === "HU" || STORMTYPE === "MH" || STORMTYPE === "TY") {
    status = "Hurricane";
    if (MAXWIND <= 82) {
      color = "yellow";
    } else if (MAXWIND > 82 && MAXWIND <= 95) {
      color = "orange";
    } else if (MAXWIND > 95 && MAXWIND <= 110) {
      color = "red";
    } else if (MAXWIND > 110 && MAXWIND <= 135) {
      color = "hotpink";
    } else if (MAXWIND > 135) {
      color = "pink";
    }
  }

  return { status, color };
};

const LiveTracker = () => {
  const { liveHurdat, liveStormId, setLiveStormId } = useAppContext();
  const listRef = useRef<HTMLDivElement>(null);

  // Group storms by STORM_ID
  const stormGroups: { [key: string]: any[] } = {};
  liveHurdat.forEach(feature => {
    const { STORM_ID } = feature.properties;
    if (!stormGroups[STORM_ID]) {
      stormGroups[STORM_ID] = [];
    }
    stormGroups[STORM_ID].push(feature);
  });

  const stormGroupKey = useMemo(() => {
    const ids = liveHurdat.map((f) => f.properties.STORM_ID as string);
    return [...new Set(ids)].sort().join('|');
  }, [liveHurdat]);

  useGsapReveal(listRef, [stormGroupKey], {
    y: 22,
    stagger: 0.09,
  });

  return (
    <div
      ref={listRef}
      className="flex flex-col gap-4 w-full data-rows-center"
    >
      {Object.entries(stormGroups).length === 0 && (
        <h1
          data-gsap-reveal
          className="text-white/90 text-center font-bold text-sm lg:text-base px-4 py-6 archive-panel-shell"
        >
          No tropical cyclones in the Atlantic and Pacific basin at this time.
        </h1>
      )}
      {Object.entries(stormGroups).map(([stormId, points]) => {
        const currentPosition = findCurrentPosition(points);
        
        if (!currentPosition) return null;

        const { STORMNAME, STORMTYPE, MAXWIND, GUST, MSLP } = currentPosition.properties;
        const { status, color } = getStormStatus(STORMTYPE, MAXWIND);
        
        // Calculate movement speed and direction
        const previousPosition = findPreviousPosition(points, currentPosition);
        const movementSpeed = calculateMovementSpeed(currentPosition, previousPosition);
        const movementDirection = calculateMovementDirection(currentPosition, previousPosition);
        
        const isSelected = stormId === liveStormId;
        return (
          <div
            key={stormId}
            data-gsap-reveal
            className={`live-storm-card ${isSelected ? 'selected' : ''}`}
            style={{ borderLeft: `4px solid ${color}` }}
            onClick={() => setLiveStormId(stormId)}
          >
            <ul className='data-table'>
              {/* Storm Header */}
              <li className='header'>
                <h1 className='title' style={{color: color}}>
                  {status} {STORMNAME.split(' ').pop()}
                </h1>     
              </li>
              
              {/* Wind Data */}
              <li className='data-row border-b'>
                <h2 className='label'>Maximum Wind</h2>
                <h2 className='value'>{MAXWIND || 'Unavailable'} kt</h2>
              </li>
              
              {/* Gust Data */}
              <li className='data-row border-b'>
                <h2 className='label'>Maximum Wind Gusts</h2>
                <h2 className='value'>{GUST || 'Unavailable'} kt</h2>
              </li>
              
              {/* Pressure Data */}
              <li className='data-row border-b'>
                <h2 className='label'>Minimum Pressure</h2>
                <h2 className='value'>{MSLP || 'Unavailable'} mb</h2>
              </li>
              
              {/* Movement Data */}
              <li className='data-row'>
                <h2 className='label'>Movement</h2>
                <h2 className='value'>
                  {movementSpeed !== null && movementDirection !== null 
                    ? `${movementDirection.cardinal} at ${Math.round(movementSpeed)} kt`
                    : 'Unavailable'
                  }
                </h2>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default LiveTracker;
