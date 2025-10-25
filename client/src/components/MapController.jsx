import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useContext } from "react";
import { Context } from "../App";

const MapController = () => {
  const map = useMap();
  const { selectedLiveStorm, liveHurdat, stormId, season, tracker, clickedPoint } = useContext(Context);

  useEffect(() => {
    if (clickedPoint) {
      // Center the map on the clicked point
      map.setView([clickedPoint.lat, clickedPoint.lng], 6, {
        animate: true,
        duration: 1
      });
    } else if (tracker && selectedLiveStorm && liveHurdat && liveHurdat.length > 0) {
      // Handle live storm selection - find the selected storm's current position
      const stormPoints = liveHurdat.filter(feature => feature.properties.STORM_ID === selectedLiveStorm);
      
      if (stormPoints.length > 0) {
        // Find the current position (latest advisory, current observation)
        const advisories = {};
        stormPoints.forEach(point => {
          const advisoryNum = parseInt(point.properties.ADVISNUM);
          if (!advisories[advisoryNum]) {
            advisories[advisoryNum] = [];
          }
          advisories[advisoryNum].push(point);
        });
        
        const latestAdvisoryNum = Math.max(...Object.keys(advisories).map(Number));
        const latestAdvisoryPoints = advisories[latestAdvisoryNum];
        
        if (latestAdvisoryPoints) {
          // Sort points in the latest advisory by date
          latestAdvisoryPoints.sort((a, b) => {
            const dateA = new Date(a.properties.ADVDATE);
            const dateB = new Date(b.properties.ADVDATE);
            return dateA - dateB;
          });
          
          // First try to find a current observation (TAU === 0.0)
          const currentObservation = latestAdvisoryPoints.find(point => point.properties.TAU === 0.0);
          const currentPosition = currentObservation || latestAdvisoryPoints[0];
          
          if (currentPosition) {
            const [lng, lat] = currentPosition.geometry.coordinates[0];
            // Center the map on the storm's current position
            map.setView([lat, lng], 6, {
              animate: true,
              duration: 1
            });
          }
        }
      }
    } else if (!tracker && stormId && season) {
      // Handle archived storm selection (fallback to first point)
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
  }, [clickedPoint, selectedLiveStorm, liveHurdat, stormId, season, tracker, map]);

  return null;
};

export default MapController;
