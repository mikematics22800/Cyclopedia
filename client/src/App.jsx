import { useState, useEffect, createContext } from "react"
import { getHurdat } from "./libs/hurdat"
import Interface from "./components/Interface"
import Map from "./components/Map"
import hurricaneWallpaper from "../public/hurricane.jpg"
import cyclone from "../public/cyclone.png"
import { sum } from "./libs/sum"
import ArchiveCharts from "./components/ArchiveCharts"
import { getLiveHurdat, getForecastCone, getWindFieldForecast, getAreasOfInterest, getPointsOfInterest } from "./libs/hurdat"

export const Context = createContext()

function App() {
  const [basin, setBasin] = useState('atl')
  const [year, setYear] = useState(2024)
  const [season, setSeason] = useState(null)
  const [storm, setStorm] = useState(null)
  const [stormId, setStormId] = useState('')
  const [dates, setDates] = useState([])
  const [landfallingStorms, setLandfallingStorms] = useState([])
  const [windField, setWindField] = useState(false)
  const [names, setNames] = useState([])
  const [ACE, setACE] = useState(0)
  const [ACEArray, setACEArray] = useState([])
  const [seasonACE, setSeasonACE] = useState([])
  const [TIKE, setTIKE] = useState(0)
  const [TIKEArray, setTIKEArray] = useState([])
  const [map, setMap] = useState(true)
  const [maxWinds, setMaxWinds] = useState([])
  const [liveHurdat, setLiveHurdat] = useState([])
  const [forecastCone, setForecastCone] = useState([])
  const [tracker, setTracker] = useState(false)
  const [windFieldForecast, setWindFieldForecast] = useState([])
  const [areasOfInterest, setAreasOfInterest] = useState([])
  const [selectedLiveStorm, setSelectedLiveStorm] = useState(null)
  const [pointsOfInterest, setPointsOfInterest] = useState([])
  const [clickedPoint, setClickedPoint] = useState(null)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
    getLiveHurdat().then(data => {
      setLiveHurdat(data)
    })
    getForecastCone().then(data => {
      setForecastCone(data)
    })  
    getWindFieldForecast().then(data => {
      setWindFieldForecast(data)
    })
    getAreasOfInterest().then(data => {
      setAreasOfInterest(data)
    })
    getPointsOfInterest().then(data => {
      setPointsOfInterest(data)
    })
    }, [])

  useEffect(() => {
    if (year < 1949 && basin === 'pac') setYear(1949)
    const cache = localStorage.getItem(`cyclopedia-${basin}-${year}`)
    if (cache) {
      setSeason(JSON.parse(cache))
      const data = JSON.parse(cache)
      setStormId(data[0].id)
    } else {
      setSeason(null)
      setStorm(null)
      getHurdat(basin, year).then(data => {
        setSeason(data)
        setStormId(data[0].id)
        localStorage.setItem(`cyclopedia-${basin}-${year}`, JSON.stringify(data))
      })
    }
  }, [basin, year])

  useEffect(() => {
    if (season) {
      const storm = season.find(storm => storm.id === stormId)
      setStorm(storm)
    }
  }, [stormId]);

  useEffect(() => {
    if (storm) {
      const dates = storm.data.map((point) => {
        const dateArray = point?.date.toString().split("")
        const month = dateArray.slice(4,6).join("")
        const day = dateArray.slice(-2).join("")
        return `${month}/${day}`
      })
      setDates(dates)

      const data = storm.data
      let ACEPoint = 0
      let windArray = []
      const ACEArray = data.map((point) => {
        const wind = point.max_wind_kt
        const hour = parseInt(point.time_utc)
        if (["TS", "SS", "HU"].includes(point.status)) {
          if (hour % 600 == 0) {
            ACEPoint += Math.pow(wind, 2)/10000
            if (windArray.length > 0) {
              const average = sum(windArray)/windArray.length
              ACEPoint += Math.pow(average, 2)/10000
              windArray = []
            }
          } else {
            windArray.push(wind)
          }
        }
        return ACEPoint
      })
      setACEArray(ACEArray)
      const ACE = Math.max(...ACEArray)
      setACE(ACE)

      // Calculate TIKE if year >= 2004 and wind radii data is available
      if (year >= 2004) {
        let tikeArray = []
        let cumulativeTIKE = 0
        
        data.forEach((point) => {
          if (point['34kt_wind_nm'] && point['50kt_wind_nm'] && point['64kt_wind_nm']) {
            const wind34 = point['34kt_wind_nm']
            const wind50 = point['50kt_wind_nm']
            const wind64 = point['64kt_wind_nm']
            
            // Calculate area of wind field for each wind speed threshold
            const area34 = Math.PI * Math.pow((wind34.ne + wind34.se + wind34.sw + wind34.nw) / 4 * 1852, 2)
            const area50 = Math.PI * Math.pow((wind50.ne + wind50.se + wind50.sw + wind50.nw) / 4 * 1852, 2)
            const area64 = Math.PI * Math.pow((wind64.ne + wind64.se + wind64.sw + wind64.nw) / 4 * 1852, 2)
            
            // Calculate kinetic energy for each wind speed threshold
            const rho = 1.15
            const v34 = 34 * 0.514444
            const v50 = 50 * 0.514444
            const v64 = 64 * 0.514444
            
            const ke34 = 0.5 * rho * Math.pow(v34, 2) * area34
            const ke50 = 0.5 * rho * Math.pow(v50, 2) * area50
            const ke64 = 0.5 * rho * Math.pow(v64, 2) * area64
            
            const totalKE = ke34 + ke50 + ke64
            const totalKETJ = totalKE / 1e12
            
            cumulativeTIKE += totalKETJ
            tikeArray.push(cumulativeTIKE)
          } else {
            tikeArray.push(cumulativeTIKE)
          }
        })
        
        setTIKEArray(tikeArray)
        const finalTIKE = Math.max(...tikeArray)
        setTIKE(finalTIKE)
      } else {
        setTIKEArray([])
        setTIKE(0)
      }
      }
  }, [storm])

  useEffect(() => {
    const landfallingStorms = []
    if (season) {
      season.forEach((storm) => {
        let landfall = false
        storm.data.forEach((point) => {
          if (point.record === "L") {
            landfall = true
          }
        })
        if (landfall == true) {
          landfallingStorms.push(storm)
        }
      })
      setLandfallingStorms(landfallingStorms)
      const names = season.map((storm) => {
        return storm.id.split('_')[1]
      })
      setNames(names)
  
      const maxWinds = season.map((storm) => {
        const winds = storm.data.map((point) => {
          return point.max_wind_kt
        })
        return Math.max(...winds)
      })
      setMaxWinds(maxWinds)
  
      const seasonACE = season.map((storm) => {
        let ACE = 0
        let windArray = []
        storm.data.forEach((point) => {
          const wind = point.max_wind_kt
          const hour = point.time_utc
          if (["TS", "SS", "HU"].includes(point.status)) {
            if (hour % 600 == 0) {
              ACE += Math.pow(wind, 2)/10000
              if (windArray.length > 0) {
                const average = sum(windArray)/windArray.length
                ACE += Math.pow(average, 2)/10000
                windArray = []
              }
            } else {
              windArray.push(wind)
            }
          }
        })
        return ACE
      })
      setSeasonACE(seasonACE)

      // Calculate season TIKE if year >= 2004
      if (year >= 2004) {
        const seasonTIKE = season.map((storm) => {
          let cumulativeTIKE = 0
          storm.data.forEach((point) => {
            if (point['34kt_wind_nm'] && point['50kt_wind_nm'] && point['64kt_wind_nm']) {
              const wind34 = point['34kt_wind_nm']
              const wind50 = point['50kt_wind_nm']
              const wind64 = point['64kt_wind_nm']
              
              const area34 = Math.PI * Math.pow((wind34.ne + wind34.se + wind34.sw + wind34.nw) / 4 * 1852, 2)
              const area50 = Math.PI * Math.pow((wind50.ne + wind50.se + wind50.sw + wind50.nw) / 4 * 1852, 2)
              const area64 = Math.PI * Math.pow((wind64.ne + wind64.se + wind64.sw + wind64.nw) / 4 * 1852, 2)
              
              const rho = 1.15
              const v34 = 34 * 0.514444
              const v50 = 50 * 0.514444
              const v64 = 64 * 0.514444
              
              const ke34 = 0.5 * rho * Math.pow(v34, 2) * area34
              const ke50 = 0.5 * rho * Math.pow(v50, 2) * area50
              const ke64 = 0.5 * rho * Math.pow(v64, 2) * area64
              
              const totalKE = ke34 + ke50 + ke64
              const totalKETJ = totalKE / 1e12
              
              cumulativeTIKE += totalKETJ
            }
          })
          return cumulativeTIKE
        })
        // Note: seasonTIKE could be added to context if needed elsewhere
      }
    }
  }, [season]);

  const toggleCharts = () => {
    if (map === false) {
      setMap(true)
    } else {
      setMap(false)
    }
  }

  const toggleTracker = () => {
    if (tracker === false) {
      setTracker(true)
    } else {
      setTracker(false)
    }
  }

  const selectLiveStorm = (stormId) => {
    setSelectedLiveStorm(stormId)
  }

  const selectArchivedStormPoint = (stormId, lat, lng) => {
    setStormId(stormId)
    setClickedPoint({ lat, lng })
  }

  const selectLiveStormPoint = (stormId, lat, lng) => {
    setSelectedLiveStorm(stormId)
    setClickedPoint({ lat, lng })
  }

  const value = {
    basin,
    setBasin, 
    year, 
    setYear, 
    season, 
    setSeason, 
    storm, 
    setStorm, 
    stormId, 
    setStormId, 
    dates, 
    landfallingStorms, 
    windField, 
    setWindField,
    names,
    ACE,
    ACEArray,
    TIKE,
    TIKEArray,
    maxWinds,
    seasonACE,
    liveHurdat,
    forecastCone,
    toggleTracker,
    tracker,
    windFieldForecast,
    toggleCharts,
    map,
    areasOfInterest,
    setAreasOfInterest,
    selectedLiveStorm,
    selectLiveStorm,
    pointsOfInterest,
    clickedPoint,
    selectArchivedStormPoint,
    selectLiveStormPoint
  }

  return (
    <Context.Provider value={value}>
      <div className="app" style={{backgroundImage: `url(${hurricaneWallpaper})`}}>
        {season && storm ? (
          <>
            <nav>
              <div className="flex items-center">
                <img src={cyclone} className="h-10 mr-2"/>
                <h1 className="storm-font text-4xl text-white italic hidden sm:block">CYCLOPEDIA</h1>
              </div>
              <div className="flex items-center gap-5">
                {!tracker && (
                  <button className="button sm:!flex !hidden" onClick={toggleCharts} variant="contained">
                    <h1>{map ? ("Charts") : ("Map")}</h1>
                  </button>
                )}
                <button onClick={toggleTracker} className="button" variant="contained">
                  <h1>{tracker ? "Historical Archive" : "Live Tracker"}</h1>
                </button>
              </div>
            </nav>
            <div className="desktop-view">
              <Interface/>
              {map ? <Map/> : tracker ? <Map/> : <ArchiveCharts/>}
            </div>
            <div className="mobile-map">
              <Map/>
            </div>  
            <div className="mobile-interface">
              <Interface/>
            </div>
          </>
        ) : (
          <div className="loading-screen">
            <img src={cyclone}/>
          </div>
        )}
      </div>
    </Context.Provider>
  )
}

export default App
