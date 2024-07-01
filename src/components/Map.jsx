import { useContext } from "react";
import { Context } from "../App";
import { MapContainer, Polyline, TileLayer, Popup, Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  const {season, setStormId} = useContext(Context)

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
        iconSize: [40, 40]
      })
    )
  }

  const storms = season.map((storm, i) => {
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
      
      const lat = point.lat
      const lng = point.lng
      const coords = [lat, lng]
      positions.push(coords)
      
      const wind = point.max_wind_kt
      let status
      let color
      if (point.status === 'LO') {
        status = "Tropical Low"
        color = "lightgray"
      }
      if (point.status === 'DB') {
        status = "Tropical Disturbance"
        color = "lightgray"
      }
      if (point.status === 'WV') {
        status = "Tropical Wave"
        color = "lightgray"
      }
      if (point.status === 'EX') {
        status = "Extratropical Cyclone"
        color = "lightgray"
      }
      if (point.status === 'SD') {
        status = "Subtropical Depression"
        color = "aqua"
      }
      if (point.status === 'SS') {
        status = "Subtropical Storm"
        color = "lightgreen"
      }
      if (point.status === 'TD') {
        status = "Tropical Depression"
        color = "blue"
      }
      if (point.status === 'TS') {
        status = "Tropical Storm"
        color = "lime"
      }
      if (point.status === 'HU') {
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

      return (
        <Marker key={i} position={coords} icon={icon} eventHandlers={{click:() => {setStormId(id)}}}>
          <Popup className="w-64 font-bold">
            <h1 className="text-md">{!name.includes('Unnamed') && !name.includes('Unnumbered') ? (`${status} ${name}`) : (`${name} ${status}`)}</h1>
            <h1 className="my-1">{date} at {time} UTC</h1>
            <h1>Maximum Wind: {wind} kt</h1>
            <h1>Minimum Pressure: {pressure != -999 ? (`${pressure} mb`) : 'Unknown'}</h1>
          </Popup>
        </Marker>
      )
    })
    return (
      <div key={i}>
        <Polyline positions={positions} color="gray" opacity={.25}/>
        {points}
      </div>
    )
  })  
  
  return (
    <MapContainer className="w-[calc(100%-48rem)] h-full" maxBounds={[[90, 180], [-90, -180]]} center={[30, -60]} maxZoom={15} minZoom={4} zoom={4}>
      <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'/>  
      {storms}
    </MapContainer>
  )
}

export default Map
