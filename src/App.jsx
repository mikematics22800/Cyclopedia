import { useState, useEffect, createContext } from "react"
import { getHurdat } from "./libs/hurdat"
import Interface from "./components/Interface"
import Map from "./components/Map"
import cyclone from '../public/cyclone.png'
import 'animate.css'

export const Context = createContext()

function App() {
  const [year, setYear] = useState(2022)
  const [season, setSeason] = useState(null)
  const [storm, setStorm] = useState(null)
  const [stormId, setStormId] = useState('')
  const [dates, setDates] = useState([])
  const [landfallingStorms, setLandfallingStorms] = useState([])

  useEffect(() => {
    const cache = localStorage.getItem(`hurdat2-${year}`)
    if (cache) {
      setSeason(JSON.parse(cache))
      setStormId(JSON.parse(cache)[0].id)
    } else {
      getHurdat(year).then(data => {
        setSeason(data)
        setStormId(data[0].id)
        localStorage.setItem(`hurdat2-${year}`, JSON.stringify(data))
      })
    }
  }, [year])

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
  }, [season]);

  const value = {year, setYear, season, setSeason, storm, setStorm, stormId, setStormId, dates, landfallingStorms}

  return (
    <Context.Provider value={value}>
      {season && storm ? (
        <div id="app">
          <Interface/>
          <Map/>
        </div>
      ) : (
        <div id="loading">
          <img src={cyclone} alt="storm-icon"/>
          <h1>Loading...</h1>
        </div>
      )}
    </Context.Provider>
  )
}

export default App
