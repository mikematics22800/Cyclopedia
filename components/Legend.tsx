'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Checkbox,
  FormGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Close, FormatListBulleted } from '@mui/icons-material';
import { useAppContext, useT } from '../contexts/AppContext';
import { useSettingsPanelAnimation } from './hooks/useSettingsPanelAnimation';

const statusItems = [
  { colorClass: 'bg-[dodgerblue]', labelKey: 'tropicalDepression', windKey: 'windLt34' },
  { colorClass: 'bg-[lime]', labelKey: 'tropicalStorm', windKey: 'wind34to63' },
  { colorClass: 'bg-[yellow]', labelKey: 'category1Hurricane', windKey: 'wind64to82' },
  { colorClass: 'bg-[orange]', labelKey: 'category2Hurricane', windKey: 'wind83to95' },
  { colorClass: 'bg-[red]', labelKey: 'category3Hurricane', windKey: 'wind96to112' },
  { colorClass: 'bg-[hotpink]', labelKey: 'category4Hurricane', windKey: 'wind113to136' },
  { colorClass: 'bg-[pink]', labelKey: 'category5Hurricane', windKey: 'windGte137' },
  { colorClass: 'bg-[aqua]', labelKey: 'subtropicalDepression', windKey: 'windLt34' },
  { colorClass: 'bg-[#D0F0C0]', labelKey: 'subtropicalStorm', windKey: 'wind34to63' },
  { colorClass: 'bg-[#7F00FF]', labelKey: 'extratropicalCyclone' },
  { colorClass: 'bg-[lightgray]', labelKey: 'tropicalLow' },
] as const;

const windFieldItems = [
  { labelKey: 'windGte34', swatchClass: 'wind-field-swatch--34kt' },
  { labelKey: 'windGte50', swatchClass: 'wind-field-swatch--50kt' },
  { labelKey: 'windGte64', swatchClass: 'wind-field-swatch--64kt' },
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
  const {
    windField,
    setWindField,
    isolateBasin,
    setIsolateBasin,
    isolateStorm,
    setIsolateStorm,
    year,
  } = useAppContext();
  const translate = useT();
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
      title={translate('legend')}
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
          {translate('legend')}
        </span>
        <IconButton
          size="small"
          className="map-legend-close"
          onClick={() => setOpen(false)}
        >
          <Close className="!text-lg lg:!text-xl" />
        </IconButton>
      </div>
      <div className="flex flex-row items-center justify-between w-full">
        <h1 className={LEGEND_SECTION_HEADER}>{translate('classification')}</h1>
        <h1 className={LEGEND_SECTION_HEADER}>{translate('windSpeed')}</h1>
      </div>
      <div className={LEGEND_SECTION_LIST}>
        {statusItems.map((item) => (
          <div
            key={item.labelKey}
            className="settings-row flex items-center gap-1.5 lg:gap-2 rounded-md px-0.5 lg:px-1 py-0.5"
          >
            <span
              className={`w-2 h-2 lg:w-3 lg:h-3 shrink-0 rounded-full border border-black ${item.colorClass}`}
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2 lg:gap-6">
              <h1 className="text-xs lg:text-sm text-white">{translate(item.labelKey)}</h1>
              {'windKey' in item && (
                <span className="shrink-0 text-xs lg:text-sm text-white">{translate(item.windKey)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {year >= 2002 && (
        <>
          <div className="settings-row flex items-center justify-center gap-1 lg:gap-1.5 border-t border-white pt-1.5 lg:pt-2">
            <h1 className={LEGEND_SECTION_HEADER_TEXT}>{translate('windField')}</h1>
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
                key={item.labelKey}
                className="settings-row flex w-full items-center gap-1.5 lg:gap-2 rounded-md px-0.5 lg:px-1 py-0.5"
              >
                <span
                  className={`h-2 lg:h-3 flex-1 rounded-sm border ${item.swatchClass}`}
                />
                <h1 className="min-w-[2.75rem] lg:min-w-[3.5rem] text-right text-xs lg:text-sm">
                  {translate(item.labelKey)}
                </h1>
              </div>
            ))}
          </div>
        </>
      )}
      <FormGroup
        row
        className="map-legend-form-group settings-row flex !flex-row flex-nowrap items-center justify-between gap-2 w-full border-t border-white pt-1.5 lg:pt-2"
      >
        <div className="flex items-center justify-center gap-1 lg:gap-1.5">
          <h1 className={LEGEND_SECTION_HEADER_TEXT}>{translate('isolateBasin')}</h1>
          <Checkbox
            size="small"
            className="!text-sky-400 !p-0"
            checked={isolateBasin}
            onChange={(e) => setIsolateBasin(e.target.checked)}
            inputProps={{ 'aria-label': translate('isolateSelectedBasin') }}
          />
        </div>
        <div className="flex items-center justify-center gap-1 lg:gap-1.5">
          <h1 className={LEGEND_SECTION_HEADER_TEXT}>{translate('isolateStorm')}</h1>
          <Checkbox
            size="small"
            className="!text-sky-400 !p-0"
            checked={isolateStorm}
            onChange={(e) => setIsolateStorm(e.target.checked)}
            inputProps={{ 'aria-label': translate('isolateSelectedStorm') }}
          />
        </div>
      </FormGroup>
    </div>
  ) : null;

  if (part === 'button') return button;
  if (part === 'panel') return panel;
  return panelVisible ? panel : button;
};

export default Legend;
