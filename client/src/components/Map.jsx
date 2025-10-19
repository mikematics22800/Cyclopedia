import { useContext, useState } from "react";
import { Context } from "../App";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ArchivedStorms from "./ArchivedStorms";
import LiveStorms from "./LiveStorms";
import WindField from "./WindField";
import Legend from "./Legend";
import ClimateLayers from "./ClimateLayers";
import AreasOfInterest from "./AreasOfInterest";
import PointsOfInterest from "./PointsOfInterest";
import MapController from "./MapController";

const Map = () => {
  const { tracker, windField, year } = useContext(Context);
  const id = import.meta.env.VITE_OWM_KEY;

  const [weatherLayers, setWeatherLayers] = useState({
    clouds: true,
    precipitation: true,
    wind: true,
    pressure: false,
    temp: false
  });

  const handleLayerChange = (layers) => {
    setWeatherLayers(layers);
  };

  return (
    <div className="map">
      {/* Legend and Weather Controls */}
      <div className="absolute top-4 right-4 z-[9999] flex flex-row gap-4 items-start">
        {tracker && <ClimateLayers onLayerChange={handleLayerChange} />}
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
        {tracker && weatherLayers.clouds && <TileLayer url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${id}`} />}
        {tracker && weatherLayers.precipitation && <TileLayer url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${id}`}/>}
        {tracker && weatherLayers.temp && <TileLayer url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${id}`}/>}
        {tracker && weatherLayers.wind && <TileLayer url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${id}`}/>}      
        {tracker && weatherLayers.pressure && <TileLayer url={`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${id}`}/>}
        
        {/* Storm Layers */}
        {tracker ? <LiveStorms /> : <ArchivedStorms />}
        {year >= 2004 && windField && !tracker && <WindField/>}
        {tracker && <AreasOfInterest />}
        {tracker && <PointsOfInterest />}
        <MapController />
      </MapContainer>
    </div>
  )
}

export default Map