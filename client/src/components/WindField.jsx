import { useContext } from "react";
import { Context } from "../App";
import { Polygon, Popup } from "react-leaflet";

const WindField = () => {
  const { storm, year } = useContext(Context);

  const nmToDeg = (nm) => nm / 60;

  const calculatePoints = (lat, lng, points, radii={}) => {
    let {ne, se, sw, nw} = radii;
    if (!ne) {ne = 0}
    if (!se) {se = 0}
    if (!sw) {sw = 0}
    if (!nw) {nw = 0}
    let radius;
    for (let angle = 0; angle < 360; angle += 2) {
      if (angle >= 0 && angle < 90) radius = ne;
      else if (angle >= 90 && angle < 180) radius = se;
      else if (angle >= 180 && angle < 270) radius = sw;
      else radius = nw;
      const degs = nmToDeg(radius);
      const pointLat = lat + degs * Math.cos((angle * Math.PI) / 180);
      const pointLng = lng + degs * Math.sin((angle * Math.PI) / 180);
      points.push([pointLat, pointLng]);
    }
  }

  if (year < 2004) return null;

  const windField34kt = storm.data.map((point, i) => {
    const {lat, lng} = point;
    const points34kt = [];  
    calculatePoints(lat, lng, points34kt, point["34kt_wind_nm"]);
    return (
      <div key={i}>
        <Polygon positions={points34kt} color="yellow" weight={2}>
          <Popup className="font-bold">
            <h1 className="text-md">{'Wind: ≥34 kt'}</h1>
          </Popup>
        </Polygon>
      </div>
    )
  });

  const windField50kt = storm.data.map((point, i) => {
    const {lat, lng} = point;
    const points50kt = [];  
    calculatePoints(lat, lng, points50kt, point["50kt_wind_nm"]);
    return (
      <div key={i}>
        <Polygon positions={points50kt} color="orange" weight={2}>
          <Popup className="font-bold">
            <h1 className="text-md">{'Wind: ≥50 kt'}</h1>
          </Popup>
        </Polygon>
      </div>
    )
  });

  const windField64kt = storm.data.map((point, i) => {
    const {lat, lng} = point;
    const points64kt = [];  
    calculatePoints(lat, lng, points64kt, point["64kt_wind_nm"]);
    return (
      <div key={i}>
        <Polygon positions={points64kt} color="red" weight={2}>
          <Popup className="font-bold">
            <h1 className="text-md">{'Wind: ≥64 kt'}</h1>
          </Popup>
        </Polygon>
      </div>
    )
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