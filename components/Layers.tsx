'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import LayersIcon from '@mui/icons-material/Layers';
import { useAppContext } from '../contexts/AppContext';
import { useSettingsPanelAnimation } from './hooks/useSettingsPanelAnimation';
import {
  BASINS,
  getAvailableBasinsForYear,
} from '../libs/basins';

const LAYERS_ITEM_TEXT = 'text-xs lg:text-sm text-white';
const LAYERS_LIST =
  'flex flex-col gap-0.5 lg:gap-0.5';

type LayersProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  part?: 'combined' | 'button' | 'panel';
};

const Layers = ({
  open: controlledOpen,
  onOpenChange,
  part = 'combined',
}: LayersProps) => {
  const {
    year,
    visibleBasins,
    toggleBasinVisibility,
  } = useAppContext();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const openPanelRef = useRef<HTMLDivElement>(null);
  const panelVisible = useSettingsPanelAnimation(
    open,
    openPanelRef,
    part !== 'button',
  );

  const availableBasins = useMemo(
    () =>
      getAvailableBasinsForYear(year).sort((a, b) =>
        BASINS[a].label.localeCompare(BASINS[b].label),
      ),
    [year],
  );

  const onlyOneVisible = visibleBasins.size <= 1;

  const button = (
    <Tooltip title="Layers" placement="bottom" arrow>
      <div
        className={`map-button cursor-pointer${open ? ' map-button--active' : ''}`}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <LayersIcon className="!text-2xl text-white" />
        </IconButton>
      </div>
    </Tooltip>
  );

  const panel = panelVisible ? (
    <div ref={openPanelRef} className="map-button map-legend map-layers w-fit gap-1">
      <div className="settings-row flex justify-between items-center gap-1 lg:gap-2 border-b border-white pb-1.5 lg:pb-2">
        <span className="text-xs lg:text-sm font-semibold text-white">
          Layers
        </span>
        <IconButton
          size="small"
          className="map-legend-close"
          onClick={() => setOpen(false)}
        >
          <Close className="!text-lg lg:!text-xl" />
        </IconButton>
      </div>

      <div className={LAYERS_LIST}>
        {availableBasins.map((id) => {
          const checked = visibleBasins.has(id);
          const disabled = checked && onlyOneVisible;

          return (
            <div
              key={id}
              className="settings-row flex items-center gap-1.5 lg:gap-2 rounded-md px-0.5 lg:px-1 py-0.5"
            >
              <Checkbox
                size="small"
                className="!text-sky-400 !p-0"
                checked={checked}
                disabled={disabled}
                onChange={() => toggleBasinVisibility(id)}
              />
              <h1 className={LAYERS_ITEM_TEXT}>{BASINS[id].label}</h1>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  if (part === 'button') return button;
  if (part === 'panel') return panel;
  return panelVisible ? panel : button;
};

export default Layers;
