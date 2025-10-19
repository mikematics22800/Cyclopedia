import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import retiredImage from "../../public/retired.png"
import CycloneIcon from '@mui/icons-material/Cyclone'
import cyclone from "../../public/cyclone.png"

const StormArchive = () => {
  const { year, storm, stormId, ACE, TIKE} = useContext(Context)

  const [stormName, setStormName] = useState('')
  const [textColor, setTextColor] = useState('')
  const [retired, setRetired] = useState(false)
  const [duration, setDuration] = useState('')
  const [image, setImage] = useState('')
  const [imageLoading, setImageLoading] = useState(true)
  const [maxWind, setMaxWind] = useState('')
  const [minPressure, setMinPressure] = useState('')
  const [landfalls, setLandfalls] = useState([])
  const [inlandMaxWind, setInlandMaxWind] = useState('')
  const [inlandMinPressure, setInlandMinPressure] = useState('')
  const [cost, setCost] = useState('')
  const [deadOrMissing, setDeadOrMissing] = useState('')

  useEffect(() => {
    setStormName(storm.id.split('_')[1])

    setImage(storm.image)
    setImageLoading(true)

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
          textColor = "#D0F0C0"
        } else {
          if (statuses.includes("TD")) {
            textColor = "dodgerblue"
          } else {
            textColor = "aqua"
          }
        }
      }
    }
    setTextColor(textColor)
  }, [storm]);

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
  }

  return (
    <div className='storm'>
      <div className='flex flex-col gap-6 w-full items-center'>
        {/* Storm Image Section */}
        <div className='w-full max-w-96 flex flex-col items-center'>
          <a 
            target='_blank' 
            className={`${retired && '!justify-end pb-2 lg:pb-4 px-8'} ${year < 1995 && 'pointer-events-none'} w-full aspect-square bg-cover bg-center flex flex-col items-center justify-center bg-black bg-opacity-20 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
            style={{backgroundImage: `url(${image})`}} 
            href={`https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf`}
          >
            {/* Hidden img element to track loading */}
            {image !== "" && (
              <img 
                src={image} 
                style={{display: 'none'}}
                onLoad={handleImageLoad}
                onError={handleImageError}
                alt=""
              />
            )}
            
            {/* Loading State */}
            {imageLoading && image !== "" && (
              <div className='flex flex-col gap-4 items-center justify-center min-h-[200px] bg-black bg-opacity-20 rounded-3xl w-full h-full'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
                <h1 className='text-xl font-semibold '>Loading...</h1>
              </div>
            )}
            
            {/* No Image State */}
            {image == "" && (
              <div className='flex flex-col gap-4 items-center bg-black bg-opacity-20 rounded-3xl w-full h-full justify-center'>
                <CycloneIcon className=' !text-8xl'/>
                <h1 className='text-xl font-semibold '>Image Unavailable</h1>
              </div>
            )}
            
            {/* Retired Badge */}
            {retired && <img className='w-full' src={retiredImage}/>}
          </a>
        </div>

        {/* Storm Data Section */}
          <ul className='storm-data bg-gray-800 w-full'>
            {/* Storm Header */}
            <li className='flex flex-col pb-2 border-b border-gray-600'>
              <h1 className='text-lg font-bold' style={{color:textColor}}>
                {stormName}
              </h1>     
              <h1 className='text-sm font-bold'>
                {duration}
              </h1>     
            </li>
            
            {/* Wind Data */}
            <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
              <h2 className='text-sm font-semibold '>Maximum Wind</h2>
              <h2 className='text-lg font-bold '>{maxWind} kt</h2>
            </li>
            
            {landfalls.length > 0 && (
              <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
                <h2 className='text-sm font-semibold '>Maximum Inland Wind</h2>
                <h2 className='text-lg font-bold '>{inlandMaxWind} kt</h2>
              </li>
            )}
            
            {/* Pressure Data */}
            <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
              <h2 className='text-sm font-semibold '>Minimum Pressure</h2>
              <h2 className='text-lg font-bold '>
                {minPressure != 9999 && minPressure != -999 ? `${minPressure} mb` : 'Unknown'}
              </h2>
            </li>
            
            {landfalls.length > 0 && (
              <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
                <h2 className='text-sm font-semibold '>Minimum Inland Pressure</h2>
                <h2 className='text-lg font-bold '>
                  {inlandMinPressure != 9999 && inlandMinPressure != -999 ? `${inlandMinPressure} mb` : 'Unknown'}
                </h2>
              </li>
            )}
            
            {/* Impact Data */}
            <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
              <h2 className='text-sm font-semibold '>Dead/Missing</h2>
              <h2 className='text-lg font-bold '>{deadOrMissing}</h2>
            </li>
            
            {/* Cost Data */}
            <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
              <h2 className='text-sm font-semibold '>Cost (Million USD)</h2>
              <h2 className='text-lg font-bold text-green-400'>${cost}</h2>
            </li>

                     
            {/* Energy Data */}
            <li className='flex justify-between items-center p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
              <h2 className='text-sm font-semibold '>Accumulated Cyclone Energy</h2>
              <h2 className='text-lg font-bold '>{ACE.toFixed(1)}</h2>
            </li>
            
            {year >= 2004 && (
              <li className='flex justify-between items-center p-2 hover:bg-gray-700 transition-colors duration-200'>
                <h2 className='text-sm font-semibold '>Track Integrated Kinetic Energy</h2>
                <h2 className='text-lg font-bold '>{TIKE.toFixed(1)} TJ</h2>
              </li>
            )}
          </ul>
        </div>
    </div>
  )
}

export default StormArchive