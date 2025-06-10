import { useState, useEffect, useContext } from "react";
import { Context } from "../App";
import Storm from "./Storm";
import Season from "./Season";
import { MenuItem, Select, Checkbox } from "@mui/material"
import Charts from "./ArchiveCharts";
import cyclone from "../../public/cyclone.png"

const Archive = () => {

  const { basin, setBasin, year, setYear, stormId, setStormId, setWindField, season } = useContext(Context)

  const startYear = basin === 'atl' ? 1850 : 1948
  const years = new Array(2024 - startYear).fill(0)

  const [stormIds, setStormIds] = useState(null)

  useEffect(() => {
    const stormIds = season.map((storm) => {
      return storm.id    
    })
    setStormIds(stormIds) 
  }, [season])

  return (
    <div className='interface'>
      <div className="bg-gray-300 rounded-full w-20 h-1 md:hidden"/>
      <div className="flex items-center md:hidden">
        <img src={cyclone} className="h-10 mr-2"/>
        <h1 className="storm-font text-4xl text-white font-bold italic">CYCLOPEDIA</h1>
      </div>
      <div className="selectors">
        <Select className="select" value={basin} onChange={(e) => {setBasin(e.target.value)}}>
          <MenuItem value="atl"><p className="text-black font-bold">Atlantic</p></MenuItem>
          <MenuItem value="pac"><p className="text-black font-bold">Pacific</p></MenuItem>
        </Select>
        <Select className="select" value={year} onChange={(e) => {setYear(e.target.value)}}>
          {years.map((_, index) => {
            const selectedYear = 2024 - index;
            return (<MenuItem key={index} value={selectedYear}><p className="text-black font-bold">{selectedYear}</p></MenuItem>);
          })}
        </Select>
        <Select className="select" value={stormId} onChange={(e) => {setStormId(e.target.value)}}>
          {stormIds?.map((id) => {
            const name = id.split('_')[1]
            return (<MenuItem key={id} value={id}><p className="text-black font-bold">{name}</p></MenuItem>);
          })}
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Checkbox disabled={year < 2004} className={year < 2004 ? "!text-gray-400 !p-0" : "!text-white !p-0"} onChange={(e) => {setWindField(e.target.checked)}}/>
        <h1 className={year < 2004 ? "text-gray-400 font-bold" : "text-white font-bold"}>Wind Field</h1>
      </div>
      <Storm/>
      <Season/>
      <div className="md:hidden w-full">
        <Charts/>
      </div>
      <h1 className="text-white font-bold text-sm">© 2025 Mikematics. All rights reserved.</h1>
    </div>
  )
}

export default Archive