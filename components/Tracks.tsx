'use client';

import { useAppContext } from '../contexts/AppContext';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import {
  dotSvg,
  formatDateTime,
  formatStormFullName,
  getPopupStormStatus,
  getStormStatus,
  strikeSvg,
} from '../libs/mapUtils';

const Tracks = () => {
  const { globalSeason, selectStorm } = useAppContext();

  if (!globalSeason) return null;

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
      {globalSeason.map((storm) => {
        const id = storm.id;
        const name = id.split('_')[1];

        const points = storm.data.map((point, i) => {
          const { formattedDate, formattedTime } = formatDateTime(point.date, point.time_utc);
          const coords: [number, number] = [point.lat, point.lng];
          
          const { color } = getStormStatus(point);
          const icon = point.record === 'L' ? strike(color) : dot(color);
          const fullName = formatStormFullName(name, getPopupStormStatus(point, id));

          return (
            <Marker 
              key={i} 
              position={coords} 
              icon={icon}
              eventHandlers={{
                click: () => {
                  selectStorm(id);
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

        return <div key={id}>{points}</div>;
      })}
    </>
  );
};

export default Tracks;  