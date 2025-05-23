import { useContext } from "react";
import { Context } from "../App";
import { MapContainer, Polyline, TileLayer, Popup, Marker, Polygon } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";


const Map = () => {
  const {season, setStormId, storm, year, windField, charts} = useContext(Context) 

  const dot = (color) => {
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: `<svg fill=${color} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle stroke="black" stroke-width="10" cx="50" cy="50" r="40" /></svg>`,
        iconSize: [10, 10]
      })
    )
  }

  const strike = (color) => {
    return (
      new divIcon({
        className: 'bg-opacity-0',
        html: 
          `<svg fill=${color}
              xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:cc="http://creativecommons.org/ns#"
              xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
              xmlns:svg="http://www.w3.org/2000/svg"
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
              viewBox="-264 -264 528 528">
            <metadata>
              <rdf:RDF>
                <cc:Work rdf:about="">
                  <dc:format>image/svg+xml</dc:format>
                  <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
                </cc:Work>
              </rdf:RDF>
            </metadata>
            <polygon stroke="black" stroke-width="20"
                points="-36.16358,-87.30662 0,-233.85776 36.16358,-87.30662 165.36241,-165.36241 87.30662,-36.16358 233.85776,0 87.30662,36.16358 165.36241,165.36241 36.16358,87.30662 0,233.85776 -36.16358,87.30662 -165.36241,165.36241 -87.30662,36.16358 -233.85776,0 -87.30662,-36.16358 -165.36241,-165.36241 -36.16358,-87.30662 " />
          </svg>`,
        iconSize: [30, 30]
      })
    )
  }

  const storms = season.map((storm) => {
    const id = storm.id
    const name = id.split('_')[1]
    const positions = []
    const points = storm.data.map((point, i) => {
      const dateArray = point.date.toString().split('')
      const year = dateArray.slice(0,4).join('')
      const month = dateArray.slice(4,6).join('')
      const day = dateArray.slice(-2).join('')
      const date = `${month}/${day}/${year}`
      const timeArray = point.time_utc.toString().split('')
      const hour = timeArray.slice(0,2).join('')
      const minute = timeArray.slice(-2).join('')
      const time = `${hour}:${minute}`
      const {lat, lng} = point
      const coords = [lat, lng]
      positions.push(coords)
      
      const wind = point.max_wind_kt
      let status
      let color
      if (point.status === 'LO') {
        status = "Tropical Low"
        color = "white"
      }
      if (point.status === 'DB') {
        status = "Tropical Disturbance"
        color = "lightgray"
      }
      if (point.status === 'WV') {
        status = "Tropical Wave"
        color = "gray"
      }
      if (point.status === 'EX' || point.status === 'ET') {
        status = "Extratropical Cyclone"
        color = "#7F00FF"
      }
      if (point.status === 'SD') {
        status = "Subtropical Depression"
        color = "aqua"
      }
      if (point.status === 'SS') {
        status = "Subtropical Storm"
        color = "#D0F0C0"
      }
      if (point.status === 'TD') {
        status = "Tropical Depression"
        color = "dodgerblue"
      }
      if (point.status === 'TS') {
        status = "Tropical Storm"
        color = "lime"
      }
      if (point.status === 'HU' || point.status === 'TY') {
        if (wind <= 82) {
          status = 'Category 1 Hurricane'
          color = 'yellow'
        }
        if (wind > 82 && wind <= 95) {
          status = 'Category 2 Hurricane'
          color = 'orange'
        }
        if (wind > 95 && wind <= 110) {
          status = 'Category 3 Hurricane'
          color = 'red'
        }
        if (wind > 110 && wind <= 135) {
          status = 'Category 4 Hurricane'
          color = 'hotpink'
        }
        if (wind > 135) {
          status = 'Category 5 Hurricane'
          color = 'pink'
        }
      }

      const pressure = point.min_pressure_mb
      
      let icon
      if (point.record === 'L') {
        icon = strike(color)
      } else {
        icon = dot(color)
      }

      const fullName = name !== 'Unnamed' ? `${status} ${name}` : `${name} ${status}`

      return (
        <Marker key={i} position={coords} icon={icon} eventHandlers={{click:() => {setStormId(id)}}}>
          <Popup className="w-64 font-bold">
            <h1 className="text-md">{fullName}</h1>
            <h1 className="my-1">{date} at {time} UTC</h1>
            <h1>Maximum Wind: {wind} kt</h1>
            <h1>Minimum Pressure: {pressure ? `${pressure} mb` : 'Unknown'}</h1>
          </Popup>
        </Marker>
      )
    })
    return (
      <div key={id}>
        <Polyline positions={positions} color="gray" opacity={.25}/>
        {points}
      </div>
    )
  })  

  const nmToDeg = (nm) => nm / 60;

  const calculatePoints = (lat, lng, points, radii={}) => {
    let {ne, se, sw, nw} = radii;
    if (!ne) {ne = 0}
    if (!se) {se = 0}
    if (!sw) {sw = 0}
    if (!nw) {nw = 0}
    let radius;
    for (let angle = 0; angle < 360; angle += 10) {
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

  let windField34kt;
  let windField50kt;
  let windField64kt;

  if (year >= 2004) {
    windField34kt = storm.data.map((point, i) => {
      const {lat, lng} = point;
      const points34kt = [];  
      calculatePoints(lat, lng, points34kt, point["34kt_wind_nm"]);
      return (
        <div key={i}>
          <Polygon positions={points34kt} color="yellow">
            <Popup className="font-bold">
              <h1 className="text-md">34+ kt</h1>
            </Popup>
          </Polygon>
        </div>
      )
    })
  
    windField50kt = storm.data.map((point, i) => {
      const {lat, lng} = point;
      const points50kt = [];  
      calculatePoints(lat, lng, points50kt, point["50kt_wind_nm"]);
      return (
        <div key={i}>
          <Polygon positions={points50kt} color="orange">
            <Popup className="font-bold">
              <h1 className="text-md">50+ kt</h1>
            </Popup>
          </Polygon>
        </div>
      )
    })
  
    windField64kt = storm.data.map((point, i) => {
      const {lat, lng} = point;
      const points64kt = [];  
      calculatePoints(lat, lng, points64kt, point["64kt_wind_nm"]);
      return (
        <div key={i}>
          <Polygon positions={points64kt} color="red">
            <Popup className="font-bold">
              <h1 className="text-md">64+ kt</h1>
            </Popup>
          </Polygon>
        </div>
      )
    })
  }
  return (
    <div className="map">
      <div className="legend-container">
        <div className="legend">
          <div className="key">
            <span className="bg-[dodgerblue]"/>
            <h1 className="text-sm">TD</h1>
          </div>
          <div className="key">
            <span className="color bg-[lime]"/>
            <h1 className="text-sm">TS</h1>
          </div>
          <div className="key">
            <span className="bg-[yellow]"/>
            <h1 className="text-sm">H1</h1>
          </div>
          <div className="key">
            <span className="bg-[orange]"/>
            <h1 className="text-sm">H2</h1>
          </div>
          <div className="key">
            <span className="bg-[red]"/>
            <h1 className="text-sm">H3</h1>
          </div>
          <div className="key">
            <span className="bg-[hotpink]"/>
            <h1 className="text-sm">H4</h1>
          </div>
          <div className="key">
            <span className="bg-[pink]"/>
            <h1 className="text-sm">H5</h1>
          </div>
          <div className="key">
            <span className="bg-[aqua]"/>
            <h1 className="text-sm">SD</h1>
          </div>
          <div className="key">
            <span className="bg-[#D0F0C0]"/>
            <h1 className="text-sm">SS</h1>
          </div>
          <div className="key">
            <span className="bg-[#7F00FF]"/>
            <h1 className="text-sm">EX</h1>
          </div>
          <div className="key">
            <span className="bg-[gray]"/>
            <h1 className="text-sm">WV</h1>
          </div>
          <div className="key">
            <span className="bg-[lightgray]"/>
            <h1 className="text-sm">DB</h1>
          </div>
          <div className="key">
            <span className="bg-white"/>
            <h1 className="text-sm">LO</h1>
          </div>
        </div>
      </div>
      <MapContainer 
        className='h-full w-full'
        maxBounds={[[90, 150], [-90, -270]]} 
        center={[30, -60]} 
        maxZoom={15} 
        minZoom={3} 
        zoom={4}
      >
        <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'/>  
        {storms}
        {year >= 2004 && windField && <>
          {windField34kt}
          {windField50kt}
          {windField64kt}
        </>}
      </MapContainer>
    </div>
  )
}

export default Map