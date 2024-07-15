import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import Intensity from './Intensity'
import DaysAtStrength from './DaysAtStrength'
import ACE from './ACE'
import Size from './Size'
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
  const [maxWindLand, setmaxWindLand] = useState('')
  const [minPressureLand, setminPressureLand] = useState('')
  const [costUSD, setCostUSD] = useState('')
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
      return point.min_pressure_mb
    })
    const minPressure = Math.min(...pressures)
    setMinPressure(minPressure)

    const landfalls = data.filter(point => point.record === "L")
    setLandfalls(landfalls)

    const windsLandfall = landfalls.map((point) => {
      return point.max_wind_kt
    })
    setmaxWindLand(Math.max(...windsLandfall))

    const pressuresLandfall = landfalls.map((point) => {
      return point.min_pressure_mb
    })
    setminPressureLand(Math.min(...pressuresLandfall))

    setImage(storm.image)

    const costUSD = (storm.cost_usd/1000000000).toFixed(3)
    setCostUSD(costUSD)

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
            textColor = "blue"
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
        <a style={{backgroundImage: `url(${image})`}} href={year > 1993 ? (`https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf`) : ('#')}>
          {retired == true && <img className='animate__bounceIn sm:w-80 w-40' src={retiredImage}/>}
          {image == "" && <h1>Image Unavailable</h1>}
        </a>
        <div id="stats">
          <h1 style={{color:textColor}}>{!stormName != 'Unnamed' ? (`${status} ${stormName}`) : (`${stormName} ${status}`)}</h1>
          <h2>{duration}</h2>
          {year > 1982 && <h2>Landfalls: {landfalls.length}</h2>}
          <h2>Maximum Wind: {maxWind} kt</h2>
          {landfalls.length > 0 && <h2>Max Wind on Land: {maxWindLand} kt</h2>}
          <h2>Mininum Pressure: {minPressure != 1050 ? (`${minPressure} mb`) : 'Unknown'}</h2>
          {landfalls.length > 0 && <h2>Min Pressure on Land: {minPressureLand} mb</h2>}
          <h2>Fatalities: {fatalities}</h2>
          <h2>Cost (Billion USD): ${costUSD}</h2>
        </div>
      </header>
      <div className="charts">
        <Intensity/>
        <ACE/>
        <DaysAtStrength/>
        {year >= 2004 && <Size/>}
      </div>
    </div>
  )
}

export default Storm