'use client';

import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import List from '@mui/icons-material/List';
import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const Legend = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openPanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = openPanelRef.current;
    if (!isOpen || !panel) return;
    const keys = panel.querySelectorAll('.key');
    const ctx = gsap.context(() => {
      gsap.from(keys, {
        opacity: 0,
        x: -10,
        stagger: 0.032,
        duration: 0.34,
        ease: 'power2.out',
      });
    }, panel);
    return () => ctx.revert();
  }, [isOpen]);

  return (
      <div className="legend-container">
      {isOpen ? (
        <div
          ref={openPanelRef}
          className="legend"
        >
          <div className="archive-map-settings-row flex justify-between items-center gap-2 border-b border-white/10 pb-2 mb-1">
            <span className="text-sm font-bold tracking-wide text-white/95">
              Legend
            </span>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{
                color: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Close className="!text-xl" />
            </IconButton>
          </div>
          <div className="key">
            <span className="bg-[dodgerblue]"/>
            <h1 className="text-sm">Tropical Depression</h1>
          </div>
          <div className="key">
            <span className="color bg-[lime]"/>
            <h1 className="text-sm">Tropical Storm</h1>
          </div>
          <div className="key">
            <span className="bg-[yellow]"/>
            <h1 className="text-sm">Category 1 Hurricane</h1>
          </div>
          <div className="key">
            <span className="bg-[orange]"/>
            <h1 className="text-sm">Category 2 Hurricane</h1>
          </div>
          <div className="key">
            <span className="bg-[red]"/>
            <h1 className="text-sm">Category 3 Hurricane</h1>
          </div>
          <div className="key">
            <span className="bg-[hotpink]"/>
            <h1 className="text-sm">Category 4 Hurricane</h1>
          </div>
          <div className="key">
            <span className="bg-[pink]"/>
            <h1 className="text-sm">Category 5 Hurricane</h1>
          </div>
          <div className="key">
            <span className="bg-[aqua]"/>
            <h1 className="text-sm">Subtropical Depression</h1>
          </div>
          <div className="key">
            <span className="bg-[#D0F0C0]"/>
            <h1 className="text-sm">Subtropical Storm</h1>
          </div>
          <div className="key">
            <span className="bg-[#7F00FF]"/>
            <h1 className="text-sm">Extratropical Cyclone</h1>
          </div>
          <div className="key">
            <span className="bg-[gray]"/>
            <h1 className="text-sm">Tropical Wave</h1>
          </div>
          <div className="key">
            <span className="bg-[lightgray]"/>
            <h1 className="text-sm">Tropical Disturbance</h1>
          </div>
          <div className="key">
            <span className="bg-white"/>
            <h1 className="text-sm">Tropical Low</h1>
          </div>
        </div>
    ) : (
      <div className="legend" onClick={() => setIsOpen(!isOpen)}>
        <Tooltip
          title="Legend"
          arrow
          placement="bottom"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            },
          }}
        >
          <List className="text-white" />
        </Tooltip>
      </div>
    )}
    </div>
  );
};

export default Legend;
