import { useState, useEffect, useContext } from "react";
import { Context } from "../App";
import { MenuItem, Select, Button, Checkbox } from "@mui/material"
import cyclone from "../../public/cyclone.png"
import Storm from "./Storm";
import Season from "./Season";

const Interface = () => {
  const {
    basin, 
    setBasin, 
    year, 
    setYear, 
    season, 
    stormId, 
    setStormId, 
    setWindField
  } = useContext(Context)

  const [seasonStats, setSeasonStats] = useState(false)
  const [stormIds, setStormIds] = useState(null)

  useEffect(() => {
    const stormIds = season.map((storm) => {
      return storm.id    
    })
    setStormIds(stormIds) 
  }, [season])

  const startYear = basin === 'atl' ? 1850 : 1948
  const years = new Array(2023 - startYear).fill(0)

  const toggleStats = () => {
    if (seasonStats === false) {
      setSeasonStats(true)
    } else {
      setSeasonStats(false)
    }
  }

  return (
    <div id="interface">
      <div className="flex items-center">
        <img src={cyclone} className="h-10 mr-2"/>
        <h1 className="title">CYCLOPEDIA</h1>
      </div>
      <div id="content">
        <div className="flex gap-4 flex-col sm:flex-row">
          <Select className="select" value={basin} onChange={(e) => {setBasin(e.target.value)}}>
            <MenuItem value="atl">Atlantic</MenuItem>
            <MenuItem value="pac">Pacific</MenuItem>
          </Select>
          <Select className="select" value={year} onChange={(e) => {setYear(e.target.value)}}>
            {years.map((_, index) => {
              const selectedYear = 2023 - index;
              return (<MenuItem key={index} value={selectedYear}>{selectedYear}</MenuItem>);
            })}
          </Select>
          <Select className="select" value={stormId} onChange={(e) => {setStormId(e.target.value)}}>
            {stormIds?.map((id) => {
              const name = id.split('_')[1]
              return (<MenuItem key={id} value={id}>{name}</MenuItem>);
            })}
          </Select>
          {year >= 2004 && <div className="flex items-center gap-1">
            <Checkbox className="!text-white !p-0" onChange={(e) => {setWindField(e.target.checked)}}/>
            <h1 className="text-white font-bold">Wind Field</h1>
          </div>}
        </div>
        <Button onClick={toggleStats} className={`button ${seasonStats && '!bg-purple-800'}`} variant="contained">
          <h1 className="font-sans font-bold">{seasonStats ? ("Storm") : ("Season")}</h1>
        </Button>
      </div>
      {seasonStats === false ? <Storm/> : <Season/>}
    </div>
  )
}

export default Interface