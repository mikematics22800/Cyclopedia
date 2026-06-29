'use client';

import { useAppContext } from "../contexts/AppContext";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Tracks from "./Tracks";
import WindField from "./WindField";

const Map = () => {
  const { year, windField } = useAppContext();

  return (
    <div className="map relative">
      <MapContainer 
        className='h-full w-full'
        maxBounds={[[90, 180], [-90, -180]]} 
        center={[30, -60]} 
        minZoom={3} 
        zoom={4}
      >
        <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'/>
        <Tracks />
        {year >= 2004 && windField && <WindField/>}
      </MapContainer>
    </div>
  );
};

export default Map;
