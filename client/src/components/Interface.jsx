import { useState, useEffect, useContext } from "react";
import { Context } from "../App";
import cyclone from "../../public/cyclone.png"
import Storm from "./Storm";
import Season from "./Season";
import { MenuItem, Select, Checkbox } from "@mui/material"
import trees from "../../public/trees.png"

const Interface = () => {
  const [seasonStats, setSeasonStats] = useState(false)

  const { basin, setBasin, year, setYear, stormId, setStormId, setWindField, season } = useContext(Context)

  const toggleStats = () => {
    if (seasonStats === false) {
      setSeasonStats(true)
    } else {
      setSeasonStats(false)
    }
  }

  const startYear = basin === 'atl' ? 1850 : 1948
  const years = new Array(2023 - startYear).fill(0)

  const [stormIds, setStormIds] = useState(null)

  useEffect(() => {
    const stormIds = season.map((storm) => {
      return storm.id    
    })
    setStormIds(stormIds) 
  }, [season])

  return (
    <div className="2xl:w-1/2 2xl:h-full w-screen h-1/2 p-10 overflow-auto flex flex-col gap-10" style={{backgroundImage: `url(${trees})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <header className="flex justify-between w-full">
        <div className="flex items-center">
          <img src={cyclone} className="h-10 mr-2"/>
          <h1 className="storm-font text-4xl text-white font-bold">CYCLOPEDIA</h1>
        </div>
        <button onClick={toggleStats} className={`button ${seasonStats ? 'bg-blue-600' : 'bg-purple-600'}`} variant="contained">
          <h1 className="font-sans font-bold">{seasonStats ? ("Storms") : ("Season")}</h1>
        </button>
      </header>
      <div className="selectors">
        <Select className="select" value={basin} onChange={(e) => {setBasin(e.target.value)}}>
          <MenuItem value="atl"><p className="text-black font-bold">Atlantic</p></MenuItem>
          <MenuItem value="pac"><p className="text-black font-bold">Pacific</p></MenuItem>
        </Select>
        <Select className="select" value={year} onChange={(e) => {setYear(e.target.value)}}>
          {years.map((_, index) => {
            const selectedYear = 2023 - index;
            return (<MenuItem key={index} value={selectedYear}><p className="text-black font-bold">{selectedYear}</p></MenuItem>);
          })}
        </Select>
        <Select className="select" value={stormId} onChange={(e) => {setStormId(e.target.value)}}>
          {stormIds?.map((id) => {
            const name = id.split('_')[1]
            return (<MenuItem key={id} value={id}><p className="text-black font-bold">{name}</p></MenuItem>);
          })}
        </Select>
        {year >= 2004 && <div className="flex items-center gap-1">
          <Checkbox className="!text-white !p-0" onChange={(e) => {setWindField(e.target.checked)}}/>
          <h1 className="text-white font-bold">Wind Field</h1>
        </div>}
      </div>
      {seasonStats === false ? <Storm/> : <Season/>}
    </div>
  )
}

export default Interface