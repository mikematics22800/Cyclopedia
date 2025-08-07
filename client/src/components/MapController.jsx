import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useContext } from "react";
import { Context } from "../App";

const MapController = () => {
  const map = useMap();
  const { selectedLiveStorm, liveHurdat, stormId, season, tracker } = useContext(Context);

  useEffect(() => {
    if (tracker && selectedLiveStorm && liveHurdat.length > 0) {
      // Handle live storm selection
      const stormPoints = liveHurdat.filter(feature => 
        feature.properties.STORM_ID === selectedLiveStorm
      );
      
      if (stormPoints.length > 0) {
        // Get the current position of the storm
        const currentPosition = findCurrentPosition(stormPoints);
        
        if (currentPosition) {
          const [lng, lat] = currentPosition.geometry.coordinates[0];
          
          // Center the map on the storm's current position
          map.setView([lat, lng], 6, {
            animate: true,
            duration: 1
          });
        }
      }
    } else if (!tracker && stormId && season) {
      // Handle archived storm selection
      const selectedStorm = season.find(storm => storm.id === stormId);
      
      if (selectedStorm && selectedStorm.data.length > 0) {
        // Get the first point of the storm to center on
        const firstPoint = selectedStorm.data[0];
        const { lat, lng } = firstPoint;
        
        // Center the map on the storm's first position
        map.setView([lat, lng], 6, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [selectedLiveStorm, liveHurdat, stormId, season, tracker, map]);

  return null;
};

// Helper function to find current position (copied from LiveStorms.jsx)
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

// Helper function to parse date (copied from LiveStorms.jsx)
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

export default MapController;
