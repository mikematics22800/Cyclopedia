import { useState, useEffect, createContext } from "react"
import { getHurdat } from "./libs/hurdat"
import Interface from "./components/Interface"
import Map from "./components/Map"
import trees from "../public/trees.jpg"
import cyclone from "../public/cyclone.png"
import { sum } from "./libs/sum"
import Intensity from "./components/Intensity"
import ACE from "./components/ACE"
import MaxWinds from "./components/MaxWinds"
import MinPressures from "./components/MinPressures"
import SeasonACE from "./components/SeasonACE"

export const Context = createContext()

function App() {
  const [basin, setBasin] = useState('atl')
  const [year, setYear] = useState(2023)
  const [season, setSeason] = useState(null)
  const [storm, setStorm] = useState(null)
  const [stormId, setStormId] = useState('')
  const [dates, setDates] = useState([])
  const [landfallingStorms, setLandfallingStorms] = useState([])
  const [windField, setWindField] = useState(false)
  const [names, setNames] = useState([])
  const [seasonACE, setSeasonACE] = useState([])
  const [seasonStats, setSeasonStats] = useState(false)
  const [map, setMap] = useState(true)

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
      setStormId(JSON.parse(cache)[0].id)
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
    }
    const names = season?.map((storm) => {
      return storm.id.split('_')[1]
    })
    setNames(names)

    const seasonACE = season?.map((storm) => {
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
    seasonACE,
    seasonStats
  }

  const toggleStats = () => {
    if (seasonStats === false) {
      setSeasonStats(true)
    } else {
      setSeasonStats(false)
    }
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
      <div className="w-screen h-screen bg-cover bg-center" style={{backgroundImage: `url(${trees})`}}>
        {season && storm ? (
          <div className="w-full h-full flex flex-col"> 
            <header>
              <div className="flex items-center">
                <img src={cyclone} className="h-10 mr-2"/>
                <h1 className="storm-font text-4xl text-white font-bold">CYCLOPEDIA</h1>
              </div>
              <div className="flex gap-8">
                <button onClick={toggleStats} className="button" variant="contained">
                  <h1>{seasonStats ? (storm.id.split('_')[1]) : ("Season")}</h1>
                </button>
                <button onClick={toggleMap} className="button" variant="contained">
                  <h1>{map ? ("Charts") : ("Map")}</h1>
                </button>
              </div>
            </header>
            <div className="h-[calc(100vh-6rem)] w-full flex overflow-hidden flex-row">
              <Interface/>
              {map ? <Map/> : 
                <div className="charts-container">
                  {seasonStats ? (
                     <div className="charts">
                      <Intensity/>
                      <ACE/>
                    </div>
                  ) : ( 
                    <div className="charts">
                      <MaxWinds/>
                      <MinPressures/>
                      <SeasonACE/>
                    </div>
                  )}
                </div>
              }
            </div>
          </div>
        ) : (
          <div className="w-screen h-screen flex flex-col items-center justify-center text-white gap-20">
            <img className="w-60 h-60 animate-spin" src={cyclone}/>
            <h1 className="text-4xl font-bold storm-font">LOADING...</h1>
          </div>
        )}
      </div>
    </Context.Provider>
  )
}

export default App
