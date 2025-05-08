import { useState, useEffect, createContext } from "react"
import { getHurdat } from "./libs/hurdat"
import Interface from "./components/Interface"
import Map from "./components/Map"
import stormsWallpaper from "../public/storms.jpg"
import cyclone from "../public/cyclone.png"
import { sum } from "./libs/sum"
import Charts from "./components/Charts"

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
  const [map, setMap] = useState(true)
  const [maxWinds, setMaxWinds] = useState([])

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
    }
  }, [season]);

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
    maxWinds,
    seasonACE
  }

  const toggleMap = () => {
    if (map === false) {
      setMap(true)
    } else {
      setMap(false)
    }
  }

  return (
    <Context.Provider value={value}>
      <div className="app" style={{backgroundImage: `url(${stormsWallpaper})`}}>
        {season && storm ? (
          <div className="w-full h-full flex flex-col"> 
            <nav>
              <div className="flex items-center">
                <img src={cyclone} className="h-10 mr-2"/>
                <h1 className="storm-font text-4xl text-white font-bold italic">CYCLOPEDIA</h1>
              </div>
              <button onClick={toggleMap} className="button" variant="contained">
                <h1>{map ? ("Charts") : ("Map")}</h1>
              </button>
            </nav>
            <div className="desktop-view">
              <Interface/>
              {map ? <Map/> : <Charts/>}
            </div>
            <div className="mobile-map">
              <Map/>
            </div>
            <div className="mobile-interface">
              <Interface/>
            </div>
          </div>
        ) : (
          <div className="loading-screen">
            <img src={cyclone}/>
            <h1>LOADING...</h1>
          </div>
        )}
      </div>
    </Context.Provider>
  )
}

export default App
