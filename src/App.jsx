import { useState, useEffect, createContext } from "react"
import { getHurdat } from "./libs/hurdat"
import Interface from "./components/Interface"
import Map from "./components/Map"
import cyclone from '../public/cyclone.png'
import 'animate.css'

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

  useEffect(() => {
    if (year < 1949 && basin === 'pac') setYear(1949)
    const cache = localStorage.getItem(`hurdat2-${basin}-${year}`)
    if (cache) {
      setSeason(JSON.parse(cache))
      setStormId(JSON.parse(cache)[0].id)
    } else {
      setSeason(null)
      setStorm(null)
      getHurdat(basin, year).then(data => {
        setSeason(data)
        setStormId(data[0].id)
        localStorage.setItem(`hurdat2-${basin}-${year}`, JSON.stringify(data))
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
    setWindField
  }

  return (
    <Context.Provider value={value}>
      {season && storm ? (
        <div id="app">
          <Interface/>
          <Map/>
        </div>
      ) : (
        <div id="loading">
          <img src={cyclone}/>
          <h1>Loading...</h1>
        </div>
      )}
    </Context.Provider>
  )
}

export default App
