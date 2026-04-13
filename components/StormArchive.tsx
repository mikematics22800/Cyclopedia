'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';
import CycloneIcon from '@mui/icons-material/Cyclone';
import { useGsapReveal } from './hooks/useGsapReveal';

const StormArchive = () => {
  const { year, storm, stormId } = useAppContext();
  const [ACE, setACE] = useState<number>(0);
  const [TIKE, setTIKE] = useState<number>(0);
  const [stormName, setStormName] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('');
  const [retired, setRetired] = useState<boolean>(false);
  const [duration, setDuration] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [maxWind, setMaxWind] = useState<string>('');
  const [minPressure, setMinPressure] = useState<string>('');
  const [landfalls, setLandfalls] = useState<any[]>([]);
  const [inlandMaxWind, setInlandMaxWind] = useState<string>('');
  const [inlandMinPressure, setInlandMinPressure] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [deadOrMissing, setDeadOrMissing] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const revealRef = useRef<HTMLDivElement>(null);

  useGsapReveal(revealRef, [stormId], {
    selector: '[data-storm-reveal]',
    stagger: 0.065,
    y: 18,
  });

  useEffect(() => {
    if (!storm) return;

    setStormName(storm.id.split('_')[1]);
    const newImage = storm.image || '';
    setImage(newImage);
    // Only set loading to true if there's actually an image to load
    setImageLoading(newImage !== '');
    setRetired(storm.retired || false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Safety timeout: hide spinner after 5 seconds if image hasn't loaded
    if (newImage !== '') {
      timeoutRef.current = setTimeout(() => {
        setImageLoading(false);
      }, 5000);
    }

    const data = storm.data;

    const startArray = data[0].date.toString().split('');
    const startYear = startArray.slice(0,4).join('');
    const startMonth = parseInt(startArray.slice(4,6).join(''));
    const startDay = parseInt(startArray.slice(-2).join(''));
    const startDate = `${startMonth}/${startDay}/${startYear}`;
    const endArray = data[data.length - 1].date.toString().split('');    
    const endYear = endArray.slice(0,4).join('');
    const endMonth = parseInt(endArray.slice(4,6).join(''));
    const endDay = parseInt(endArray.slice(-2).join(''));
    const endDate = `${endMonth}/${endDay}/${endYear}`;
    const duration = `${startDate}-${endDate}`;
    setDuration(duration);

    const winds = data.map((point) => {
      return point.max_wind_kt;
    });
    const maxWind = Math.max(...winds);
    setMaxWind(maxWind.toString());

    const pressures = data.map((point) => {
      if (point.min_pressure_mb && point.min_pressure_mb > 0) {
        return point.min_pressure_mb;
      } else {
        return 9999;
      }
    });

    const minPressure = Math.min(...pressures);
    setMinPressure(minPressure.toString());

    const landfalls = data.filter(point => point.record === "L");
    setLandfalls(landfalls);

    const inlandWinds = landfalls.map((point) => {
      return point.max_wind_kt;
    });
    setInlandMaxWind(Math.max(...inlandWinds).toString());

    const inlandPressures = landfalls.map((point) => {
      if (point.min_pressure_mb && point.min_pressure_mb > 0) {
        return point.min_pressure_mb;
      } else {
        return 9999;
      }
    });
    setInlandMinPressure(Math.min(...inlandPressures).toString());

    const cost = ((storm.cost_usd || 0)/1000000).toFixed(1);
    setCost(cost);

    const deadOrMissing = storm.dead_or_missing || 0;
    setDeadOrMissing(deadOrMissing.toString());

    let textColor: string = "aqua";
    const statuses = data.map((point) => {
      return point.status;
    });
    if (statuses.includes("HU")) {
      if (maxWind <= 82) {
        textColor = "yellow";
      }
      if (maxWind > 82 && maxWind <= 95) {
        textColor = "orange";
      }
      if (maxWind > 95 && maxWind <= 110) {
        textColor = "red";
      }
      if (maxWind > 110 && maxWind <= 135) {
        textColor = "hotpink";
      }
      if (maxWind > 135) {
        textColor = "pink";
      }
    } else {
      if (statuses.includes("TS")) {
        textColor = "lime";
      } else {
        if (statuses.includes("SS")) {
          textColor = "#D0F0C0";
        } else {
          if (statuses.includes("TD")) {
            textColor = "dodgerblue";
          } else {
            textColor = "aqua";
          }
        }
      }
    }
    setTextColor(textColor);

    // Calculate ACE
    let ACEPoint = 0;
    let windArray: number[] = [];
    const ACEArray = data.map((point: any) => {
      const wind = point.max_wind_kt;
      const hour = parseInt(point.time_utc);
      if (["TS", "SS", "HU"].includes(point.status)) {
        if (hour % 600 == 0) {
          ACEPoint += Math.pow(wind, 2)/10000;
          if (windArray.length > 0) {
            const average = sum(windArray)/windArray.length;
            ACEPoint += Math.pow(average, 2)/10000;
            windArray = [];
          }
        } else {
          windArray.push(wind);
        }
      }
      return ACEPoint;
    });
    const calculatedACE = Math.max(...ACEArray);
    setACE(calculatedACE);

    // Calculate TIKE if year >= 2004 and wind radii data is available
    if (year >= 2004) {
      let tikeArray: number[] = [];
      let cumulativeTIKE = 0;
      
      data.forEach((point: any) => {
        if (point['34kt_wind_nm'] && point['50kt_wind_nm'] && point['64kt_wind_nm']) {
          const wind34 = point['34kt_wind_nm'];
          const wind50 = point['50kt_wind_nm'];
          const wind64 = point['64kt_wind_nm'];
          
          // Calculate area of wind field for each wind speed threshold
          const area34 = Math.PI * Math.pow((wind34.ne + wind34.se + wind34.sw + wind34.nw) / 4 * 1852, 2);
          const area50 = Math.PI * Math.pow((wind50.ne + wind50.se + wind50.sw + wind50.nw) / 4 * 1852, 2);
          const area64 = Math.PI * Math.pow((wind64.ne + wind64.se + wind64.sw + wind64.nw) / 4 * 1852, 2);
          
          // Calculate kinetic energy for each wind speed threshold
          const rho = 1.15;
          const v34 = 34 * 0.514444;
          const v50 = 50 * 0.514444;
          const v64 = 64 * 0.514444;
          
          const ke34 = 0.5 * rho * Math.pow(v34, 2) * area34;
          const ke50 = 0.5 * rho * Math.pow(v50, 2) * area50;
          const ke64 = 0.5 * rho * Math.pow(v64, 2) * area64;
          
          const totalKE = ke34 + ke50 + ke64;
          const totalKETJ = totalKE / 1e12;
          
          cumulativeTIKE += totalKETJ;
          tikeArray.push(cumulativeTIKE);
        } else {
          tikeArray.push(cumulativeTIKE);
        }
      });
      
      const finalTIKE = Math.max(...tikeArray);
      setTIKE(finalTIKE);
    } else {
      setTIKE(0);
    }

    // Cleanup function to clear timeout
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [storm, year]);

  if (!storm) return null;

  return (
    <div className='storm'>
      <div
        ref={revealRef}
        className='flex flex-col gap-5 w-full items-center'
      >
        {/* Storm Data Section */}
          <ul className='data-table'>
            {/* Storm Header */}
            <li data-storm-reveal className='header mt-5'>
              {/* Storm Image Section */}
              <a 
                target='_blank' 
                className={`storm-image ${retired ? 'retired' : ''} ${year < 1995 ? '!pointer-events-none' : ''}`}
                style={{backgroundImage: `url(${image})`}} 
                href={`https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf`}
              >
                {/* No Image State */}
                {image == "" && (
                  <div className='unavailable'>
                    <CycloneIcon className='cyclone-icon'/>
                    <h1 className='text-lg font-semibold text-gray-600'>Image Unavailable</h1>
                  </div>
                )}
                
                {retired && (
                  <Image 
                    className='retired-badge' 
                    src="/retired.png" 
                    alt="Retired" 
                    width={120} 
                    height={120}
                    quality={100}
                    unoptimized
                    priority
                  />
                )}
              </a>
              <h1 className='title' style={{color:textColor}}>
                {stormName}
              </h1>     
              <h1 className='text-sm font-bold'>
                {duration}
              </h1>     
            </li>
            <li data-storm-reveal className='data-row border-b'>
              <h2 className='label'>Maximum Wind</h2>
              <h2 className='value'>{maxWind} kt</h2>
            </li>
            
            {landfalls.length > 0 && (
              <li data-storm-reveal className='data-row border-b'>
                <h2 className='label'>Maximum Inland Wind</h2>
                <h2 className='value'>{inlandMaxWind} kt</h2>
              </li>
            )}
            
            <li data-storm-reveal className='data-row border-b'>
              <h2 className='label'>Minimum Pressure</h2>
              <h2 className='value'>
                {minPressure != "9999" && minPressure != "-999" ? `${minPressure} mb` : 'Unknown'}
              </h2>
            </li>
            
            {landfalls.length > 0 && (
            <li data-storm-reveal className='data-row border-b'>
                <h2 className='label'>Minimum Inland Pressure</h2>
                <h2 className='value'>
                  {inlandMinPressure != "9999" && inlandMinPressure != "-999" ? `${inlandMinPressure} mb` : 'Unknown'}
                </h2>
              </li>
            )}
             <li
              data-storm-reveal
              className={year >= 2004 ? 'data-row border-b' : 'data-row'}
            >
              <h2 className='label'>Accumulated Cyclone Energy</h2>
              <h2 className='value'>{ACE.toFixed(1)}</h2>
            </li>
            {year >= 2004 && (
              <li data-storm-reveal className='data-row border-b'>
                <h2 className='label'>Track Integrated Kinetic Energy</h2>
                <h2 className='value'>{TIKE.toFixed(1)} TJ</h2>
              </li>
            )}
            <li data-storm-reveal className='data-row border-b'>
              <h2 className='label'>Landfalls</h2>
              <h2 className='value'>{landfalls.length}</h2>
            </li>
            <li data-storm-reveal className='data-row border-b'>
              <h2 className='label'>Dead or Missing</h2>
              <h2 className='value'>{deadOrMissing}</h2>
            </li>
            
            <li data-storm-reveal className='data-row'>
              <h2 className='label'>Cost (Million USD)</h2>
              <h2 className='value cost-value'>${cost}</h2>
            </li>
          </ul>
        </div>
    </div>
  );
};

export default StormArchive;
