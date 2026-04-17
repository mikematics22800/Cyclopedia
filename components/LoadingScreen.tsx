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
      const logoWrap = root.querySelector<HTMLElement>('.loading-logo-wrap');
      if (logoWrap) {
        gsap.fromTo(
          logoWrap,
          { scale: 0.82, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.85,
            ease: 'back.out(1.35)',
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="loading-screen">
      <div className="loading-logo-wrap">
        <div className="loading-logo-spin spin">
          <Image
            className="loading-logo lg:w-60 w-40 h-auto"
            src="/cyclone.png"
            alt="Loading"
            width={240}
            height={240}
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
