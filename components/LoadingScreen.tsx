'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

const LoadingScreen = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const logo = root.querySelector<HTMLElement>('.loading-logo');
      const label = root.querySelector<HTMLElement>('.loading-label');
      if (logo) {
        const tl = gsap.timeline();
        tl.fromTo(
          logo,
          { scale: 0.82, opacity: 0, rotation: -6 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.85,
            ease: 'back.out(1.35)',
          }
        );
        tl.to(logo, {
          rotation: '+=360',
          duration: 14,
          ease: 'none',
          repeat: -1,
        });
      }
      if (label) {
        gsap.fromTo(
          label,
          { opacity: 0, y: 8 },
          {
            opacity: 0.9,
            y: 0,
            duration: 0.5,
            delay: 0.4,
            ease: 'power2.out',
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="loading-screen">
      <Image
        className="loading-logo sm:w-60 w-40 h-auto"
        src="/cyclone.png"
        alt="Loading"
        width={240}
        height={240}
        priority
        unoptimized
      />
      <p className="loading-label text-sky-200/90 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
        Loading archive
      </p>
    </div>
  );
};

export default LoadingScreen;
