'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { Storm } from '../libs/hurdat';
import {
  buildPlaybackSchedule,
  type PlaybackSchedule,
  visiblePointCount,
} from '../libs/playback';

interface PlaybackContextType {
  schedule: PlaybackSchedule;
  timestamps: number[];
  playbackIndex: number | null;
  playbackTimestamp: number | null;
  setPlaybackIndex: Dispatch<SetStateAction<number | null>>;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  playbackForward: boolean;
  setPlaybackForward: (forward: boolean) => void;
  stepPlayback: (delta: number) => void;
  togglePlayback: () => void;
  getVisiblePointCount: (stormId: string) => number;
}

const emptySchedule: PlaybackSchedule = {
  timestamps: [],
  stormPointTimestamps: new Map(),
};

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const usePlaybackContext = () => {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlaybackContext must be used within a PlaybackProvider');
  }
  return context;
};

interface PlaybackProviderProps {
  children: ReactNode;
  globalSeason: Storm[] | null;
  year: number;
}

export const PlaybackProvider = ({ children, globalSeason, year }: PlaybackProviderProps) => {
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackForward, setPlaybackForward] = useState(true);

  const schedule = useMemo(
    () => (globalSeason ? buildPlaybackSchedule(globalSeason) : emptySchedule),
    [globalSeason],
  );

  const { timestamps } = schedule;

  const playbackTimestamp = useMemo(() => {
    if (playbackIndex === null || timestamps.length === 0) return null;
    return timestamps[Math.min(playbackIndex, timestamps.length - 1)] ?? null;
  }, [playbackIndex, timestamps]);

  const stepPlayback = useCallback(
    (delta: number) => {
      setPlaybackIndex((current) => {
        if (timestamps.length === 0) return null;
        const start = current ?? timestamps.length - 1;
        const next = start + delta;
        return Math.max(0, Math.min(timestamps.length - 1, next));
      });
    },
    [timestamps],
  );

  const togglePlayback = useCallback(() => {
    if (timestamps.length === 0) return;

    setPlaying((current) => {
      if (!current) {
        setPlaybackIndex((index) => (index === null ? 0 : index));
      }
      return !current;
    });
  }, [timestamps.length]);

  const getVisiblePointCount = useCallback(
    (stormId: string) => {
      const pointTimestamps = schedule.stormPointTimestamps.get(stormId);
      if (!pointTimestamps) return 0;
      return visiblePointCount(pointTimestamps, playbackTimestamp);
    },
    [schedule.stormPointTimestamps, playbackTimestamp],
  );

  useEffect(() => {
    setPlaybackIndex(null);
    setPlaying(false);
  }, [year]);

  const value = useMemo(
    () => ({
      schedule,
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
      getVisiblePointCount,
    }),
    [
      schedule,
      timestamps,
      playbackIndex,
      playbackTimestamp,
      playing,
      playbackSpeed,
      playbackForward,
      stepPlayback,
      togglePlayback,
      getVisiblePointCount,
    ],
  );

  return (
    <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
  );
};
