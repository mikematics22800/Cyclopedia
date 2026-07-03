'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Close, FormatListBulleted } from '@mui/icons-material';
import gsap from 'gsap';
import { useAppContext } from '../contexts/AppContext';

const statusItems = [
  { colorClass: 'bg-[dodgerblue]', label: 'Tropical Depression', windRange: '< 34 kt' },
  { colorClass: 'bg-[lime]', label: 'Tropical Storm', windRange: '34-63 kt' },
  { colorClass: 'bg-[yellow]', label: 'Category 1 Hurricane', windRange: '64-82 kt' },
  { colorClass: 'bg-[orange]', label: 'Category 2 Hurricane', windRange: '83-95 kt' },
  { colorClass: 'bg-[red]', label: 'Category 3 Hurricane', windRange: '96-112 kt' },
  { colorClass: 'bg-[hotpink]', label: 'Category 4 Hurricane', windRange: '113-136 kt' },
  { colorClass: 'bg-[pink]', label: 'Category 5 Hurricane', windRange: '≥ 137 kt' },
  { colorClass: 'bg-[aqua]', label: 'Subtropical Depression', windRange: '< 34 kt' },
  { colorClass: 'bg-[#D0F0C0]', label: 'Subtropical Storm', windRange: '34-63 kt' },
  { colorClass: 'bg-[#7F00FF]', label: 'Extratropical Cyclone' },
  { colorClass: 'bg-[lightgray]', label: 'Tropical Low' },
] as const;

const windFieldItems = [
  { label: '≥ 34 kt', swatchClass: 'wind-field-swatch--34kt' },
  { label: '≥ 50 kt', swatchClass: 'wind-field-swatch--50kt' },
  { label: '≥ 64 kt', swatchClass: 'wind-field-swatch--64kt' },
] as const;


const Legend = () => {
  const { windField, setWindField, year } = useAppContext();
  const windFieldAvailable = year >= 2002;
  const [open, setOpen] = useState(false);
  const openPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (year < 2002 && windField) {
      setWindField(false);
    }
  }, [year, windField, setWindField]);

  useLayoutEffect(() => {
    const panel = openPanelRef.current;
    if (!open || !panel) return;
    const rows = panel.querySelectorAll('.settings-row');
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
  }, [open]);

  if (!open) {
    return (
      <Tooltip
        title="Legend"
        placement="bottom"
        arrow
      >
        <div
          className="map-button cursor-pointer"
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <FormatListBulleted className="!text-2xl text-white" />
          </IconButton>
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      ref={openPanelRef}
      className="map-button gap-1"
    >
      <div className="settings-row flex justify-between items-center gap-2 border-b border-white pb-2">
        <span className="text-sm font-semibold  text-white">
          Legend
        </span>
        <IconButton
          size="small"
          className="map-legend-close"
          onClick={() => setOpen(false)}
        >
          <Close className="!text-xl" />
        </IconButton>
      </div>
      <h1 className="settings-row text-sm font-semibold text-white  text-center">Classification</h1>
      <div className="flex flex-col gap-0.5 border-t border-white pt-2">
        {statusItems.map((item) => (
          <div
            key={item.label}
            className="settings-row flex items-center gap-2 rounded-md px-1 py-0.5 "
          >
            <span
              className={`w-3 h-3 shrink-0 rounded-full border border-black ${item.colorClass}`}
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
              <h1 className="text-sm text-white">{item.label}</h1>
              {'windRange' in item && (
                <span className="shrink-0 text-sm text-white">{item.windRange}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {year >= 2002 && <FormGroup className="map-legend-form-group gap-0.5 border-t border-white py-2 w-full text-center">
        <div className="settings-row rounded-lg py-0.5 pr-1 pl-0 ">
          <span className="inline-block w-fit max-w-full">
            <FormControlLabel
              className="map-legend-label"
              disabled={!windFieldAvailable}
              control={
                <Checkbox
                  size="small"
                  className="!text-sky-400 !pl-0 !pr-1 !py-1"
                  checked={windField}
                  disabled={!windFieldAvailable}
                  onChange={(e) => setWindField(e.target.checked)}
                />
              }
              label="Wind Field"
            />
          </span>
        </div>
        <div className="flex flex-col gap-.5 border-t border-white pt-2">
        {windFieldItems.map((item) => (
          <div
            key={item.label}
            className="settings-row flex w-full items-center gap-2 rounded-md px-1 py-0.5"
          >
            <span
              className={`h-3 flex-1 rounded-sm border ${item.swatchClass}`}
            />
            <h1 className="min-w-[3.5rem] text-right text-sm">{item.label}</h1>
          </div>
        ))}
        </div>
      </FormGroup>}
    </div>
  );
};

export default Legend;
