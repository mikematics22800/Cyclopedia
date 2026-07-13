'use client';

import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const ROW_SELECTOR = '.settings-row';

const PANEL_ANIMATION = {
  hidden: { opacity: 0, x: -10 },
  duration: 0.18,
  staggerAmount: 0.1,
} as const;

export function useSettingsPanelAnimation(
  open: boolean,
  panelRef: RefObject<HTMLDivElement | null>,
  enabled = true
) {
  const [panelVisible, setPanelVisible] = useState(open);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!enabled) return;
    if (open) {
      setPanelVisible(true);
    }
  }, [open, enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;

    const panel = panelRef.current;
    if (!panelVisible || !panel) return;

    const rows = panel.querySelectorAll<HTMLElement>(ROW_SELECTOR);
    if (rows.length === 0) return;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.from(rows, {
          ...PANEL_ANIMATION.hidden,
          stagger: { amount: PANEL_ANIMATION.staggerAmount },
          duration: PANEL_ANIMATION.duration,
          ease: 'power2.out',
        });
      } else {
        gsap.to(rows, {
          ...PANEL_ANIMATION.hidden,
          stagger: { amount: PANEL_ANIMATION.staggerAmount, from: 'end' },
          duration: PANEL_ANIMATION.duration,
          ease: 'power2.in',
          onComplete: () => {
            if (!openRef.current) {
              setPanelVisible(false);
            }
          },
        });
      }
    }, panel);

    return () => ctx.revert();
  }, [open, panelVisible, enabled, panelRef]);

  return enabled ? panelVisible : open;
}
