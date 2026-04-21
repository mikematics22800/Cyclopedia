'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';

const StormMetrics = () => {
  const { season, seasonACE, maxWinds, basin } = useAppContext();

  const [hurricanes, setHurricanes] = useState<number>(0);
  const [majorHurricanes, setMajorHurricanes] = useState<number>(0);
  const [deadOrMissing, setDeadOrMissing] = useState<number>(0);
  const [cost, setCost] = useState<string>('0');
  const [landfalls, setlandfalls] = useState<number>(0);

  useEffect(() => {
    if (!season) return;

    const landfallCount = season.reduce((acc, storm) => {
      return (
        acc + storm.data.filter((point) => point.record === 'L').length
      );
    }, 0);
    setlandfalls(landfallCount);

    const deadOrMissing = season.map((storm) => {
      return storm.dead_or_missing || 0;
    });
    setDeadOrMissing(sum(deadOrMissing));
    const costs = season.map((storm) => {
      return storm.cost_usd || 0;
    });
    const cost = sum(costs);
    setCost((cost/1000000).toFixed(1));
    const hurricanes = maxWinds.filter(wind => wind >= 64).length;
    setHurricanes(hurricanes);
    const majorHurricanes = maxWinds.filter(wind => wind >= 96).length;
    setMajorHurricanes(majorHurricanes);

  }, [season, maxWinds]);

  if (!season) return null;


  return (
    <div className='season'>
      <div className='w-full flex flex-col items-center'>
        <ul className='data-table'>  
          <li className='data-row border-y'>
            <h2 className='label'>Tropical Cyclones</h2>
            <h2 className='value'>{season.length}</h2>
          </li>
          
          <li className='data-row border-b'>
            <h2 className='label'>Hurricanes</h2>
            <h2 className='value'>{hurricanes}</h2>
          </li>
          
          <li className='data-row border-b'>
            <h2 className='label'>Major Hurricanes</h2>
            <h2 className='value'>{majorHurricanes}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Accumulated Cyclone Energy</h2>
            <h2 className='value'>{sum(seasonACE).toFixed(1)}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Landfalls</h2>
            <h2 className='value'>{landfalls}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Dead or Missing</h2>
            <h2 className='value'>{deadOrMissing}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Cost (Million USD)</h2>
            <h2 className='value cost-value'>${cost}</h2>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StormMetrics;
