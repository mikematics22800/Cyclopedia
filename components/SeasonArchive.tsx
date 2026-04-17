'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';

const SeasonArchive = () => {
  const { season, seasonACE, maxWinds, basin } = useAppContext();

  const [hurricanes, setHurricanes] = useState<number>(0);
  const [majorHurricanes, setMajorHurricanes] = useState<number>(0);
  const [deadOrMissing, setDeadOrMissing] = useState<number>(0);
  const [cost, setCost] = useState<string>('0');
  const [duration, setDuration] = useState<string>('');
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

    const startArray = season[0].data[0].date.toString().split('');
    const startYear = startArray.slice(0,4).join('');
    const startMonth = parseInt(startArray.slice(4,6).join(''));
    const startDay = parseInt(startArray.slice(-2).join(''));
    const startDate = `${startMonth}/${startDay}/${startYear}`;
    const endArray = season[season.length - 1].data[season[season.length - 1].data.length - 1].date.toString().split('');    
    const endYear = endArray.slice(0,4).join('');
    const endMonth = parseInt(endArray.slice(4,6).join(''));
    const endDay = parseInt(endArray.slice(-2).join(''));
    const endDate = `${endMonth}/${endDay}/${endYear}`;
    const duration = `${startDate}-${endDate}`;
    setDuration(duration);
  }, [season, maxWinds]);

  if (!season) return null;


  return (
    <div className='season'>
      <div className='w-full flex flex-col items-center'>
        <ul className='data-table'>
          <li className='header'>
            <h1 className='title'>{basin === 'atl' ? 'Atlantic' : 'Pacific'} Basin</h1>     
            <h1>{duration}</h1>
          </li>        
          <li className='data-row border-b'>
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
            <h2 className='label'>Accumulated Cyclone Energy</h2>
            <h2 className='value'>{sum(seasonACE).toFixed(1)}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Landfalls</h2>
            <h2 className='value'>{landfalls}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Dead or Missing</h2>
            <h2 className='value'>{deadOrMissing}</h2>
          </li>
          <li className='data-row'>
            <h2 className='label'>Cost (Million USD)</h2>
            <h2 className='value cost-value'>${cost}</h2>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SeasonArchive;
