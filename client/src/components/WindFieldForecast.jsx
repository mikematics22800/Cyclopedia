import { useContext } from "react";
import { Context } from "../App";
import { Polygon, Popup } from "react-leaflet";

const WindFieldForecast = () => {
  const { windFieldForecast } = useContext(Context);

  if (!windFieldForecast || windFieldForecast.length === 0) return null;

  const windFields = windFieldForecast.map((feature, i) => {
    const coordinates = feature.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
    const { RADII, NE, SE, SW, NW, VALIDTIME, SYNOPTIME, TAU } = feature.properties;
    
    // Format the times for display
    const validTime = new Date(
      VALIDTIME.slice(0, 4),
      VALIDTIME.slice(4, 6) - 1,
      VALIDTIME.slice(6, 8),
      VALIDTIME.slice(8, 10)
    ).toLocaleString('en-US', { timeZone: 'UTC' });
    
    const synopTime = new Date(
      SYNOPTIME.slice(0, 4),
      SYNOPTIME.slice(4, 6) - 1,
      SYNOPTIME.slice(6, 8),
      SYNOPTIME.slice(8, 10)
    ).toLocaleString('en-US', { timeZone: 'UTC' });

    return (
      <div key={i}>
        <Polygon 
          positions={coordinates} 
          color="yellow"
          opacity={0.5}
        >
          <Popup className="font-bold">
            <h1 className="text-md">Wind: ≥{RADII} kt</h1>
            <h1 className="text-sm">Valid: {validTime} UTC</h1>
            <h1 className="text-sm">Synoptic: {synopTime} UTC</h1>
            <h1 className="text-sm">Forecast Hour: {TAU}</h1>
            <h1 className="text-sm">NE: {NE} nm</h1>
            <h1 className="text-sm">SE: {SE} nm</h1>
            <h1 className="text-sm">SW: {SW} nm</h1>
            <h1 className="text-sm">NW: {NW} nm</h1>
          </Popup>
        </Polygon>
      </div>
    );
  });

  return <>{windFields}</>;
};

export default WindFieldForecast; 