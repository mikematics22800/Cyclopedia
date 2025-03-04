import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import Intensity from './Intensity'
import ACE from './ACE'
import retiredImage from "../../public/retired.png"
import CycloneIcon from '@mui/icons-material/Cyclone'

const Storm = () => {
  const { year, storm, stormId } = useContext(Context)

  const [stormName, setStormName] = useState('')
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
  const [deadOrMissing, setDeadOrMissing] = useState('')
  const [loading, setLoading] = useState(false)

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
    const endArray = data[data.length - 1].date.toString().split('')    
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
      if (point.min_pressure_mb > 0) {
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

    const deadOrMissing = storm.dead_or_missing
    setDeadOrMissing(deadOrMissing)

    let textColor
    const statuses = data.map((point) => {
      return point.status
    })
    if (statuses.includes("HU")) {
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
        textColor = "lime"
      } else {
        if (statuses.includes("SS")) {
          textColor = "lightgreen"
        } else {
          if (statuses.includes("TD")) {
            textColor = "#0096FF"
          } else {
            textColor = "aqua"
          }
        }
      }
    }
    setTextColor(textColor)
  }, [storm]);

  return (
    <div className="storm">
      <div className='flex md:flex-row flex-col w-full items-center max-w-[48rem] justify-between gap-10'>
        <div className='flex flex-col gap-2'>
          <a 
            target='_blank' 
            className={`w-80 h-96 bg-cover bg-center flex flex-col items-center justify-center rounded-xl bg-gray-400 ${retired && '!justify-end pb-2 sm:pb-4'} ${year < 1995 && 'pointer-events-none'}`}
            style={{backgroundImage: `url(${image})`}} 
            href={`https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf`}
          >
            {image == "" && <div className='flex flex-col gap-5 items-center'>
              <CycloneIcon className='text-gray-600 !text-8xl'/>
              <h1 className='text-2xl font-bold text-gray-600'>Image Unavailable</h1>
            </div>}
            {retired && <img className='w-60' src={retiredImage}/>}
          </a>
        </div>
        <ul className='flex flex-col font-bold gap-1.5 text-white text-center w-full'>
          <h1 className='text-3xl' style={{color:textColor}}>{stormName}</h1>
          <h2 className='text-xl mb-1'>{duration}</h2>
          <li>
            <h2>Maximum Wind</h2>
            <h2>{maxWind} kt</h2>
          </li>
          {landfalls.length > 0 && <li>
            <h2>Maximum Inland Wind</h2>
            <h2>{inlandMaxWind} kt</h2>
          </li>}
          <li>
            <h2>Minimum Pressure</h2>
            <h2>{minPressure != 9999 && minPressure != -999 ? (`${minPressure} mb`) : 'Unknown'}</h2>
          </li>
          {landfalls.length > 0 && <li>
            <h2>Minimum Inland Pressure</h2>
            <h2>{inlandMinPressure ? (`${inlandMinPressure} mb`) : 'Unknown'}</h2>
          </li>}
          <li>
            <h2>Dead/Missing</h2>
            <h2>{deadOrMissing}</h2>
          </li>
          <li>
            <h2>Cost (Million USD)</h2>
            <h2>{cost}</h2>
          </li>
        </ul>
      </div>
      <div className="charts">
        <Intensity/>
        <ACE/>
      </div>
    </div>
  )
}

export default Storm