import { useContext } from "react";
import { Context } from "../App";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ArchivedStorms from "./ArchivedStorms";
import LiveStorms from "./LiveStorms";
import WindField from "./WindField";
import Legend from "./Legend";

const Map = () => {
  const { tracker, windField, year, toggleTracker } = useContext(Context);

  return (
    <div className="map">
      <Legend />
      <button onClick={toggleTracker} className="button absolute top-4 left-1/2 transform -translate-x-1/2 z-[9999]" variant="contained">
        <h1>{tracker ? "Archive" : "Live Tracker"}</h1>
      </button>
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
      </MapContainer>
    </div>
  )
}

export default Map