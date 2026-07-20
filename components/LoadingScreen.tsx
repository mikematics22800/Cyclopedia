'use client';

import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

type LoadingScreenProps = {
  overlay?: boolean;
  className?: string;
};

const LoadingScreen = ({ overlay = false, className = '' }: LoadingScreenProps) => {
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

  const rootClassName = [
    'loading-screen',
    overlay && 'loading-screen--overlay',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootClassName}>
      <div className="loading-logo-wrap">
        <div className="loading-logo-spin spin">
          <img
            className="loading-logo lg:w-60 w-40 h-auto"
            src="/cyclone.png"
            alt="Loading"
            width={240}
            height={240}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
