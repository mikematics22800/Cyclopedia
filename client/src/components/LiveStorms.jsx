import { useContext } from "react";
import { Context } from "../App";
import { Polyline, Popup, Marker, Polygon } from "react-leaflet";
import { divIcon } from "leaflet";

export const getStormStatus = (STORMTYPE, MAXWIND) => {
  let color;
  let status;

  if (STORMTYPE === "LO") {
    color = "white";
    status = "Tropical Low";
  } else if (STORMTYPE === "DB") {
    color = "lightgray";
    status = "Tropical Disturbance";
  } else if (STORMTYPE === "WV") {
    color = "gray";
    status = "Tropical Wave";
  } else if (STORMTYPE === "EX") {
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
  } else if (STORMTYPE === "HU" || STORMTYPE === "MH" ||STORMTYPE === "TY" ) {
    if (MAXWIND <= 82) {
      color = "yellow";
      status = "Category 1 Hurricane";
    } else if (MAXWIND > 82 && MAXWIND <= 95) {
      color = "orange";
      status = "Category 2 Hurricane";
    } else if (MAXWIND > 95 && MAXWIND <= 110) {
      color = "red";
      status = "Category 3 Hurricane";
    } else if (MAXWIND > 110 && MAXWIND <= 135) {
      color = "hotpink";
      status = "Category 4 Hurricane";
    } else if (MAXWIND > 135) {
      color = "pink";
      status = "Category 5 Hurricane";
    }
  } else {
    // Default case for unrecognized storm types
    color = "gray";
    status = "Unknown Storm Type";
  }

  return { status, color };
};

// Convert ADVDATE format to required format "MM/DD/YYYY at HH:MM AM/PM EST"
export const convertToUTC = (dateStr) => {
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

export const getLatestPoint = (points) => {
  return findCurrentPosition(points);
};

const LiveStorms = () => {
  const { liveHurdat, forecastCone, selectedLiveStorm } = useContext(Context);

  // Check if data exists
  if (!liveHurdat || liveHurdat.length === 0) {
    return null;
  }

  const stormIcon = (color, maxWind, stormId) => {
    // Calculate rotation speed based on wind speed
    // Higher wind speeds = faster rotation
    const duration = `${1000/maxWind}s`
    const uniqueClass = `rotating-storm-${stormId}`
    return (
      new divIcon({
        className: "bg-opacity-0",
        html: `<style>
          @keyframes rotate-${stormId} {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          .${uniqueClass} {
            animation: rotate-${stormId} ${duration} linear infinite;
            transform-origin: center;
          }
        </style>
        <div class="${uniqueClass}">
          <svg fill="${color}" stroke="black" stroke-width="20" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 1000 1000" style="enable-background:new 0 0 1000 1000;" xml:space="preserve">
            <path id="XMLID_4_" d="M770.4727173,227.425354c39.6831055-15.4902954,82.9113159-27.1513672,128.5977783-34.2336426
            c-50.8377686-12.8282471-105.7141113-19.8361816-162.9956055-19.8361816
            c-183.9008179,0-343.3033447,72.2774048-421.7575073,177.8726196l0.3860474,0.1188965
            c0.3860474-0.5049438,0.8018188-0.9799805,1.2175903-1.4847412C282.5142212,390.8115845,262.4403687,443.045105,262.4403687,500
            c0,40.2366333,10.0072021,78.1422729,27.668335,111.3560791c32.2402954,60.6321411,3.3745728,136.3082275-60.6011963,161.2643433
            c-39.6578979,15.4700928-82.8701782,27.1080933-128.5780029,34.1878052
            c50.8377686,12.8282471,105.7141113,19.8362427,162.9956055,19.8362427
            c183.9008179,0,343.3033447-72.2775879,421.7575073-177.8728638l-0.3860474-0.1187134
            C717.9905396,607.9707642,737.5596313,556.2719727,737.5596313,500c0-40.2181396-10.0053711-78.0926514-27.6586914-111.2879639
            C677.6546021,328.0757446,706.4966431,252.3985596,770.4727173,227.425354z M500,574.2373657
            c-41.008728,0-74.2373657-33.2286377-74.2373657-74.2373657S458.991272,425.7626343,500,425.7626343
            S574.2373657,458.991272,574.2373657,500S541.008728,574.2373657,500,574.2373657z"/>
          </svg>
        </div>`,
        iconSize: [40, 40]
      })
    )
  }

  const dot = (color) => {
    return (
      new divIcon({
        className: "bg-opacity-0",
        html: `<svg fill="${color}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle stroke="black" stroke-width="10" cx="50" cy="50" r="40" /></svg>`,
        iconSize: [10, 10]
      })
    )
  }

  // Group storms by STORM_ID
  const stormGroups = {};
  liveHurdat.forEach(feature => {
    const { STORM_ID } = feature.properties;
    if (!stormGroups[STORM_ID]) {
      stormGroups[STORM_ID] = [];
    }
    stormGroups[STORM_ID].push(feature);
  });

  // Process each storm
  const liveStorms = {};
  Object.keys(stormGroups).forEach(stormId => {
    const points = stormGroups[stormId];
    const currentPosition = findCurrentPosition(points);
    
    if (currentPosition) {
      // Sort all points by date for the track
      const sortedPoints = [...points].sort((a, b) => {
        const dateA = parseDate(a.properties.ADVDATE);
        const dateB = parseDate(b.properties.ADVDATE);
        return dateA - dateB;
      });
      
      liveStorms[stormId] = {
        markers: [],
        positions: [],
        name: currentPosition.properties.STORMNAME,
        points: sortedPoints,
        currentPosition: currentPosition
      };
      
      // Create positions array
      liveStorms[stormId].positions = sortedPoints.map(point => {
        const [lng, lat] = point.geometry.coordinates[0];
        return [lat, lng];
      });
      
      // Create markers for all points
      sortedPoints.forEach((point, i) => {
        try {
          const [lng, lat] = point.geometry.coordinates[0];
          const { STORMNAME, STORMTYPE, MAXWIND, GUST, ADVDATE, MSLP } = point.properties;
          const { status, color } = getStormStatus(STORMTYPE, MAXWIND);
          
          // Use storm icon for current position, dot for others
          const isCurrentPosition = point === currentPosition;
          const icon = isCurrentPosition ? stormIcon(color, MAXWIND, stormId) : dot(color);
          
          const marker = (
            <Marker key={`marker-${stormId}-${i}`} position={[lat, lng]} icon={icon}>
              <Popup className="w-fit font-bold">
                <h1 className="font-bold text-[1rem]">{status} {STORMNAME.split(" ").pop()}</h1>
                <h1 className="my-1">{convertToUTC(ADVDATE)} </h1>
                <h1>Maximum Wind: {MAXWIND} kt</h1>
                <h1>Maximum Wind Gusts: {GUST} kt</h1>
                {MSLP !== 9999 && <h1>Minimum Pressure: {MSLP} mb</h1>}
              </Popup>
            </Marker>
          );
          
          liveStorms[stormId].markers.push(marker);
        } catch (error) {
          console.error(`Error creating marker for storm ${stormId}, point ${i}:`, error);
        }
      });
    }
  });

  const cones = forecastCone.map((feature) => {
    const coordinates = feature.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
    return (
      <Polygon positions={coordinates} color="red" weight={2}>
        <Popup className="w-fit font-bold">
          <h3>Cone of Uncertainty</h3>
        </Popup>
      </Polygon>
    )
  });

  const tracks = Object.entries(liveStorms).map(([stormId, data]) => {
    const isSelected = stormId === selectedLiveStorm;
    return (
      <div key={stormId}>
        <Polyline 
          key={`polyline-${stormId}-${isSelected}`}
          positions={data.positions} 
          color={isSelected ? "white" : "gray"} 
          opacity={isSelected ? 0.8 : 0.25}
          weight={isSelected ? 3 : 1}
        />
        {data.markers}
      </div>
    );
  });

  return (
    <>
      {tracks}
      {cones}
    </>
  )
}

export default LiveStorms; 