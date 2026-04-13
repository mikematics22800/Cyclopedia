'use client';

import { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ArchiveStorms from "./ArchiveStorms";
import LiveStorms from "./LiveStorms";
import WindField from "./WindField";
import Legend from "./Legend";
import ClimateLayers from "./LiveLayers";
import ArchiveMapSettings from "./ArchiveLayers";
import Invests from "./Invests";

interface Layers {
  clouds: boolean;
  precip: boolean;
  wind: boolean;
  pressure: boolean;
  temp: boolean;
}

const Map = () => {
  const { tracker, year, windField } = useAppContext();
  const id = process.env.NEXT_PUBLIC_OWM_KEY;

  const [layers, setLayers] = useState<Layers>({
    clouds: true,
    precip: true,
    wind: true,
    pressure: false,
    temp: false
  });

  return (
    <div className="map relative">
      {/* Legend and Weather Controls */}
      <div className="map-controls-container">
        {tracker && <ClimateLayers layers={layers} setLayers={setLayers}/>}
        {!tracker && <ArchiveMapSettings />}
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
        
        {/* Weather Layers - Only in live/tracker mode */}
        {tracker && layers.clouds && <TileLayer url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${id}`} />}
        {tracker && layers.precip && <TileLayer url={`https://tile.openweathermap.org/map/precip_new/{z}/{x}/{y}.png?appid=${id}`}/>}
        {tracker && layers.temp && <TileLayer url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${id}`}/>}
        {tracker && layers.wind && <TileLayer url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${id}`}/>}      
        {tracker && layers.pressure && <TileLayer url={`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${id}`}/>}
        
        {/* Storm Layers */}
        {tracker ? <LiveStorms /> : <ArchiveStorms />}
        {year >= 2004 && windField && !tracker && <WindField/>}
        {tracker && <Invests />}
      </MapContainer>
    </div>
  );
};

export default Map;
