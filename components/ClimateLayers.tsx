'use client';

import { useState, Dispatch, SetStateAction, useRef, useLayoutEffect } from 'react';
import {
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import gsap from 'gsap';

interface Layers {
  clouds: boolean;
  precip: boolean;
  wind: boolean;
  pressure: boolean;
  temp: boolean;
}

const panelClass =
  'flex flex-col gap-2 font-bold text-white rounded-xl w-fit p-3 ' +
  'bg-slate-950/75 backdrop-blur-md border border-white/15 shadow-panel-sm ' +
  'transition-all duration-300 ease-smooth hover:border-white/25';

const ClimateLayers = ({
  layers,
  setLayers,
}: {
  layers: Layers;
  setLayers: Dispatch<SetStateAction<Layers>>;
}) => {
  const [open, setOpen] = useState(false);
  const openPanelRef = useRef<HTMLDivElement>(null);

  const handleChange = (layer: keyof Layers, value: boolean) => {
    setLayers((prev) => ({ ...prev, [layer]: value }));
  };

  useLayoutEffect(() => {
    const panel = openPanelRef.current;
    if (!open || !panel) return;
    const rows = panel.querySelectorAll('.climate-layer-row');
    const ctx = gsap.context(() => {
      gsap.from(rows, {
        opacity: 0,
        x: -10,
        stagger: 0.04,
        duration: 0.34,
        ease: 'power2.out',
      });
    }, panel);
    return () => ctx.revert();
  }, [open]);

  const iconButtonSx = {
    padding: 0,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
  } as const;

  const labelSx = {
    marginRight: 0,
    marginLeft: 0,
    width: '100%',
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.92)',
    },
  } as const;

  if (!open) {
    return (
      <div
        className={`${panelClass} cursor-pointer hover:shadow-panel`}
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
        <Tooltip title="Climate layers" placement="bottom" arrow>
          <IconButton
            aria-label="Open climate layers"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            sx={iconButtonSx}
          >
            <Settings className="!text-2xl text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      ref={openPanelRef}
      className={`${panelClass} min-w-[15rem] max-w-[18rem] gap-1 shadow-panel`}
    >
      <div className="climate-layer-row flex justify-between items-center gap-2 border-b border-white/10 pb-2 mb-1">
        <span className="text-sm font-bold tracking-wide text-white/95">
          Climate layers
        </span>
        <Tooltip title="Close" placement="left" arrow>
          <IconButton
            aria-label="Close climate layers"
            size="small"
            onClick={() => setOpen(false)}
            sx={{
              color: 'rgba(255,255,255,0.9)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <Close className="!text-xl" />
          </IconButton>
        </Tooltip>
      </div>

      <FormGroup className="gap-0.5 w-full">
        <div className="climate-layer-row rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors">
          <FormControlLabel
            sx={labelSx}
            control={
              <Checkbox
                size="small"
                className="!text-sky-400 !p-1"
                checked={layers.clouds}
                onChange={(e) => handleChange('clouds', e.target.checked)}
              />
            }
            label="Clouds"
          />
        </div>
        <div className="climate-layer-row rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors">
          <FormControlLabel
            sx={labelSx}
            control={
              <Checkbox
                size="small"
                className="!text-sky-400 !p-1"
                checked={layers.precip}
                onChange={(e) => handleChange('precip', e.target.checked)}
              />
            }
            label="Precipitation"
          />
        </div>
        <div className="climate-layer-row rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors">
          <FormControlLabel
            sx={labelSx}
            control={
              <Checkbox
                size="small"
                className="!text-sky-400 !p-1"
                checked={layers.wind}
                onChange={(e) => handleChange('wind', e.target.checked)}
              />
            }
            label="Wind"
          />
        </div>
        <div className="climate-layer-row rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors">
          <FormControlLabel
            sx={labelSx}
            control={
              <Checkbox
                size="small"
                className="!text-sky-400 !p-1"
                checked={layers.pressure}
                onChange={(e) => handleChange('pressure', e.target.checked)}
              />
            }
            label="Sea level pressure"
          />
        </div>
        <div className="climate-layer-row rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors">
          <FormControlLabel
            sx={labelSx}
            control={
              <Checkbox
                size="small"
                className="!text-sky-400 !p-1"
                checked={layers.temp}
                onChange={(e) => handleChange('temp', e.target.checked)}
              />
            }
            label="Temperature"
          />
        </div>
      </FormGroup>
    </div>
  );
};

export default ClimateLayers;
