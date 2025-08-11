import { useContext, useMemo } from 'react';
import { Context } from "../App";
import { Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

const PointsOfInterest = () => {
  const { pointsOfInterest, areasOfInterest } = useContext(Context);

  // Check if data exists
  if (!pointsOfInterest || pointsOfInterest.length === 0) {
    return null;
  }

  // Function to determine color based on probability
  const getColorByProbability = (prob2day, prob7day) => {
    const maxProb = Math.max(
      parseInt(prob2day.replace('%', '') || 0),
      parseInt(prob7day.replace('%', '') || 0)
    );

    if (maxProb >= 70) {
      return '#ff0000'; // Red for high probability
    } else if (maxProb >= 40) {
      return '#ffa500'; // Orange for medium probability
    } else {
      return '#ffff00'; // Yellow for low probability
    }
  };

  // Function to check if a point is inside any area of interest
  const isPointInsideArea = (point, areas) => {
    if (!areas || areas.length === 0) return false;
    
    return areas.some(area => {
      try {
        // Simple point-in-polygon check using ray casting algorithm
        const coordinates = area.geometry.coordinates[0];
        const polygon = coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
        
        return pointInPolygon([point[1], point[0]], polygon);
      } catch (error) {
        console.error('Error checking point in polygon:', error);
        return false;
      }
    });
  };

  // Ray casting algorithm for point-in-polygon test
  const pointInPolygon = (point, polygon) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // Memoize the points and connections to avoid unnecessary recalculations
  const pointsAndConnections = useMemo(() => {
    const points = [];
    const connections = [];

    pointsOfInterest.forEach((feature, index) => {
      const { prob2day, prob7day, basin } = feature.properties;
      const coordinates = feature.geometry.coordinates; // [lng, lat]
      const point = [coordinates[1], coordinates[0]]; // Convert to [lat, lng] for Leaflet
      
      const color = getColorByProbability(prob2day, prob7day);
      const isInside = isPointInsideArea(coordinates, areasOfInterest);
      
      points.push({
        id: index,
        point,
        color,
        prob2day,
        prob7day,
        basin,
        isInside
      });

      // If point is not inside any area, create a connection line to the nearest area
      if (!isInside && areasOfInterest && areasOfInterest.length > 0) {
        // Find the nearest area center
        let nearestArea = null;
        let minDistance = Infinity;
        
        areasOfInterest.forEach(area => {
          try {
            const areaCoords = area.geometry.coordinates[0];
            const areaCenter = [
              areaCoords.reduce((sum, coord) => sum + coord[1], 0) / areaCoords.length,
              areaCoords.reduce((sum, coord) => sum + coord[0], 0) / areaCoords.length
            ];
            
            const distance = Math.sqrt(
              Math.pow(areaCenter[0] - coordinates[1], 2) + 
              Math.pow(areaCenter[1] - coordinates[0], 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestArea = areaCenter;
            }
          } catch (error) {
            console.error('Error calculating area center:', error);
          }
        });

        if (nearestArea) {
          connections.push({
            from: point,
            to: [nearestArea[0], nearestArea[1]],
            color: color
          });
        }
      }
    });

    return { points, connections };
  }, [pointsOfInterest, areasOfInterest]);

  return (
    <>
      {/* Render connection lines */}
      {pointsAndConnections.connections.map((connection, index) => (
        <Polyline
          key={`connection-${index}`}
          positions={[connection.from, connection.to]}
          color={connection.color}
          weight={2}
          opacity={0.6}
          dashArray="5, 5"
        />
      ))}
      
      {/* Render points of interest */}
      {pointsAndConnections.points.map((pointData) => {
        // Create custom X icon
        const xIcon = L.divIcon({
          html: `
            <div style="
              width: 25px; 
              height: 25px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              font-size: 25px;
              font-weight: bold;
              color: ${pointData.color};
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            ">
              ✕
            </div>
          `,
          className: 'custom-x-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        return (
          <Marker
            key={`point-${pointData.id}`}
            position={pointData.point}
            icon={xIcon}
          >
            <Popup className="w-fit font-bold">
              <h1 className="text-[1rem] font-bold">Potential Development</h1>
              <p className="!my-1">2-Day Probability: {pointData.prob2day}</p>
              <p className="!my-1">7-Day Probability: {pointData.prob7day}</p>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default PointsOfInterest;
