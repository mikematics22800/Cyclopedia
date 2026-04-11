'use client';

import { RefObject, useLayoutEffect } from 'react';
import gsap from 'gsap';

export type GsapRevealOptions = {
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  scale?: number;
};

export function useGsapReveal(
  ref: RefObject<HTMLElement | null>,
  deps: readonly unknown[],
  options?: GsapRevealOptions
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const {
      selector = '[data-gsap-reveal]',
      y = 14,
      duration = 0.52,
      stagger = 0.07,
      delay = 0,
      scale,
    } = options ?? {};

    const ctx = gsap.context(() => {
      const matches = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(selector)
      );
      const targets = matches.length > 0 ? matches : [root];

      const from: gsap.TweenVars = { opacity: 0, y };
      if (scale !== undefined) from.scale = scale;

      const to: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
      };
      if (scale !== undefined) to.scale = 1;

      gsap.fromTo(targets, from, to);
    }, root);

    return () => ctx.revert();
  }, deps);
}
