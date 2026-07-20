# Cyclopedia

An open-source educational web app for exploring historical tropical cyclone tracks, intensity, wind fields, and season statistics across five global basins — from the Atlantic in 1851 to the present.

Use Cyclopedia to study how storms moved, intensified, and varied by basin and season. It is built for learning and research exploration, not for live forecasting or emergency decisions.

> **Not for operational use.** For current storm information, consult official sources such as [NHC](https://www.nhc.noaa.gov/) and [JTWC](https://www.metoc.navy.mil/jtwc/).

## What You Can Explore

- **Storm tracks** on a 2D Leaflet map or 3D Cesium globe, with landfall markers and optional wind radii (2002+)
- **Intensity over time** via per-storm wind timelines and basin season charts
- **Season metrics** including storm counts, major-hurricane totals, and ACE (Accumulated Cyclone Energy)
- **Multi-basin comparison** across the Atlantic, Eastern Pacific, Western Pacific, North Indian Ocean, and Southern Hemisphere
- **Historical context** spanning more than a century of best-track records in a browser-based PWA

## Features

- **Tracking maps** — Leaflet 2D map and Cesium 3D globe with storm track polylines, landfall markers, and optional wind radii (2002+)
- **Intensity charts** — Season totals, per-storm wind timelines, and ACE metrics
- **Multi-basin support** — Five global basins with basin/year selectors
- **Historical archive** — Decades of best-track data served as static JSON from `public/archive/`
- **PWA** — Installable progressive web app with service worker and offline-friendly asset caching
- **Responsive layout** — Desktop split view and mobile bottom sheet UI

## Basin Coverage

| Basin | Code | Years |
|-------|------|-------|
| Atlantic | `atl` | 1851–2025 |
| Eastern Pacific | `epac` | 1949–2025 |
| Western Pacific | `wpac` | 1945–2024 |
| North Indian Ocean | `ind` | 1945–2024 (1958 missing) |
| Southern Hemisphere | `shem` | 1945–2024 |

Storm IDs use standard prefixes: `AL` (Atlantic), `EP`/`CP` (Pacific), `WP`, `IO`, `SH`.

## Data Sources & Attribution

Track datasets are derived from official best-track archives maintained by:

| Basin | Source | Agency |
|-------|--------|--------|
| Atlantic (`atl`) | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [National Hurricane Center (NHC)](https://www.nhc.noaa.gov/) |
| Eastern Pacific (`epac`) | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [National Hurricane Center (NHC)](https://www.nhc.noaa.gov/) |
| Western Pacific (`wpac`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| North Indian Ocean (`ind`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| Southern Hemisphere (`shem`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |

NHC is part of the U.S. National Oceanic and Atmospheric Administration (NOAA). Storm tracks, intensity, and wind radii in this app reflect those agencies' published best-track records.

**Cyclopedia is not affiliated with, endorsed by, or operated on behalf of NOAA, NHC, or the U.S. Navy.**

### Archive Layout

Storm archives are static JSON files served from `public/archive/` at `/archive/{basin}/{year}.json`. The app fetches them directly at runtime.

Season totals are available at `/archive/{basin}/totals.json`.

### Data Format

Each archive file (`public/archive/{basin}/{year}.json`) is an array of storm objects:

```json
{
  "id": "AL011851_One",
  "retired": false,
  "cost_usd": 0,
  "dead_or_missing": 1,
  "data": [
    {
      "date": "18510625",
      "time_utc": "0000",
      "status": "HU",
      "max_wind_kt": 80,
      "min_pressure_mb": null,
      "lat": 28,
      "lng": -94.8,
      "record": "L",
      "34kt_wind_nm": { "ne": 0, "se": 0, "sw": 0, "nw": 0 }
    }
  ]
}
```

- `record: "L"` marks a landfall point
- Wind radii fields (`34kt_wind_nm`, `50kt_wind_nm`, `64kt_wind_nm`) are available from 2002 onward
- `status` uses standard NHC codes (e.g. `TD`, `TS`, `HU`)

### Landfall Detection

`script.js` annotates archive files with landfall markers using Natural Earth land polygons:

```bash
node script.js --dry-run   # Preview changes
node script.js             # Write landfall markers to archive JSON
```

Processes `wpac`, `shem`, and `ind` basins. Downloads `ne_50m_land.geojson` to `scripts/data/` on first run.

## Project Structure

```
Cyclopedia/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout, PWA meta, service worker
│   └── page.tsx
├── components/             # React UI
│   ├── App.tsx             # Main app shell & state
│   ├── Tracker.tsx         # Map / globe toggle
│   ├── Map.tsx             # Leaflet 2D map
│   ├── Globe.tsx           # Cesium 3D globe
│   ├── Interface.tsx       # Selectors, metrics, charts panel
│   ├── Charts.tsx          # Desktop intensity charts view
│   └── hooks/              # GSAP reveal, mobile sheet drag
├── contexts/
│   └── AppContext.tsx      # Shared app state
├── libs/
│   ├── basins.ts           # Basin config & year ranges
│   ├── hurdat.ts           # Archive fetch & storm helpers
│   ├── calculateACE.ts     # ACE computation
│   ├── mapUtils.ts         # Map helpers
│   ├── playback.ts         # Season playback scheduling
│   ├── globeTrackUtils.ts  # Cesium track rendering
│   ├── loadCesium.ts       # Cesium lazy loader
│   ├── shiftMap.ts         # Leaflet dateline shift hook
│   └── sum.ts              # Numeric aggregation
├── public/
│   ├── archive/            # Storm JSON by basin/year (static files)
│   ├── sw.js               # Service worker
│   └── manifest.json       # PWA manifest
├── scripts/
│   └── copy-cesium.mjs     # Copy Cesium static assets
└── script.js               # Landfall detection utility
```

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Maps** — [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/), [Cesium](https://cesium.com/)
- **Charts** — [Chart.js](https://www.chartjs.org/) / [react-chartjs-2](https://react-chartjs-2.js.org/)
- **UI** — [Material UI](https://mui.com/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/)

## Contributing

Contributions that improve educational clarity, data handling, accessibility, or documentation are welcome.

1. Fork the repository and create a feature branch
2. Make focused changes with clear commit messages
3. Run `npm run lint` before opening a pull request
4. Describe what you changed and why in the PR

Please preserve NHC and JTWC attribution when modifying or reusing track data.

## License

This project is shared as an open educational resource for learning about tropical cyclone history, meteorological datasets, and interactive web mapping.
