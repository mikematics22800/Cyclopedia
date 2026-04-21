'use client';

import { useAppContext } from "../contexts/AppContext";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ArchiveStorms from "./Storms";
import WindField from "./WindField";
import Legend from "./Legend";
import ArchiveMapSettings from "./Layers";

const Map = () => {
  const { year, windField } = useAppContext();

  return (
    <div className="map relative">
      <div className="map-controls-container">
        <ArchiveMapSettings />
        <Legend />
      </div>

      <MapContainer 
        className='h-full w-full'
        maxBounds={[[90, 180], [-90, -180]]} 
        center={[30, -60]} 
        maxZoom={15} 
        minZoom={3} 
        zoom={4}
      >
        <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'/>
        <ArchiveStorms />
        {year >= 2004 && windField && <WindField/>}
      </MapContainer>
    </div>
  );
};

export default Map;
