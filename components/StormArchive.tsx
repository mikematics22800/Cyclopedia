'use client';

import { useState, useEffect, useLayoutEffect, useRef, useId } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';
import CycloneIcon from '@mui/icons-material/Cyclone';
import { useGsapReveal } from './hooks/useGsapReveal';

const STORM_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'] as const;
const stormImageUrl = (basin: string, year: number, stormId: string, ext: string) =>
  `https://cyclopedia-images.s3.us-east-2.amazonaws.com/${basin}/${year}/${stormId}.${ext}`;

/** Vector spinner: crisp at any DPI, gradient arc + soft glow */
const StormImageLoader = () => {
  const uid = useId().replace(/:/g, '');
  const gradId = `storm-img-loader-grad-${uid}`;

  return (
    <div className='relative size-[52px]'>
      <svg
        className='size-[52px] animate-[spin_1.05s_linear_infinite]'
        viewBox='0 0 52 52'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden
      >
        <defs>
          <linearGradient
            id={gradId}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <stop offset='0%' stopColor='#22d3ee' />
            <stop offset='55%' stopColor='#67e8f9' />
            <stop offset='100%' stopColor='#a5f3fc' />
          </linearGradient>
        </defs>
        <circle
          cx='26'
          cy='26'
          r='22'
          fill='none'
          stroke='rgb(55 65 81 / 0.35)'
          strokeWidth='2.5'
        />
        <circle
          cx='26'
          cy='26'
          r='22'
          fill='none'
          stroke={`url(#${gradId})`}
          strokeWidth='2.75'
          strokeLinecap='round'
          strokeDasharray='34 104'
          className='drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]'
        />
      </svg>
    </div>
  );
};

const StormArchive = () => {
  const { year, storm, stormId, basin } = useAppContext();
  const [ACE, setACE] = useState<number>(0);
  const [stormName, setStormName] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('');
  const [retired, setRetired] = useState<boolean>(false);
  const [duration, setDuration] = useState<string>('');
  const [maxWind, setMaxWind] = useState<string>('');
  const [minPressure, setMinPressure] = useState<string>('');
  const [landfalls, setLandfalls] = useState<any[]>([]);
  const [inlandMaxWind, setInlandMaxWind] = useState<string>('');
  const [inlandMinPressure, setInlandMinPressure] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [deadOrMissing, setDeadOrMissing] = useState<string>('');
  const [stormImageExtIndex, setStormImageExtIndex] = useState(0);
  const [resolvedStormImageUrl, setResolvedStormImageUrl] = useState<string | null>(null);
  const [stormImageUnavailable, setStormImageUnavailable] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const revealRef = useRef<HTMLDivElement>(null);
  const retiredBadgeRef = useRef<HTMLSpanElement>(null);
  const stormImageCtxRef = useRef({ basin, year, stormId });
  stormImageCtxRef.current = { basin, year, stormId };

  const showRetiredBadge =
    retired && !!resolvedStormImageUrl && !stormImageUnavailable;

  useLayoutEffect(() => {
    if (!showRetiredBadge) return;
    const el = retiredBadgeRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      );
    }, el);
    return () => ctx.revert();
  }, [showRetiredBadge, stormId]);

  useGsapReveal(revealRef, [stormId], {
    selector: '[data-storm-reveal]',
    stagger: 0.065,
    y: 18,
  });

  useEffect(() => {
    if (!storm) return;

    setStormName(storm.id.split('_')[1]); 
    setRetired(storm.retired || false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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

    // Cleanup function to clear timeout
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [storm, year]);

  useEffect(() => {
    setStormImageExtIndex(0);
    setResolvedStormImageUrl(null);
    setStormImageUnavailable(false);
  }, [basin, year, stormId]);

  if (!storm) return null;

  const probeStormImageSrc = stormImageUrl(
    basin,
    year,
    stormId,
    STORM_IMAGE_EXTENSIONS[stormImageExtIndex],
  );

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
              <img
                key={`${basin}-${year}-${stormId}-${stormImageExtIndex}`}
                src={probeStormImageSrc}
                alt=''
                decoding='async'
                className='absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
                style={{ clip: 'rect(0, 0, 0, 0)' }}
                aria-hidden
                onLoad={(e) => {
                  const url = e.currentTarget.currentSrc || e.currentTarget.src;
                  const { stormId: id } = stormImageCtxRef.current;
                  if (!url.includes(`/${id}.`)) return;
                  setResolvedStormImageUrl(url);
                }}
                onError={(e) => {
                  const url = e.currentTarget.src;
                  const { stormId: id } = stormImageCtxRef.current;
                  if (!url.includes(`/${id}.`)) return;
                  setStormImageExtIndex((i) => {
                    if (i < STORM_IMAGE_EXTENSIONS.length - 1) return i + 1;
                    setStormImageUnavailable(true);
                    return i;
                  });
                }}
              />
              <a 
                target='_blank' 
                className={`storm-image ${retired ? 'retired' : ''} ${year < 1995 ? '!pointer-events-none' : ''}`}
                style={
                  resolvedStormImageUrl && !stormImageUnavailable
                    ? { backgroundImage: `url(${resolvedStormImageUrl})` }
                    : undefined
                }
                href={`https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf`}
              >
                {!resolvedStormImageUrl && !stormImageUnavailable && (
                  <div
                    className='absolute inset-0 z-[1] flex items-center justify-center rounded-3xl bg-gradient-to-b from-gray-400/95 to-gray-500/90'
                    role='status'
                    aria-label='Loading storm image'
                  >
                    <StormImageLoader />
                  </div>
                )}
                {stormImageUnavailable && (
                  <div className='unavailable'>
                    <CycloneIcon className='cyclone-icon'/>
                    <h1 className='text-lg font-bold text-gray-600'>Image Unavailable</h1>
                  </div>
                )}
                
                {showRetiredBadge && (
                  <span ref={retiredBadgeRef} className='inline-flex shrink-0'>
                    <Image
                      className='retired-badge'
                      src='/retired.png'
                      alt='Retired'
                      width={120}
                      height={120}
                      quality={100}
                      unoptimized
                      priority
                    />
                  </span>
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
              className='data-row border-b'
            >
              <h2 className='label'>Accumulated Cyclone Energy</h2>
              <h2 className='value'>{ACE.toFixed(1)}</h2>
            </li>
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
