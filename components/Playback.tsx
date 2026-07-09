'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Close } from '@mui/icons-material';
import { IconButton, Slider, Tooltip } from '@mui/material';
import gsap from 'gsap';
import { useAppContext } from '../contexts/AppContext';
import { usePlaybackContext } from '../contexts/PlaybackContext';
import { formatPlaybackTimestamp } from '../libs/playback';

const SPEEDS = [1, 2, 4, 8, 16] as const;
const BASE_INTERVAL_MS = 600;

const Playback = () => {
  const {
    timestamps,
    playbackIndex,
    playbackTimestamp,
    setPlaybackIndex,
    playing,
    setPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    playbackForward,
    setPlaybackForward,
    stepPlayback,
    togglePlayback,
  } = usePlaybackContext();

  const [open, setOpen] = useState(false);
  const openPanelRef = useRef<HTMLDivElement>(null);

  const sliderValue = playbackIndex ?? Math.max(0, timestamps.length - 1);
  const displayTimestamp =
    playbackTimestamp ?? timestamps[timestamps.length - 1] ?? null;
  const disabled = timestamps.length === 0;

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

  useEffect(() => {
    if (!playing || timestamps.length === 0) return;

    const timer = window.setInterval(() => {
      setPlaybackIndex((current) => {
        const index = current ?? 0;
        const next = playbackForward ? index + 1 : index - 1;

        if (next < 0 || next >= timestamps.length) {
          setPlaying(false);
          return playbackForward ? timestamps.length - 1 : 0;
        }

        return next;
      });
    }, BASE_INTERVAL_MS / playbackSpeed);

    return () => window.clearInterval(timer);
  }, [playing, playbackSpeed, playbackForward, timestamps.length, setPlaybackIndex, setPlaying]);

  if (!open) {
    return (
      <Tooltip title="Playback" placement="bottom" arrow>
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
            <PlayCircleIcon className="!text-2xl text-white" />
          </IconButton>
        </div>
      </Tooltip>
    );
  }

  return (
    <div ref={openPanelRef} className="map-button map-legend gap-1">
      <div className="settings-row flex justify-between items-center gap-1 lg:gap-2 border-b border-white pb-1.5 lg:pb-2">
        <span className="text-xs lg:text-sm font-semibold text-white">Playback</span>
        <IconButton
          size="small"
          className="map-legend-close"
          onClick={() => setOpen(false)}
        >
          <Close className="!text-lg lg:!text-xl" />
        </IconButton>
      </div>

      <p className="settings-row text-xs lg:text-sm text-white text-center">
        {displayTimestamp ? formatPlaybackTimestamp(displayTimestamp) : 'No track data'}
      </p>

      <div className="settings-row px-0.5 lg:px-1">
        <Slider
          size="small"
          min={0}
          max={Math.max(0, timestamps.length - 1)}
          value={sliderValue}
          disabled={disabled}
          onChange={(_, value) => {
            setPlaying(false);
            setPlaybackIndex(Array.isArray(value) ? value[0] : value);
          }}
          sx={{
            color: 'rgb(56 189 248)',
            padding: '4px 0',
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
            '& .MuiSlider-rail': {
              opacity: 0.35,
            },
          }}
        />
      </div>

      <div className="settings-row flex items-center justify-center gap-1 lg:gap-2 border-t border-white pt-1.5 lg:pt-2">
        <Tooltip title="Step backward" placement="bottom" arrow>
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => {
                setPlaybackForward(false);
                stepPlayback(-1);
              }}
            >
              <FastRewindIcon className="!text-xl lg:!text-2xl text-white" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={playing ? 'Pause' : 'Play'} placement="bottom" arrow>
          <span>
            <IconButton size="small" disabled={disabled} onClick={togglePlayback}>
              {playing ? (
                <PauseIcon className="!text-xl lg:!text-2xl text-white" />
              ) : (
                <PlayArrowIcon className="!text-xl lg:!text-2xl text-white" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Step forward" placement="bottom" arrow>
          <span>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => {
                setPlaybackForward(true);
                stepPlayback(1);
              }}
            >
              <FastForwardIcon className="!text-xl lg:!text-2xl text-white" />
            </IconButton>
          </span>
        </Tooltip>
      </div>

      <div className="settings-row flex flex-wrap justify-center gap-1 border-t border-white pt-1.5 lg:pt-2">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            disabled={disabled}
            className={`rounded-md px-2 py-0.5 text-xs lg:text-sm font-semibold transition-colors ${
              playbackSpeed === speed
                ? 'bg-sky-400 text-slate-950'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            onClick={() => setPlaybackSpeed(speed)}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default Playback;
