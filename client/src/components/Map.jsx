import { useContext } from "react";
import { Context } from "../App";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ArchivedStorms from "./ArchivedStorms";
import LiveStorms from "./LiveStorms";
import WindField from "./WindField";
import Legend from "./Legend";
import AreasOfInterest from "./AreasOfInterest";

const Map = () => {
  const { tracker, windField, year } = useContext(Context);

  return (
    <div className="map">
      <Legend />
      <MapContainer 
        className='h-full w-full'
        maxBounds={[[90, 150], [-90, -270]]} 
        center={[30, -60]} 
        maxZoom={15} 
        minZoom={3} 
        zoom={4}
      >
        <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'/>  
        {tracker ? <LiveStorms /> : <ArchivedStorms />}
        {year >= 2004 && windField && !tracker && <WindField/>}
        {tracker && <AreasOfInterest />}
      </MapContainer>
    </div>
  )
}

export default Map