import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import Intensity from './Intensity'
import ACE from './ACE'
import retiredImage from "../../public/retired.png"

const Storm = () => {
  const {year, storm, stormId} = useContext(Context)

  const [stormName, setStormName] = useState('')
  const [status, setStatus] = useState('')
  const [textColor, setTextColor] = useState('')
  const [retired, setRetired] = useState(false)
  const [duration, setDuration] = useState('')
  const [image, setImage] = useState('')
  const [maxWind, setMaxWind] = useState('')
  const [minPressure, setMinPressure] = useState('')
  const [landfalls, setLandfalls] = useState([])
  const [inlandMaxWind, setInlandMaxWind] = useState('')
  const [inlandMinPressure, setInlandMinPressure] = useState('')
  const [cost, setCost] = useState('')
  const [fatalities, setFatalities] = useState('')

  useEffect(() => {
    setStormName(storm.id.split('_')[1])

    setImage(storm.image)

    setRetired(storm.retired)

    const data = storm.data

    const startArray = data[0].date.toString().split('')
    const startYear = startArray.slice(0,4).join('')
    const startMonth = startArray.slice(4,6).join('')
    const startDay = startArray.slice(-2).join('')
    const startDate = `${startMonth}/${startDay}/${startYear}`
    const endArray = data.pop().date.toString().split('')
    const endYear = endArray.slice(0,4).join('')
    const endMonth = endArray.slice(4,6).join('')
    const endDay = endArray.slice(-2).join('')
    const endDate = `${endMonth}/${endDay}/${endYear}`
    const duration = `${startDate}-${endDate}`
    setDuration(duration)

    const winds = data.map((point) => {
      return point.max_wind_kt
    })
    const maxWind = Math.max(...winds)
    setMaxWind(maxWind)

    const pressures = data.map((point) => {
      if (point.min_pressure_mb) {
        return point.min_pressure_mb
      } else {
        return 9999
      }
    })

    const minPressure = Math.min(...pressures)
    setMinPressure(minPressure)

    const landfalls = data.filter(point => point.record === "L")
    setLandfalls(landfalls)

    const inlandWinds = landfalls.map((point) => {
      return point.max_wind_kt
    })
    setInlandMaxWind(Math.max(...inlandWinds))

    const inlandPressures = landfalls.map((point) => {
      if (point.min_pressure_mb) {
        return point.min_pressure_mb
      } else {
        return 9999
      }
    })
    setInlandMinPressure(Math.min(...inlandPressures))

    setImage(storm.image)

    const cost = (storm.cost_usd/1000000).toFixed(1)
    setCost(cost)

    const fatalities = storm.fatalities
    setFatalities(fatalities)

    let status
    let textColor
    const statuses = data.map((point) => {
      return point.status
    })
    if (statuses.includes("HU")) {
      status = "Hurricane"
      if (maxWind <= 82) {
        textColor = "yellow"
      }
      if (maxWind > 82 && maxWind <= 95) {
        textColor = "orange"
      }
      if (maxWind > 95 && maxWind <= 110) {
        textColor = "red"
      }
      if (maxWind > 110 && maxWind <= 135) {
        textColor = "hotpink"
      }
      if (maxWind > 135) {
        textColor = "pink"
      }
    } else {
      if (statuses.includes("TS")) {
        status = "Tropical Storm"
        textColor = "lime"
      } else {
        if (statuses.includes("SS")) {
          status = "Subtropical Storm"
          textColor = "lightgreen"
        } else {
          if (statuses.includes("TD")) {
            status = "Tropical Depression"
            textColor = "#0096FF"
          } else {
            status = "Subtropical Depression"
            textColor = "aqua"
          }
        }
      }
    }
    setStatus(status)
    setTextColor(textColor)
  }, [storm]);

  return (
    <div id="storm">
      <header>
        <a className={retired && '!justify-end pb-2 sm:pb-4'} style={{backgroundImage: `url(${image})`}} href={year > 1993 ? (`https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf`) : ('#')}>
          {image == "" && <h1>Image Unavailable</h1>}
          {retired && <img className='w-64' src={retiredImage}/>}
        </a>
        <div id="stats">
          <h1 style={{color:textColor}}>{stormName !== 'Unnamed' ? (`${status} ${stormName}`) : (`${stormName} ${status}`)}</h1>
          <h2>{duration}</h2>
          {year > 1982 && <h2>Landfalls: {landfalls.length}</h2>}
          <h2>Maximum Wind: {maxWind} kt</h2>
          {landfalls.length > 0 && <h2>Maximum Inland Wind: {inlandMaxWind} kt</h2>}
          <h2>Mininum Pressure: {minPressure ? (`${minPressure} mb`) : 'Unknown'}</h2>
          {landfalls.length > 0 && <h2>Minimum Inland Pressure: {inlandMinPressure ? (`${inlandMinPressure} mb`) : 'Unknown'}</h2>}
          <h2>Fatalities: {fatalities}</h2>
          <h2>Cost (Million USD): ${cost}</h2>
        </div>
      </header>
      <div className="charts">
        <Intensity/>
        <ACE/>
      </div>
    </div>
  )
}

export default Storm