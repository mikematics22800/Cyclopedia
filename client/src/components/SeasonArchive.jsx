import { useContext, useState, useEffect } from 'react'
import { Context } from '../App'
import { sum } from '../libs/sum'

const SeasonArchive = () => {
  const {season, seasonACE, maxWinds, year} = useContext(Context)

  const [hurricanes, setHurricanes] = useState(0)
  const [majorHurricanes, setMajorHurricanes] = useState(0)
  const [deadOrMissing, setDeadOrMissing] = useState(0)
  const [cost, setCost] = useState(0)
  const [seasonTIKE, setSeasonTIKE] = useState(0)

  useEffect(() => {
    const deadOrMissing = season.map((storm) => {
      return storm.dead_or_missing
    })
    setDeadOrMissing(sum(deadOrMissing))
    const costs = season.map((storm) => {
      return storm.cost_usd
    })
    const cost = sum(costs)
    setCost((cost/1000000).toFixed(1))
    const hurricanes = maxWinds.filter(wind => wind >= 64).length
    setHurricanes(hurricanes)
    const majorHurricanes = maxWinds.filter(wind => wind >= 96).length
    setMajorHurricanes(majorHurricanes)
    
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
      const totalSeasonTIKE = sum(seasonTIKE)
      setSeasonTIKE(totalSeasonTIKE)
    }
  }, [season, year])

  return (
    <div className='season'>
      <div className='w-full max-w-96 flex flex-col items-center'>
        <ul className='season-data bg-gray-800'>
          {/* Season Header */}
          <li className='flex flex-col border-b border-gray-600 p-2'>
            <h1 className='text-lg font-bold'>Season Totals</h1>     
          </li>
          
          {/* Storm Counts */}
          <li className='flex justify-between p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
            <h2 className='text-sm font-semibold '>Tropical Cyclones</h2>
            <h2 className='text-lg font-bold'>{season.length}</h2>
          </li>
          
          <li className='flex justify-between p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
            <h2 className='text-sm font-semibold '>Hurricanes</h2>
            <h2 className='text-lg font-bold'>{hurricanes}</h2>
          </li>
          
          <li className='flex justify-between p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
            <h2 className='text-sm font-semibold '>Major Hurricanes</h2>
            <h2 className='text-lg font-bold'>{majorHurricanes}</h2>
          </li>
          
          {/* Impact Metrics */}
          <li className='flex justify-between p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
            <h2 className='text-sm font-semibold '>Dead/Missing</h2>
            <h2 className='text-lg font-bold'>{deadOrMissing}</h2>
          </li>
          
          <li className='flex justify-between p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
            <h2 className='text-sm font-semibold '>Cost (Million USD)</h2>
            <h2 className='text-lg font-bold text-green-400'>${cost}</h2>
          </li>

          {/* Energy Metrics */}
          <li className='flex justify-between p-2 border-b border-gray-600 hover:bg-gray-700 transition-colors duration-200'>
            <h2 className='text-sm font-semibold '>Accumulated Cyclone Energy</h2>
            <h2 className='text-lg font-bold'>{sum(seasonACE).toFixed(1)}</h2>
          </li>
          
          {year >= 2004 && (
            <li className='flex justify-between p-2 hover:bg-gray-700 transition-colors duration-200'>
              <h2 className='text-sm font-semibold '>Track Integrated Kinetic Energy</h2>
              <h2 className='text-lg font-bold'>{seasonTIKE.toFixed(1)} TJ</h2>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default SeasonArchive