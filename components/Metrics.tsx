'use client';

import { useMemo, useState, useEffect, useLayoutEffect, useRef, useId } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useAppContext } from '../contexts/AppContext';
import { sum } from '../libs/sum';
import { calculateSeasonTotalACE, calculateStormACE } from '../libs/calculateACE';
import { isAceYearAvailable } from '../libs/basins';
import { formatPressureDisplay, formatWindDisplay, isUnknownMetric } from '../libs/mapUtils';
import { Storm, StormDataPoint } from '../libs/hurdat';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

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

const formatStormDuration = (data: StormDataPoint[]) => {
  const startArray = data[0].date.toString().split('');
  const startYear = startArray.slice(0, 4).join('');
  const startMonth = parseInt(startArray.slice(4, 6).join(''), 10);
  const startDay = parseInt(startArray.slice(-2).join(''), 10);
  const startDate = `${startMonth}/${startDay}/${startYear}`;

  const endArray = data[data.length - 1].date.toString().split('');
  const endYear = endArray.slice(0, 4).join('');
  const endMonth = parseInt(endArray.slice(4, 6).join(''), 10);
  const endDay = parseInt(endArray.slice(-2).join(''), 10);
  const endDate = `${endMonth}/${endDay}/${endYear}`;

  return `${startDate}-${endDate}`;
};

const getStormTextColor = (data: StormDataPoint[], maxWind: number) => {
  const statuses = data.map((point) => point.status);
  if (statuses.includes('HU')) {
    if (maxWind <= 82) return 'yellow';
    if (maxWind <= 95) return 'orange';
    if (maxWind <= 112) return 'red';
    if (maxWind <= 136) return 'hotpink';
    return 'pink';
  }
  if (statuses.includes('TS')) return 'lime';
  if (statuses.includes('SS')) return '#D0F0C0';
  if (statuses.includes('TD')) return 'dodgerblue';
  return 'aqua';
};

const buildStormMetrics = (storm: Storm) => {
  const data = storm.data;
  const validWinds = data
    .map((point) => point.max_wind_kt)
    .filter((wind) => !isUnknownMetric(wind));
  const maxWindValue = validWinds.length ? Math.max(...validWinds) : 0;
  const validPressures = data
    .map((point) => point.min_pressure_mb)
    .filter((pressure): pressure is number => !isUnknownMetric(pressure));
  const minPressure = validPressures.length ? Math.min(...validPressures) : null;
  const landfalls = data.filter((point) => point.record === 'L');
  const inlandWinds = landfalls
    .map((point) => point.max_wind_kt)
    .filter((wind) => !isUnknownMetric(wind));
  const inlandPressures = landfalls
    .map((point) => point.min_pressure_mb)
    .filter((pressure): pressure is number => !isUnknownMetric(pressure));

  return {
    stormName: storm.id.split('_')[1],
    retired: storm.retired,
    duration: formatStormDuration(data),
    maxWind: formatWindDisplay(maxWindValue),
    minPressure: formatPressureDisplay(minPressure),
    landfalls,
    inlandMaxWind: inlandWinds.length ? formatWindDisplay(Math.max(...inlandWinds)) : 'Unknown',
    inlandMinPressure: inlandPressures.length
      ? formatPressureDisplay(Math.min(...inlandPressures))
      : 'Unknown',
    cost: ((storm.cost_usd || 0) / 1_000_000).toFixed(1),
    deadOrMissing: (storm.dead_or_missing || 0).toString(),
    textColor: getStormTextColor(data, maxWindValue),
    ace: calculateStormACE(data),
  };
};

const SeasonMetrics = () => {
  const { season, maxWinds, basin, year } = useAppContext();
  const revealRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(() => {
    if (!season) return null;

    const landfalls = season.reduce(
      (acc, storm) => acc + storm.data.filter((point) => point.record === 'L').length,
      0,
    );

    return {
      hurricanes: maxWinds.filter((wind) => wind >= 64).length,
      majorHurricanes: maxWinds.filter((wind) => wind >= 96).length,
      category5Hurricanes: maxWinds.filter((wind) => wind >= 137).length,
      deadOrMissing: sum(season.map((storm) => storm.dead_or_missing || 0)),
      cost: (sum(season.map((storm) => storm.cost_usd || 0)) / 1_000_000).toFixed(1),
      landfalls,
    };
  }, [season, maxWinds]);

  useLayoutEffect(() => {
    const panel = revealRef.current;
    if (!panel) return;
    const rows = panel.querySelectorAll('.data-row');
    const ctx = gsap.context(() => {
      gsap.from(rows, {
        opacity: 0,
        x: -10,
        stagger: { amount: 0.2 },
        duration: 0.3,
        ease: 'power2.out',
      });
    }, panel);
    return () => ctx.revert();
  }, [basin, year, season]);

  if (!season || !metrics) return null;

  return (
    <div className='season'>
      <div ref={revealRef} className='w-full flex flex-col items-center'>
        <ul className='data-table'>
          <li className='data-row border-y'>
            <h2 className='label'>Tropical Cyclones</h2>
            <h2 className='value'>{season.length}</h2>
          </li>

          <li className='data-row border-b'>
            <h2 className='label'>Hurricanes or Equivalent (≥ 64 kt)</h2>
            <h2 className='value'>{metrics.hurricanes}</h2>
          </li>

          <li className='data-row border-b'>
            <h2 className='label'>Major Hurricanes or Equivalent (≥ 96 kt)</h2>
            <h2 className='value'>{metrics.majorHurricanes}</h2>
          </li>

          <li className='data-row border-b'>
            <h2 className='label'>Category 5 Hurricanes or Equivalent (≥ 137 kt)</h2>
            <h2 className='value'>{metrics.category5Hurricanes}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Accumulated Cyclone Energy</h2>
            <h2 className='value'>
              {isAceYearAvailable(basin, year)
                ? calculateSeasonTotalACE(season).toFixed(1)
                : 'Unknown'}
            </h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Landfalls</h2>
            <h2 className='value'>{metrics.landfalls}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Dead or Missing</h2>
            <h2 className='value'>{metrics.deadOrMissing}</h2>
          </li>
          <li className='data-row border-b'>
            <h2 className='label'>Total Cost (Million {year} USD)</h2>
            <h2 className='value cost-value'>${metrics.cost}</h2>
          </li>
        </ul>
      </div>
    </div>
  );
};

const StormMetrics = () => {
  const { year, storm, stormId, basin } = useAppContext();
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const revealRef = useRef<HTMLDivElement>(null);
  const retiredBadgeRef = useRef<HTMLSpanElement>(null);

  const metrics = useMemo(
    () => (storm ? buildStormMetrics(storm) : null),
    [storm],
  );

  useEffect(() => {
    setImageState('loading');
  }, [stormId]);

  useLayoutEffect(() => {
    if (!metrics?.retired) return;
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
  }, [metrics?.retired, stormId]);

  useLayoutEffect(() => {
    const panel = revealRef.current;
    if (!panel) return;
    const rows = panel.querySelectorAll('[data-storm-reveal]');
    const ctx = gsap.context(() => {
      gsap.from(rows, {
        opacity: 0,
        x: -10,
        stagger: { amount: 0.2 },
        duration: 0.3,
        ease: 'power2.out',
      });
    }, panel);
    return () => ctx.revert();
  }, [stormId]);

  if (!storm || !metrics) return null;

  const stormImageUrl = `https://cyclopedia-images.s3.us-east-2.amazonaws.com/${stormId}.png`;
  const tcrLinkEnabled = (basin === 'n_atlantic' || basin === 'e_pacific') && year >= 1995;

  return (
    <div className='storm mt-5'>
      <div
        ref={revealRef}
        className='flex flex-col gap-5 w-full items-center'
      >
        <ul className='data-table'>
          <li data-storm-reveal className='header'>
            <a
              target='_blank'
              className={`storm-image max-w-96 retired ${!tcrLinkEnabled ? '!pointer-events-none' : ''}`}
              style={
                imageState === 'loaded'
                  ? { backgroundImage: `url(${stormImageUrl})` }
                  : undefined
              }
              href={tcrLinkEnabled ? `https://www.nhc.noaa.gov/data/tcr/${stormId}.pdf` : undefined}
            >
              <img
                key={stormId}
                src={stormImageUrl}
                alt=''
                decoding='async'
                className='absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
                style={{ clip: 'rect(0, 0, 0, 0)' }}
                aria-hidden
                onLoad={() => setImageState('loaded')}
                onError={() => setImageState('error')}
              />
              {imageState === 'loading' && (
                <div
                  className='absolute inset-0 z-[1] flex items-center justify-center rounded-3xl bg-gray-400'
                  role='status'
                >
                  <StormImageLoader />
                </div>
              )}
              {imageState === 'error' && (
                <div className='absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2'>
                  <ImageNotSupportedOutlinedIcon className='!text-6xl' />
                  <span className='text-xl font-bold'>
                    Image Unavailable
                  </span>
                </div>
              )}
              {metrics.retired && (
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
            <h1 className='title my-1' style={{ color: metrics.textColor }}>
              {metrics.stormName}
            </h1>
            <h1 className='font-bold'>
              {metrics.duration}
            </h1>
          </li>
          <li data-storm-reveal className='data-row border-b'>
            <h2 className='label'>Maximum Wind</h2>
            <h2 className='value'>{metrics.maxWind}</h2>
          </li>

          {metrics.landfalls.length > 0 && (
            <li data-storm-reveal className='data-row border-b'>
              <h2 className='label'>Maximum Inland Wind</h2>
              <h2 className='value'>{metrics.inlandMaxWind}</h2>
            </li>
          )}

          <li data-storm-reveal className='data-row border-b'>
            <h2 className='label'>Minimum Pressure</h2>
            <h2 className='value'>{metrics.minPressure}</h2>
          </li>

          {metrics.landfalls.length > 0 && (
            <li data-storm-reveal className='data-row border-b'>
              <h2 className='label'>Minimum Inland Pressure</h2>
              <h2 className='value'>{metrics.inlandMinPressure}</h2>
            </li>
          )}
          <li data-storm-reveal className='data-row border-b'>
            <h2 className='label'>Accumulated Cyclone Energy</h2>
            <h2 className='value'>{metrics.ace.toFixed(1)}</h2>
          </li>
          <li data-storm-reveal className='data-row border-b'>
            <h2 className='label'>Landfalls</h2>
            <h2 className='value'>{metrics.landfalls.length}</h2>
          </li>
          <li data-storm-reveal className='data-row border-b'>
            <h2 className='label'>Dead or Missing</h2>
            <h2 className='value'>{metrics.deadOrMissing}</h2>
          </li>

          <li data-storm-reveal className='data-row border-b'>
            <h2 className='label'>Cost (Million {year} USD)</h2>
            <h2 className='value cost-value'>${metrics.cost}</h2>
          </li>
        </ul>
      </div>
    </div>
  );
};

const Metrics = () => (
  <>
    <SeasonMetrics />
    <StormMetrics />
  </>
);

export default Metrics;
