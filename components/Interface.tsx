'use client';

import { useMemo, useRef, useLayoutEffect, useCallback } from "react";
import gsap from "gsap";
import { useAppContext } from "../contexts/AppContext";
import StormMetrics from "./StormMetrics";
import SeasonMetrics from "./SeasonMetrics";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useGsapReveal } from "./hooks/useGsapReveal";
import SeasonChart from './SeasonChart';
import StormChart from './StormChart';

const SELECTOR_MENU_PAPER = {
  mt: 1,
  borderRadius: "12px",
  bgcolor: "#000",
  border: "2px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "none",
  maxHeight: 280,
  "& .MuiMenuItem-root": {
    borderRadius: "8px",
    mx: 0.5,
    my: 0.2,
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "rgba(248, 250, 252, 0.95)",
  },
  "& .MuiMenuItem-root.Mui-selected": {
    bgcolor: "rgba(34, 211, 238, 0.14)",
    color: "rgb(165, 243, 252)",
  },
  "& .MuiMenuItem-root.Mui-selected:hover": {
    bgcolor: "rgba(34, 211, 238, 0.2)",
  },
  "& .MuiMenuItem-root:hover": {
    bgcolor: "rgba(255, 255, 255, 0.06)",
  },
} as const;

const SELECTOR_MENU_PROPS = {
  PaperProps: { elevation: 0 as const, sx: SELECTOR_MENU_PAPER },
  transitionDuration: 220,
} as const;

const SELECTOR_FIELD_SX = {
  borderRadius: "14px",
  bgcolor: "#000",
  border: "2px solid rgba(255, 255, 255, 0.11)",
  boxShadow: "none",
  transition: "border-color 0.25s ease",
  "&:hover": {
    borderColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: "none",
  },
  "&.Mui-focused": {
    borderColor: "rgba(34, 211, 238, 0.42)",
    boxShadow: "none",
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiSelect-select": {
    py: 0.85,
    px: 1.35,
    pr: "2.25rem !important",
    display: "flex",
    alignItems: "center",
    minHeight: "unset !important",
  },
  "& .MuiSelect-icon": {
    color: "rgba(148, 163, 184, 0.95)",
    right: 8,
    transition: "transform 0.2s ease, color 0.2s ease",
  },
  "&.Mui-focused .MuiSelect-icon": {
    color: "rgba(165, 243, 252, 0.95)",
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    filter: "grayscale(0.2)",
  },
} as const;

function SelectorTrigger({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex flex-col items-start text-left leading-tight">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400/95">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-50">
        {children}
      </span>
    </span>
  );
}

const Interface = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectorsRef = useRef<HTMLDivElement>(null);
  const selectorsAnimatedRef = useRef(false);

  const {
    basin,
    setBasin,
    year,
    setYear,
    stormId,
    setStormId,
    season,
  } = useAppContext();

  const startYear = useMemo(() => basin === 'atl' ? 1850 : 1948, [basin]);
  const years = useMemo(() => new Array(2025 - startYear).fill(0), [startYear]);

  const stormIds = useMemo(() => {
    if (season) {
      return season.map((storm) => storm.id);
    }
    return null;
  }, [season]);

  const stormLabel = useMemo(() => {
    if (!stormIds?.length) return "Loading…";
    if (!stormId) return "—";
    const match = stormIds.find((id) => id === stormId);
    const id = match ?? stormId;
    return id.split("_")[1] ?? id;
  }, [stormIds, stormId]);

  useGsapReveal(containerRef, [basin, year], {
    stagger: 0.065,
    y: 18,
  });

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
    <div className="interface-scroll">
      <div ref={containerRef} className="interface">
        <div className="w-full flex flex-col items-center overflow-hidden gap-2 lg:gap-4 lg:p-8 archive-panel-shell pt-3">
        <div data-gsap-reveal className="drag-handle shrink-0" />
        <div
          data-gsap-reveal
          className="w-full flex flex-col items-center gap-2 lg:gap-4"
        >
        <div ref={selectorsRef} className="selectors">
          <div
            data-selector-chip
            className="selector-chip"
            onPointerEnter={chipPointerEnter}
            onPointerLeave={chipPointerLeave}
          >
            <Select
              size="small"
              value={basin}
              onChange={(e: SelectChangeEvent) => setBasin(e.target.value)}
              IconComponent={KeyboardArrowDown}
              displayEmpty
              MenuProps={SELECTOR_MENU_PROPS}
              sx={SELECTOR_FIELD_SX}
              renderValue={(v) => (
                <SelectorTrigger label="Basin">
                  {v === "atl" ? "Atlantic" : "Pacific"}
                </SelectorTrigger>
              )}
            >
              <MenuItem value="atl">Atlantic</MenuItem>
              <MenuItem value="pac">Pacific</MenuItem>
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
              value={year}
              onChange={(e: SelectChangeEvent<number>) =>
                setYear(Number(e.target.value))
              }
              IconComponent={KeyboardArrowDown}
              MenuProps={SELECTOR_MENU_PROPS}
              sx={SELECTOR_FIELD_SX}
              renderValue={(v) => (
                <SelectorTrigger label="Year">{v}</SelectorTrigger>
              )}
            >
              {years.map((_, index) => {
                const selectedYear = 2025 - index;
                return (
                  <MenuItem key={selectedYear} value={selectedYear}>
                    {selectedYear}
                  </MenuItem>
                );
              })}
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
              value={stormIds?.length ? stormId : ""}
              onChange={(e: SelectChangeEvent) => setStormId(e.target.value)}
              disabled={!stormIds?.length}
              IconComponent={KeyboardArrowDown}
              displayEmpty
              MenuProps={SELECTOR_MENU_PROPS}
              sx={SELECTOR_FIELD_SX}
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
          <SeasonMetrics />
          <div key={stormId} className="w-full flex flex-col items-center">
            <StormMetrics />
          </div>
        </div>
        <div className="lg:hidden w-full p-4">
          <SeasonChart />
          <StormChart />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Interface;
