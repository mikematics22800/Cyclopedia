import { useState, useEffect, useContext } from "react";
import { Context } from "../App";
import Storm from "./Storm";
import Season from "./Season";
import { MenuItem, Select, Checkbox } from "@mui/material"

const Interface = () => {

  const { basin, setBasin, year, setYear, stormId, setStormId, setWindField, season } = useContext(Context)

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
    <div className='interface'>
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
      <Storm/>
      <Season/>
    </div>
  )
}

export default Interface