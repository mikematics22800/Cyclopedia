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
    } else if (tracker && selectedLiveStorm && liveHurdat && liveHurdat.storms && liveHurdat.storms.length > 0) {
      // Handle live storm selection - find the selected storm
      const selectedStorm = liveHurdat.storms.find(storm => storm.id === selectedLiveStorm);
      
      if (selectedStorm && selectedStorm.latitude && selectedStorm.longitude) {
        // Center the map on the storm's current position
        map.setView([selectedStorm.latitude, selectedStorm.longitude], 6, {
          animate: true,
          duration: 1
        });
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
