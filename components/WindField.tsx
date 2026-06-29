'use client';

import { useAppContext } from '../contexts/AppContext';
import { Polygon, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { calculateWindRadii } from '../libs/mapUtils';

const WindField = () => {
  const { storm, year } = useAppContext();

  if (year < 2004 || !storm) return null;

  const windField34kt = storm.data.map((point, i) => {
    const points34kt = calculateWindRadii(point.lat, point.lng, point['34kt_wind_nm']);
    return (
      <div key={i}>
        <Polygon positions={points34kt as LatLngExpression[]} color="yellow" weight={2}>
          <Popup className="storm-popup">
            <div className="popup-panel">
              <h1>Wind: ≥34 kt</h1>
            </div>
          </Popup>
        </Polygon>
      </div>
    );
  });

  const windField50kt = storm.data.map((point, i) => {
    const points50kt = calculateWindRadii(point.lat, point.lng, point['50kt_wind_nm']);
    return (
      <div key={i}>
        <Polygon positions={points50kt as LatLngExpression[]} color="orange" weight={2}>
          <Popup className="storm-popup">
            <div className="popup-panel">
              <h1>Wind: ≥50 kt</h1>
            </div>
          </Popup>
        </Polygon>
      </div>
    );
  });

  const windField64kt = storm.data.map((point, i) => {
    const points64kt = calculateWindRadii(point.lat, point.lng, point['64kt_wind_nm']);
    return (
      <div key={i}>
        <Polygon positions={points64kt as LatLngExpression[]} color="red" weight={2}>
          <Popup className="storm-popup">
            <div className="popup-panel">
              <h1>Wind: ≥64 kt</h1>
            </div>
          </Popup>
        </Polygon>
      </div>
    );
  });

  return (
    <>
      {windField34kt}
      {windField50kt}
      {windField64kt}
    </>
  );
};

export default WindField;
