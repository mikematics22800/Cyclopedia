import { useState, useEffect, useContext } from "react";
import { Context } from "../App";
import { MenuItem, Select, Button } from "@mui/material"
import cyclone from "../../public/cyclone.png"
import Storm from "./Storm";
import Season from "./Season";


const Interface = () => {
  const {year, setYear, season, stormId, setStormId} = useContext(Context)

  const [seasonStats, setSeasonStats] = useState(false)
  const [stormIds, setStormIds] = useState(null)

  useEffect(() => {
    const stormIds = season.map((storm) => {
      return storm.id    
    })
    setStormIds(stormIds) 
  }, [season])

  const years = new Array(2022 - 1850).fill(0)

  const toggleStats = () => {
    if (seasonStats === false) {
      setSeasonStats(true)
    } else {
      setSeasonStats(false)
    }
  }

  return (
    <div id="interface">
      <div id="hero">
        <div className="flex items-center">
          <img src={cyclone} className="h-10 mr-2"/>
          <h1 className="text-4xl italic hidden sm:block">Cyclopedia</h1>
        </div>
        <h1>Older data may be incomplete</h1>
      </div>
      <div id="content">
        <div className="flex gap-5">
          <Select className="select" value={year} onChange={(e) => {setYear(e.target.value)}}>
            {years.map((_, index) => {
              const selectedYear = 2022 - index;
              return (<MenuItem key={index} value={selectedYear}>{selectedYear}</MenuItem>);
            })}
          </Select>
          <Select className="select" value={stormId} onChange={(e) => {setStormId(e.target.value)}}>
            {stormIds?.map((id) => {
              const name = id.split('_')[1]
              return (<MenuItem key={id} value={id}>{name}</MenuItem>);
            })}
          </Select>
        </div>
        <Button onClick={toggleStats} className="h-10" variant="contained">
          <h1 className="font-sans font-bold">{seasonStats == true ? ("Storm") : ("Season")}</h1>
        </Button>
      </div>
      {seasonStats === false ? <Storm/> : <Season/>}
    </div>
  )
}

export default Interface