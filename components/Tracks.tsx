'use client';

import { useAppContext } from '../contexts/AppContext';
import { Marker, Popup, Polyline } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  dotSvg,
  formatDateTime,
  formatStormFullName,
  getStormStatus,
  strikeSvg,
} from '../libs/mapUtils';

const Tracks = () => {
  const { season, setStormId, stormId } = useAppContext();

  if (!season) return null;

  const dot = (color: string) => {
    return divIcon({
      className: 'bg-opacity-0',
      html: dotSvg(color),
      iconSize: [10, 10]
    });
  };

  const strike = (color: string) => {
    return divIcon({
      className: 'bg-opacity-0',
      html: strikeSvg(color),
      iconSize: [25, 25]
    });
  };

  return (
    <>
      {season.map((storm) => {
        const id = storm.id;
        const name = id.split('_')[1];
        const positions: [number, number][] = [];
        
        const points = storm.data.map((point, i) => {
          const { formattedDate, formattedTime } = formatDateTime(point.date, point.time_utc);
          const { lat, lng } = point;
          const coords: [number, number] = [lat, lng];
          positions.push(coords);
          
          const { status, color } = getStormStatus(point);
          const icon = point.record === 'L' ? strike(color) : dot(color);
          const fullName = formatStormFullName(name, status);

          return (
            <Marker 
              key={i} 
              position={coords} 
              icon={icon}
              eventHandlers={{
                click: () => {
                  setStormId(id);
                }
              }}
            >
              <Popup className="storm-popup">
                <div className="popup-panel">
                  <h1>{fullName}</h1>
                  <ul>
                    <li>{formattedDate} {formattedTime} EST</li>
                    <li>Maximum Wind: {point.max_wind_kt} kt</li>
                    <li>Minimum Pressure: {point.min_pressure_mb ? `${point.min_pressure_mb} mb` : 'Unknown'}</li>
                  </ul>
                </div>
              </Popup>
            </Marker>
          );
        });

        const isSelected = id === stormId;
        return (
          <div key={id}>
            <Polyline 
              key={`polyline-${id}-${isSelected}`}
              positions={positions} 
              color={isSelected ? "white" : "gray"}
              opacity={isSelected ? 1 : .5}
              weight={isSelected ? 4 : 2}
              eventHandlers={{
                click: () => {
                  setStormId(id);
                }
              }}
            />
            {points}
          </div>
        );
      })}
    </>
  );
};

export default Tracks;  