import { useContext } from 'react';
import { Context } from "../App";
import { Polygon, Popup } from "react-leaflet";

const AreasOfInterest = () => {
  const { areasOfInterest } = useContext(Context);

  const getColorByProbability = (prob2day, prob7day) => {
    // Use the higher probability between 2-day and 7-day
    const maxProb = Math.max(
      parseInt(prob2day.replace('%', '') || 0),
      parseInt(prob7day.replace('%', '') || 0)
    );

    if (maxProb >= 70) {
      return {
        fillColor: 'red',
        color: 'red',
        fillOpacity: 0.3,
        weight: 2
      };
    } else if (maxProb >= 40 && maxProb <= 60) {
      return {
        fillColor: 'orange',
        color: 'orange',
        fillOpacity: 0.3,
        weight: 2
      };
    } else if (maxProb >= 0 && maxProb <= 30) {
      return {
        fillColor: 'yellow',
        color: 'yellow',
        fillOpacity: 0.3,
        weight: 2
      };
    } else {
      // Default for any other values
      return {
        fillColor: 'gray',
        color: 'gray',
        fillOpacity: 0.3,
        weight: 2
      };
    }
  };

  const getRiskLevel = (prob2day, prob7day) => {
    const maxProb = Math.max(
      parseInt(prob2day.replace('%', '') || 0),
      parseInt(prob7day.replace('%', '') || 0)
    );

    if (maxProb >= 70) {
      return 'High';
    } else if (maxProb >= 40) {
      return 'Medium';
    } else {
      return 'Low';
    }
  };

  // Check if data exists
  if (!areasOfInterest || areasOfInterest.length === 0) {
    return null;
  }

  return (
    <>
      {areasOfInterest.map((feature, index) => {
        const { prob2day, prob7day, basin } = feature.properties;
        const style = getColorByProbability(prob2day, prob7day);

        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        const coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);

        return (
          <Polygon
            key={`area-${index}`}
            positions={coordinates}
            fillColor={style.fillColor}
            color={style.color}
            fillOpacity={style.fillOpacity}
            weight={style.weight}
          >
            <Popup className="w-fit font-bold">
              <h1 className="text-[1rem] font-bold">Potential Development</h1>
              <p className="!my-1">2-Day Probability: {prob2day}</p>
              <p className="!my-1">7-Day Probability: {prob7day}</p>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
};

export default AreasOfInterest;