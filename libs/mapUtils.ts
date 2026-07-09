import { getBasinFromStormId, type BasinId } from './basins';
import { StormDataPoint, WindRadii } from './hurdat';

const INTENSE_STORM_LABEL: Record<BasinId, string> = {
  atl: 'Hurricane',
  epac: 'Hurricane',
  wpac: 'Typhoon',
  ind: 'Cyclone',
  shem: 'Cyclone',
};

export const getStormStatus = (point: StormDataPoint) => {
  const wind = point.max_wind_kt;
  let status: string;
  let color: string;

  if (point.status === 'LO' || point.status === 'DB' || point.status === 'WV' || point.status === 'MD') {
    status = 'Tropical Low';
    color = 'lightgray';
  } else if (point.status === 'EX' || point.status === 'ET') {
    status = 'Extratropical Cyclone';
    color = '#7F00FF';
  } else if (point.status === 'SD') {
    status = 'Subtropical Depression';
    color = 'aqua';
  } else if (point.status === 'SS') {
    status = 'Subtropical Storm';
    color = '#D0F0C0';
  } else if (point.status === 'TD') {
    status = 'Tropical Depression';
    color = 'dodgerblue';
  } else if (point.status === 'TS') {
    status = 'Tropical Storm';
    color = 'lime';
  } else if (point.status === 'HU' || point.status === 'TY' || point.status === 'ST' || point.status === 'CY') {
    status = 'Hurricane';
    if (wind <= 82) {
      color = 'yellow';
    } else if (wind > 82 && wind <= 95) {
      color = 'orange';
    } else if (wind > 95 && wind <= 112) {
      color = 'red';
    } else if (wind > 112 && wind <= 136) {
      color = 'hotpink';
    } else if (wind >= 137) {
      color = 'pink';
    } else {
      color = 'yellow';
    }
  } else {
    status = 'Unknown';
    color = 'white';
  }

  return { status, color };
};

/** Basin-aware classification label for map/globe popups only. */
export const getPopupStormStatus = (point: StormDataPoint, stormId: string) => {
  if (point.status === 'MD') return 'Monsoon Depression';

  const basin = getBasinFromStormId(stormId);
  if (basin && (point.status === 'HU' || point.status === 'TY')) {
    return INTENSE_STORM_LABEL[basin];
  }

  return getStormStatus(point).status;
};

export const formatDateTime = (date: number, time: number) => {
  const dateArray = date.toString().split('');
  const year = dateArray.slice(0, 4).join('');
  const month = dateArray.slice(4, 6).join('');
  const day = dateArray.slice(-2).join('');

  const timeArray = time.toString().split('');
  const hour = timeArray.slice(0, 2).join('');
  const minute = timeArray.slice(-2).join('');

  let estHour = parseInt(hour, 10) - 5;
  let estDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);

  if (estHour < 0) {
    estHour += 24;
    estDate.setDate(estDate.getDate() - 1);
  }

  let hour12 = estHour;
  const ampm = hour12 >= 12 ? 'PM' : 'AM';
  if (hour12 === 0) hour12 = 12;
  if (hour12 > 12) hour12 -= 12;

  const estHourStr = hour12.toString();
  const formattedTime = `${estHourStr}:${minute} ${ampm}`;

  const estMonth = (estDate.getMonth() + 1).toString();
  const estDay = estDate.getDate().toString();
  const estYear = estDate.getFullYear();
  const formattedDateEST = `${estMonth}/${estDay}/${estYear}`;

  return { formattedDate: formattedDateEST, formattedTime };
};

export const formatStormFullName = (name: string, status: string) =>
  name !== 'Unnamed' ? `${status} ${name}` : `${name} ${status}`;

export const isUnknownMetric = (value: number | null | undefined) =>
  value == null || value === 0 || value === -999;

export const formatWindDisplay = (wind: number | null | undefined) =>
  isUnknownMetric(wind) ? 'Unknown' : `${wind} kt`;

export const formatPressureDisplay = (pressure: number | null | undefined) =>
  isUnknownMetric(pressure) ? 'Unknown' : `${pressure} mb`;

export const nmToDeg = (nm: number) => nm / 60;

export const calculateWindRadii = (
  lat: number,
  lng: number,
  radii?: WindRadii,
): [number, number][] => {
  const points: [number, number][] = [];
  const { ne = 0, se = 0, sw = 0, nw = 0 } = radii || {};

  for (let angle = 0; angle < 360; angle += 2) {
    let radius: number;
    if (angle >= 0 && angle < 90) radius = ne;
    else if (angle >= 90 && angle < 180) radius = se;
    else if (angle >= 180 && angle < 270) radius = sw;
    else radius = nw;

    const degs = nmToDeg(radius);
    const pointLat = lat + degs * Math.cos((angle * Math.PI) / 180);
    const pointLng = lng + degs * Math.sin((angle * Math.PI) / 180);
    points.push([pointLat, pointLng]);
  }

  return points;
};

export const dotSvg = (color: string) =>
  `<svg fill="${color}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle stroke="black" stroke-width="10" cx="50" cy="50" r="40"/></svg>`;

export const strikeSvg = (color: string) =>
  `<svg fill="${color}" viewBox="-264 -264 528 528" xmlns="http://www.w3.org/2000/svg"><polygon stroke="black" stroke-width="20" points="-36.16358,-87.30662 0,-233.85776 36.16358,-87.30662 165.36241,-165.36241 87.30662,-36.16358 233.85776,0 87.30662,36.16358 165.36241,165.36241 36.16358,87.30662 0,233.85776 -36.16358,87.30662 -165.36241,165.36241 -87.30662,36.16358 -233.85776,0 -87.30662,-36.16358 -165.36241,-165.36241 -36.16358,-87.30662"/></svg>`;

export const dotIconDataUrl = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(dotSvg(color))}`;

export const strikeIconDataUrl = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(strikeSvg(color))}`;

export const buildPopupHtml = (
  fullName: string,
  formattedDate: string,
  formattedTime: string,
  point: StormDataPoint,
) => `
  <div class="popup-panel">
    <h1>${fullName}</h1>
    <ul>
      <li>${formattedDate} ${formattedTime} EST</li>
      <li>Maximum Wind: ${formatWindDisplay(point.max_wind_kt)}</li>
      <li>Minimum Pressure: ${formatPressureDisplay(point.min_pressure_mb)}</li>
    </ul>
  </div>
`;

export const buildWindPopupHtml = (label: string) =>
  `<div class="popup-panel wind-popup"><h1>Wind: ${label}</h1></div>`;

export const shiftLngToReference = (lng: number, referenceLng: number): number => {
  let shifted = lng;
  while (shifted - referenceLng > 180) shifted -= 360;
  while (shifted - referenceLng < -180) shifted += 360;
  return shifted;
};

export const projectPathForMapView = (
  points: [number, number][],
  centerLng: number,
): [number, number][] => {
  if (points.length === 0) return [];

  const result: [number, number][] = [
    [points[0][0], shiftLngToReference(points[0][1], centerLng)],
  ];

  for (let i = 1; i < points.length; i++) {
    const [lat, lng] = points[i];
    let adjustedLng = lng;
    const prevLng = result[i - 1][1];
    while (adjustedLng - prevLng > 180) adjustedLng -= 360;
    while (adjustedLng - prevLng < -180) adjustedLng += 360;
    result.push([lat, adjustedLng]);
  }

  return result;
};

export const shiftRegionForMapView = (
  points: [number, number][],
  anchorLng: number,
  centerLng: number,
): [number, number][] => {
  const delta = shiftLngToReference(anchorLng, centerLng) - anchorLng;
  if (delta === 0) return points;
  return points.map(([lat, lng]) => [lat, lng + delta]);
};
