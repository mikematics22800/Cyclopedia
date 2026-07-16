'use client';

import { useMemo, useRef, useLayoutEffect, useCallback } from "react";
import gsap from "gsap";
import { useAppContext } from "../contexts/AppContext";
import {
  BASINS,
  getAvailableBasinsForYear,
  getGlobalYears,
  type BasinId,
} from "../libs/basins";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Image from "next/image";

const SELECTOR_MENU_MAX_HEIGHT = 280;

const SELECTOR_MENU_PROPS = {
  PaperProps: { elevation: 0 as const, className: "selector-menu-paper" },
  MenuListProps: {
    sx: {
      maxHeight: SELECTOR_MENU_MAX_HEIGHT,
      overflowY: "auto",
    },
  },
  transitionDuration: 220,
} as const;

function SelectorTrigger({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="selector-trigger">
      <span className="selector-trigger__label">{label}</span>
      <span className="selector-trigger__value">{children}</span>
    </span>
  );
}

const Selectors = () => {
  const selectorsRef = useRef<HTMLDivElement>(null);
  const selectorsAnimatedRef = useRef(false);

  const {
    basin,
    selectBasin,
    year,
    selectYear,
    stormId,
    setStormId,
    season,
  } = useAppContext();

  const years = useMemo(() => [...getGlobalYears()].reverse(), []);

  const availableBasins = useMemo(
    () =>
      getAvailableBasinsForYear(year).sort((a, b) =>
        BASINS[a].label.localeCompare(BASINS[b].label),
      ),
    [year],
  );

  const stormIds = useMemo(
    () => season?.map((storm) => storm.id) ?? null,
    [season],
  );

  const stormLabel = useMemo(() => {
    if (!stormIds?.length) return "Loading…";
    if (!stormId) return "—";
    return stormId.split("_")[1] ?? stormId;
  }, [stormIds, stormId]);

  useLayoutEffect(() => {
    const root = selectorsRef.current;
    if (!root) return;

    const chips = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-selector-chip]")
    );
    if (chips.length === 0) return;

    const ctx = gsap.context(() => {
      const firstPass = !selectorsAnimatedRef.current;
      selectorsAnimatedRef.current = true;

      if (firstPass) {
        gsap.fromTo(
          chips,
          { opacity: 0, y: 18, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.52,
            stagger: 0.095,
            ease: "power3.out",
            delay: 0.06,
          }
        );
      } else {
        gsap.fromTo(
          chips,
          { scale: 0.98, opacity: 0.72 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.36,
            stagger: 0.055,
            ease: "power3.out",
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [basin, year, stormIds]);

  const chipPointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    gsap.killTweensOf(el);
    gsap.to(el, { scale: 1.02, duration: 0.38, ease: "power2.out" });
  }, []);

  const chipPointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    gsap.killTweensOf(el);
    gsap.to(el, { scale: 1, duration: 0.45, ease: "power3.out" });
  }, []);

  return (
    <div ref={selectorsRef} className="selectors">
      <div
        data-selector-chip
        className="selector-chip"
        onPointerEnter={chipPointerEnter}
        onPointerLeave={chipPointerLeave}
      >
        <Select
          size="small"
          className="selector"
          value={year}
          onChange={(e: SelectChangeEvent<number>) =>
            selectYear(Number(e.target.value))
          }
          IconComponent={KeyboardArrowDown}
          MenuProps={SELECTOR_MENU_PROPS}
          renderValue={(v) => (
            <SelectorTrigger label="Year">{v}</SelectorTrigger>
          )}
        >
          {years.map((selectedYear) => (
            <MenuItem key={selectedYear} value={selectedYear}>
              {selectedYear}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div
        data-selector-chip
        className="selector-chip"
        onPointerEnter={chipPointerEnter}
        onPointerLeave={chipPointerLeave}
      >
        <Select
          size="small"
          className="selector"
          value={basin}
          onChange={(e: SelectChangeEvent) => selectBasin(e.target.value)}
          IconComponent={KeyboardArrowDown}
          displayEmpty
          MenuProps={SELECTOR_MENU_PROPS}
          renderValue={(v) => (
            <SelectorTrigger label="Basin">
              {BASINS[v as BasinId]?.label ?? v}
            </SelectorTrigger>
          )}
        >
          {availableBasins.map((id) => (
            <MenuItem key={id} value={id}>
              {BASINS[id].label}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div
        data-selector-chip
        className="selector-chip"
        onPointerEnter={chipPointerEnter}
        onPointerLeave={chipPointerLeave}
      >
        <Select
          size="small"
          className="selector"
          value={stormIds?.length ? stormId : ""}
          onChange={(e: SelectChangeEvent) => setStormId(e.target.value)}
          disabled={!stormIds?.length}
          IconComponent={KeyboardArrowDown}
          displayEmpty
          MenuProps={SELECTOR_MENU_PROPS}
          renderValue={() => (
            <SelectorTrigger label="Storm">{stormLabel}</SelectorTrigger>
          )}
        >
          {stormIds?.map((id) => {
            const name = id.split("_")[1];
            return (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            );
          })}
        </Select>
      </div>
    </div>
  );
};

export default Selectors;
