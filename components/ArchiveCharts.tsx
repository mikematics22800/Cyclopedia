'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGsapReveal } from './hooks/useGsapReveal';

const Intensity = dynamic(() => import("./Intensity"), { ssr: false });
const AceTike = dynamic(() => import("./AceTike"), { ssr: false });

const ArchiveCharts = ({stormId}: {stormId: string}) => {
  const chartsRef = useRef<HTMLDivElement>(null);

  useGsapReveal(chartsRef, [stormId], {
    selector: '.chart-wrapper',
    y: 28,
    stagger: 0.12,
    duration: 0.58,
  });

  return (
    <div className="charts-container">
      <div ref={chartsRef} className="charts">
        <>
          <Intensity />
          <AceTike />
        </>
        </div>
    </div>
  );
};

export default ArchiveCharts;
