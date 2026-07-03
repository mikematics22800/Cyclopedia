'use client';

import { useAppContext } from "../contexts/AppContext";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Tracks from "./Tracks";
import TrackPolylines from "./TrackPolylines";
import MapStormFocus from "./MapStormFocus";
import WindField from "./WindField";

const Map = () => {
  const { year, windField } = useAppContext();

  return (
    <div className="map relative">
      <MapContainer 
        className='h-full w-full'
        center={[30, -60]} 
        minZoom={3} 
        zoom={4}
        worldCopyJump
      >
        <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'/>
        <TrackPolylines />
        <MapStormFocus />
        <Tracks />
        {year >= 2002 && windField && <WindField />}
      </MapContainer>
    </div>
  );
};

export default Map;
