'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Checkbox,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Close, FormatListBulleted } from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { useSettingsPanelAnimation } from './hooks/useSettingsPanelAnimation';

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

const LEGEND_SECTION_HEADER_TEXT =
  'text-xs lg:text-sm font-semibold text-white text-center m-0';
const LEGEND_SECTION_HEADER = `settings-row ${LEGEND_SECTION_HEADER_TEXT}`;
const LEGEND_SECTION_LIST =
  'flex flex-col gap-0.5 border-t border-white pt-1.5 lg:pt-2 lg:gap-0.5';

type LegendProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  part?: 'combined' | 'button' | 'panel';
};

const Legend = ({
  open: controlledOpen,
  onOpenChange,
  part = 'combined',
}: LegendProps) => {
  const { windField, setWindField, year } = useAppContext();
  const windFieldAvailable = year >= 2002;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const openPanelRef = useRef<HTMLDivElement>(null);
  const panelVisible = useSettingsPanelAnimation(
    open,
    openPanelRef,
    part !== 'button'
  );

  useEffect(() => {
    if (part === 'panel') return;
    if (year < 2002 && windField) {
      setWindField(false);
    }
  }, [part, year, windField, setWindField]);

  const button = (
    <Tooltip
      title="Legend"
      placement="bottom"
      arrow
    >
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
          <FormatListBulleted className="!text-2xl text-white" />
        </IconButton>
      </div>
    </Tooltip>
  );

  const panel = panelVisible ? (
    <div
      ref={openPanelRef}
      className="map-button map-legend gap-1"
    >
      <div className="settings-row flex justify-between items-center gap-1 lg:gap-2 border-b border-white pb-1.5 lg:pb-2">
        <span className="text-xs lg:text-sm font-semibold text-white">
          Legend
        </span>
        <IconButton
          size="small"
          className="map-legend-close"
          onClick={() => setOpen(false)}
        >
          <Close className="!text-lg lg:!text-xl" />
        </IconButton>
      </div>
      <h1 className={LEGEND_SECTION_HEADER}>Classification</h1>
      <div className={LEGEND_SECTION_LIST}>
        {statusItems.map((item) => (
          <div
            key={item.label}
            className="settings-row flex items-center gap-1.5 lg:gap-2 rounded-md px-0.5 lg:px-1 py-0.5"
          >
            <span
              className={`w-2 h-2 lg:w-3 lg:h-3 shrink-0 rounded-full border border-black ${item.colorClass}`}
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2 lg:gap-6">
              <h1 className="text-xs lg:text-sm text-white">{item.label}</h1>
              {'windRange' in item && (
                <span className="shrink-0 text-xs lg:text-sm text-white">{item.windRange}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {year >= 2002 && (
        <>
          <div className="settings-row flex items-center justify-center gap-1 lg:gap-1.5 border-t border-white pt-1.5 lg:pt-2">
            <h1 className={LEGEND_SECTION_HEADER_TEXT}>Wind Field</h1>
            <Checkbox
              size="small"
              className="!text-sky-400 !p-0"
              checked={windField}
              disabled={!windFieldAvailable}
              onChange={(e) => setWindField(e.target.checked)}
            />
          </div>
          <div className={LEGEND_SECTION_LIST}>
            {windFieldItems.map((item) => (
              <div
                key={item.label}
                className="settings-row flex w-full items-center gap-1.5 lg:gap-2 rounded-md px-0.5 lg:px-1 py-0.5"
              >
                <span
                  className={`h-2 lg:h-3 flex-1 rounded-sm border ${item.swatchClass}`}
                />
                <h1 className="min-w-[2.75rem] lg:min-w-[3.5rem] text-right text-xs lg:text-sm">
                  {item.label}
                </h1>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  ) : null;

  if (part === 'button') return button;
  if (part === 'panel') return panel;
  return panelVisible ? panel : button;
};

export default Legend;
