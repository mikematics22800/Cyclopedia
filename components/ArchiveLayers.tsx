'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import gsap from 'gsap';
import { useAppContext } from '../contexts/AppContext';

const panelClass =
  'flex flex-col gap-2 font-bold text-white rounded-xl w-fit p-3 ' +
  'bg-slate-950/75 backdrop-blur-md border border-white/15 ' +
  'transition-all duration-300 ease-smooth hover:border-white/25';

const ArchiveMapSettings = () => {
  const { windField, setWindField, year } = useAppContext();
  const windFieldAvailable = year >= 2004;
  const [open, setOpen] = useState(false);
  const openPanelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = openPanelRef.current;
    if (!open || !panel) return;
    const rows = panel.querySelectorAll('.archive-map-settings-row');
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
    '&.Mui-disabled .MuiFormControlLabel-label': {
      color: 'rgba(255,255,255,0.92)',
    },
  } as const;

  if (!open) {
    return (
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
        <Tooltip title="Layers" placement="bottom" arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            sx={iconButtonSx}
          >
            <Settings className="!text-2xl text-white" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      ref={openPanelRef}
      className={`${panelClass} min-w-[15rem] max-w-[18rem] gap-1`}
    >
      <div className="archive-map-settings-row flex justify-between items-center gap-2 border-b border-white/10 pb-2 mb-1">
        <span className="text-sm font-bold tracking-wide text-white/95">
          Layers
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

      <FormGroup className="gap-0.5 w-full">
        <div className="archive-map-settings-row rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors">
          <Tooltip
            title={
              windFieldAvailable
                ? ''
                : 'Wind fields unavailable before 2004'
            }
            placement="left"
            arrow
            disableHoverListener={windFieldAvailable}
            disableFocusListener={windFieldAvailable}
            disableTouchListener={windFieldAvailable}
          >
            <span className="block w-full">
              <FormControlLabel
                sx={labelSx}
                disabled={!windFieldAvailable}
                control={
                  <Checkbox
                    size="small"
                    className="!text-sky-400 !p-1"
                    checked={windField}
                    disabled={!windFieldAvailable}
                    onChange={(e) => setWindField(e.target.checked)}
                  />
                }
                label="Wind Field"
              />
            </span>
          </Tooltip>
        </div>
      </FormGroup>
    </div>
  );
};

export default ArchiveMapSettings;
