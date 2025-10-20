import { useContext } from "react";
import { Context } from "../App";
import { Marker, Popup, Polygon, Polyline } from "react-leaflet";
import { divIcon } from "leaflet";

// Get coordinates from storm data (now using latitude/longitude directly)
const getCoordinates = (storm) => {
  try {
    if (!storm.latitude || !storm.longitude) return null;
    return [storm.latitude, storm.longitude];
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
};

// Format storm name (now comes pre-formatted from API)
const formatStormName = (storm) => {
  return storm.stormName || storm.name;
};

// Determine storm status and color based on storm type and wind speed
export const getStormStatus = (stormType, maxWindsStr) => {
  // Parse wind speed from string like "30 mph" or "30 kt"
  const windSpeed = parseInt(maxWindsStr) || 0;
  
  let color;
  let status = stormType;
  
  // Convert mph to kt if needed (most categorization uses kt)
  const windKt = maxWindsStr.includes('mph') ? Math.round(windSpeed * 0.868976) : windSpeed;
  
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
    if (windKt <= 82) {
      color = "yellow";
    } else if (windKt > 82 && windKt <= 95) {
      color = "orange";
    } else if (windKt > 95 && windKt <= 110) {
      color = "red";
    } else if (windKt > 110 && windKt <= 135) {
      color = "hotpink";
    } else if (windKt > 135) {
      color = "pink";
    }
  } else {
    // Default to invest/disturbance for unknown types
    color = "lightgray";
    status = stormType;
  }
  
  return { status, color };
};

export const getLatestPoint = (storms) => {
  // For tropical-tidbits data, just return the first storm if it exists
  return storms && storms.length > 0 ? storms[0] : null;
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

const LiveStorms = () => {
  const { liveHurdat, forecastCone, selectedLiveStorm, selectLiveStormPoint } = useContext(Context);

  // Check if data exists and has storms
  if (!liveHurdat || !liveHurdat.storms || liveHurdat.storms.length === 0) {
    return null;
  }

  const { storms } = liveHurdat;
  
  // Filter out invests - only show named storms and tropical cyclones
  const activeStorms = storms.filter(storm => 
    !storm.stormType.toLowerCase().includes('invest')
  );
  
  // Return null if no active storms after filtering
  if (activeStorms.length === 0) {
    return null;
  }

  // Small dot icon for track history points
  const dot = (color) => {
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: `<svg fill=${color} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle stroke="black" stroke-width="10" cx="50" cy="50" r="40" /></svg>`,
        iconSize: [10, 10]
      })
    )
  };

  // Large rotating storm icon for current position
  const stormIcon = (color, maxWind, stormId) => {
    // Calculate rotation speed based on wind speed
    // Higher wind speeds = faster rotation
    const windSpeed = parseInt(maxWind) || 30;
    const duration = `${1000/windSpeed}s`;
    const uniqueClass = `rotating-storm-${stormId}`;
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
    );
  };

  const stormElements = activeStorms.map((storm) => {
    const { id, name, maxWinds, gusts, minPressure, lastUpdate, stormType, track } = storm;
    const formattedName = formatStormName(storm);
    
    const coords = getCoordinates(storm);
    
    if (!coords) {
      console.log(`Skipping storm ${id} - no valid coordinates`);
      return null;
    }
    
    const [lat, lng] = coords;
    const windSpeed = parseInt(maxWinds) || 30;
    
    // Get status and color for current position
    const { status, color } = getStormStatus(stormType, maxWinds);

    // Track history positions for polyline
    const trackPositions = [];
    
    // Track history markers (if track data exists)
    const trackMarkers = track && track.length > 0 ? track.map((point, i) => {
      const pointCoords = [point.latitude, point.longitude];
      trackPositions.push(pointCoords);
      
      // Determine color for this historical point
      const { color: pointColor } = getStormStatus(point.stormType, point.maxWinds);
      
      // Only show the last position with the rotating icon (skip it here)
      if (i === track.length - 1) {
        return null;
      }
      
      return (
        <Marker 
          key={`${id}-track-${i}`} 
          position={pointCoords} 
          icon={dot(pointColor)}
          eventHandlers={{
            click: () => {
              selectLiveStormPoint(id, point.latitude, point.longitude);
            }
          }}
        >
          <Popup className="w-fit font-bold">
            <h1 className="text-[1rem]">{stormType} {formattedName}</h1>
            <h1 className="my-1 text-sm">{formatTimestampEST(point.timestamp)}</h1>
            {point.maxWinds && point.maxWinds !== 'N/A' && <h1>Maximum Wind: {point.maxWinds}</h1>}
            {point.gusts && point.gusts !== 'N/A' && <h1>Maximum Wind Gusts: {point.gusts}</h1>}
            {point.minPressure && point.minPressure !== 'N/A' && <h1>Minimum Pressure: {point.minPressure}</h1>}
            {point.movement && point.movement !== 'N/A' && <h1>Movement: {point.movement}</h1>}
          </Popup>
        </Marker>
      );
    }).filter(marker => marker !== null) : [];
    
    // Current position marker (large rotating icon)
    const currentMarker = (
      <Marker 
        key={`${id}-current`}
        position={[lat, lng]} 
        icon={stormIcon(color, windSpeed, id)}
        eventHandlers={{
          click: () => {
            selectLiveStormPoint(id, lat, lng);
          }
        }}
      >
        <Popup className="w-fit font-bold">
          <h1 className="font-bold text-[1rem]">{stormType || status} {formattedName}</h1>
          {lastUpdate && <h1 className="my-1 text-sm">{formatTimestampEST(lastUpdate)}</h1>}
          {maxWinds && maxWinds !== 'N/A' && <h1>Maximum Wind: {maxWinds}</h1>}
          {gusts && gusts !== 'N/A' && <h1>Maximum Wind Gusts: {gusts}</h1>}
          {minPressure && minPressure !== 'N/A' && <h1>Minimum Pressure: {minPressure}</h1>}
          {storm.movement && storm.movement !== 'N/A' && <h1>Movement: {storm.movement}</h1>}
        </Popup>
      </Marker>
    );

    // Track polyline (if we have track data)
    const isSelected = selectedLiveStorm === id;
    const trackLine = trackPositions.length > 1 ? (
      <Polyline 
        key={`${id}-polyline`}
        positions={trackPositions} 
        color={isSelected ? "white" : "gray"} 
        opacity={isSelected ? 0.8 : 0.5}
        weight={isSelected ? 3 : 2}
      />
    ) : null;
    
    return (
      <div key={id}>
        {trackLine}
        {trackMarkers}
        {currentMarker}
      </div>
    );
  }).filter(element => element !== null);

  const cones = forecastCone.map((feature, index) => {
    const coordinates = feature.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
    return (
      <Polygon key={index} positions={coordinates} color="red" weight={2}>
        <Popup className="w-fit font-bold">
          <h3>Cone of Uncertainty</h3>
        </Popup>
      </Polygon>
    );
  });

  return (
    <>
      {stormElements}
      {cones}
    </>
  );
};

export default LiveStorms;
