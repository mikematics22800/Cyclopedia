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

const panelClass =
  'inline-flex flex-col gap-2 font-semibold text-white rounded-xl w-max max-w-[min(18rem,calc(100vw-2rem))] p-3 ' +
  'bg-slate-950/75 backdrop-blur-md border border-white/15 ' +
  'transition-all duration-300 ease-smooth hover:border-white/25';

const statusItems = [
  { colorClass: 'bg-[dodgerblue]', label: 'Tropical Depression' },
  { colorClass: 'bg-[lime]', label: 'Tropical Storm' },
  { colorClass: 'bg-[yellow]', label: 'Category 1 Hurricane' },
  { colorClass: 'bg-[orange]', label: 'Category 2 Hurricane' },
  { colorClass: 'bg-[red]', label: 'Category 3 Hurricane' },
  { colorClass: 'bg-[hotpink]', label: 'Category 4 Hurricane' },
  { colorClass: 'bg-[pink]', label: 'Category 5 Hurricane' },
  { colorClass: 'bg-[aqua]', label: 'Subtropical Depression' },
  { colorClass: 'bg-[#D0F0C0]', label: 'Subtropical Storm' },
  { colorClass: 'bg-[#7F00FF]', label: 'Extratropical Cyclone' },
  { colorClass: 'bg-[gray]', label: 'Tropical Wave' },
  { colorClass: 'bg-[lightgray]', label: 'Tropical Disturbance' },
  { colorClass: 'bg-white', label: 'Tropical Low' },
] as const;

const windFieldItems = [
  {
    label: '≥34kt',
    fillColor: 'rgba(255, 255, 0, 0.45)',
    outlineColor: 'rgba(255, 255, 0, 0.95)',
  },
  {
    label: '≥50kt',
    fillColor: 'rgba(255, 165, 0, 0.45)',
    outlineColor: 'rgba(255, 165, 0, 0.95)',
  },
  {
    label: '≥64kt',
    fillColor: 'rgba(255, 0, 0, 0.45)',
    outlineColor: 'rgba(255, 0, 0, 0.95)',
  },
] as const;


const MapLegend = () => {
  const { windField, setWindField, year } = useAppContext();
  const windFieldAvailable = year >= 2004;
  const [open, setOpen] = useState(false);
  const openPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (year < 2004 && windField) {
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

  const iconButtonSx = {
    padding: 0,
  } as const;

  const formGroupSx = {
    margin: 0,
    padding: 0,
    paddingLeft: 0,
    marginLeft: 0,
  } as const;

  const labelSx = {
    marginRight: 0,
    marginLeft: 0,
    paddingLeft: 0,
    width: 'fit-content',
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.92)',
    },
    '&.Mui-disabled .MuiFormControlLabel-label': {
      color: 'rgba(255,255,255,0.92)',
    },
  } as const;

  if (!open) {
    return (
      <Tooltip
        title="Legend"
        placement="bottom"
        arrow
      >
        <div
          className={`${panelClass} cursor-pointer`}
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
            sx={iconButtonSx}
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
      className={`${panelClass} gap-1`}
    >
      <div className="settings-row flex justify-between items-center gap-2 border-b border-white pb-2">
        <span className="text-sm font-semibold  text-white">
          Legend
        </span>
        <IconButton
          size="small"
          onClick={() => setOpen(false)}
          sx={{
            color: 'rgba(255,255,255,0.9)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
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
              className={`w-3 h-3 rounded-full border border-black ${item.colorClass}`}
            />
            <h1 className="text-sm">{item.label}</h1>
          </div>
        ))}
      </div>
      {year >= 2004 && <FormGroup className="gap-0.5 border-t border-white py-2 w-full text-center" sx={formGroupSx}>
        <div className="settings-row rounded-lg py-0.5 pr-1 pl-0 ">
          <span className="inline-block w-fit max-w-full">
            <FormControlLabel
              sx={labelSx}
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
              className="h-3 flex-1 rounded-sm border"
              style={{
                backgroundColor: item.fillColor,
                borderColor: item.outlineColor,
              }}
            />
            <h1 className="min-w-[3.5rem] text-right text-sm">{item.label}</h1>
          </div>
        ))}
        </div>
      </FormGroup>}
    </div>
  );
};

export default MapLegend;
