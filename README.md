# Cyclopedia

An open-source educational web app for exploring historical tropical cyclone tracks, intensity, wind fields, and season statistics across seven global basins — from the North Atlantic in 1851 to the present. Track data is derived from joint efforts between international meteorological agencies including the [NHC](https://www.nhc.noaa.gov/) and [JTWC](https://www.metoc.navy.mil/jtwc/) which yielded the  [International Best Track Archive for Climate Stewardship (IBTrACS)](https://www.ncei.noaa.gov/products/international-best-track-archive).

Use Cyclopedia to study how storms moved, intensified, and varied by basin and season. It is built for learning and research exploration, not for live forecasting or emergency decisions.

## What You Can Explore

- **Storm tracks** on a 2D Leaflet map or 3D Cesium globe, with landfall markers and optional wind radii (2002+)
- **Global season view** — load every basin for a selected year and toggle basin visibility on the map
- **Track playback** — step or animate storm positions over time with adjustable speed
- **Intensity over time** — per-storm wind timelines, basin season charts, and multi-decade totals
- **Season metrics** — storm counts, major-hurricane totals, and ACE (Accumulated Cyclone Energy)
- **Multi-basin comparison** across the North Atlantic, Eastern Pacific, Western Pacific, North Indian, South Indian, South Pacific, and South Atlantic
- **Historical context** spanning more than a century of best-track records in a browser-based PWA

## Features

- **Tracking maps** — Leaflet 2D map and Cesium 3D globe with storm polylines, landfall markers, wind-field overlays, and storm focus
- **Playback controls** — play, pause, scrub, and speed up track animation synced to map and globe views
- **Layer panel** — show or hide individual basins on the global year map
- **Intensity charts** — season totals (`TotalsChart`), per-season wind/ACE (`SeasonChart`), and per-storm timelines (`StormChart`)
- **Seven-basin archive** — static JSON served from `public/archive/` with IndexedDB caching for fast repeat visits
- **PWA** — installable progressive web app with service worker and offline-friendly asset caching
- **Responsive layout** — desktop split view (map + charts) and mobile bottom-sheet UI

## Basin Coverage


| Basin           | ID           | Years (available) | Notes                          |
| --------------- | ------------ | ----------------- | ------------------------------ |
| North Atlantic  | `n_atlantic` | 1851–2025         |                                |
| Eastern Pacific | `e_pacific`  | 1876–2025         | Many seasons missing 1877–1948 |
| Western Pacific | `w_pacific`  | 1884–2024         |                                |
| North Indian    | `n_indian`   | 1842–2024         | Many early seasons missing     |
| South Indian    | `s_indian`   | 1848–2025         | 1849, 1850, 1853 missing       |
| South Pacific   | `s_pacific`  | 1897–2025         | 1903, 1904 missing             |
| South Atlantic  | `s_atlantic` | 2004, 2010–2011   | 2005–2009 missing              |


Legacy basin codes (`atl`, `epac`, `wpac`, `ind`, `shem`) are still accepted for cached requests and deep links.

Storm IDs use standard prefixes: `AL` (North Atlantic), `EP`/`CP` (Pacific), `WP`, `IO`, `SI`, `SP`, `SA`.

## Data Sources & Attribution

Cyclopedia track data is derived from the **[International Best Track Archive for Climate Stewardship (IBTrACS)](https://www.ncei.noaa.gov/products/international-best-track-archive)**, maintained by NOAA's [National Centers for Environmental Information (NCEI)](https://www.ncei.noaa.gov/). IBTrACS harmonizes global tropical cyclone best-track records from regional warning centers and research agencies into a single, quality-controlled archive.

Individual basin records trace back to the contributing agencies:


| Basin                         | Primary source                                   | Agency                                                                  |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| North Atlantic (`n_atlantic`) | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [National Hurricane Center (NHC)](https://www.nhc.noaa.gov/)            |
| Eastern Pacific (`e_pacific`) | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [National Hurricane Center (NHC)](https://www.nhc.noaa.gov/)            |
| Western Pacific (`w_pacific`) | JTWC best-track archive                          | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| North Indian (`n_indian`)     | JTWC best-track archive                          | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| South Indian (`s_indian`)     | JTWC best-track archive                          | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| South Pacific (`s_pacific`)   | JTWC best-track archive                          | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| South Atlantic (`s_atlantic`) | JTWC best-track archive                          | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |


NHC is part of the U.S. National Oceanic and Atmospheric Administration (NOAA). Storm tracks, intensity, and wind radii in this app reflect those agencies' published best-track records as consolidated through IBTrACS.

**Cyclopedia is not affiliated with, endorsed by, or operated on behalf of NOAA, NCEI, NHC, or the U.S. Navy.**

### Archive Layout

Storm archives are static JSON files under `public/archive/`, one folder per basin ID:

```
public/archive/
├── n_atlantic/          # 1851.json … 2025.json, totals.json
├── e_pacific/           # 1876.json … 2025.json (gaps), totals.json
├── w_pacific/           # 1884.json … 2024.json, totals.json
├── n_indian/            # 1842.json … 2024.json (gaps), totals.json
├── s_indian/            # 1848.json … 2025.json, totals.json
├── s_pacific/           # 1897.json … 2025.json, totals.json
└── s_atlantic/          # 2004.json, 2010.json, 2011.json, totals.json
```

At runtime these are served from `/archive/{basin}/{year}.json`. Season totals live at `/archive/{basin}/totals.json`. Path resolution and missing-year handling are defined in `libs/basins.ts` (`getArchiveFilePath`, `BASIN_MISSING_YEARS`).

`components/App.tsx` loads every available basin for the selected year via `getYearArchiveCached(year)` in `libs/hurdat.ts`, normalizes fields client-side through `libs/normalizeArchive.ts`, and stores repeat visits in IndexedDB. Derived views:

- `season` — storms in the active basin
- `globalSeason` — all basins for the year
- `mapSeason` — `globalSeason` filtered by `visibleBasins` (layer toggles)

State is shared through `AppContext`; `PlaybackContext` drives track animation from `mapSeason`.

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
node script.js --dry-run                              # Preview all basins
node script.js --basin w_pacific --year 2020 --dry-run # Preview one file
node script.js                                        # Write landfall markers
node script.js --basin n_atlantic,e_pacific           # Specific basins
```

Processes all seven basin folders in `public/archive/`. Landfall points are written as `"record": "L"`; all other points use `"record": null`. Downloads `ne_50m_land.geojson` to `scripts/data/` on first run.

## Application Flow (`App.tsx`)

`components/App.tsx` is the top-level client shell:

1. **Year selection** triggers a parallel fetch of all basin archives for that year (`getYearArchiveCached`).
2. **Basin selection** filters the loaded year into `season` for selectors, charts, and storm pickers.
3. **Layer visibility** (`visibleBasins`) filters which basins appear on the map/globe (`mapSeason`).
4. **View modes** — nav toggles between Tracking Maps (`Tracker`: Leaflet/Cesium, layers, playback) and Intensity Charts (`Charts`: totals, season, and per-storm charts).
5. **Layout** — desktop split view (`Interface` + `Tracker`/`Charts`); mobile map with a bottom-sheet `Interface`.
6. **Providers** — `AppProvider` exposes basin/year/storm/layer state; `PlaybackProvider` syncs animation across map views.

While archives load, `LoadingScreen` is shown until `globalSeason` and the active storm are ready.

## Project Structure

```
Cyclopedia/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, PWA meta, fonts
│   ├── page.tsx                  # Entry page
│   ├── loading.tsx               # Route loading UI
│   ├── globals.css               # Global styles
│   └── components/
│       └── ServiceWorkerRegister.tsx
├── components/                   # React UI
│   ├── App.tsx                   # Main shell, year/basin loading, providers
│   ├── Tracker.tsx               # Map / globe toggle, layers, playback, legend
│   ├── Map.tsx                   # Leaflet 2D map
│   ├── Globe.tsx                 # Cesium 3D globe
│   ├── MapTracks.tsx             # 2D track polylines & markers
│   ├── MapPolylines.tsx          # 2D polyline rendering
│   ├── MapStormFocus.tsx         # Storm focus & popup on map
│   ├── GlobeTracks.tsx           # 3D track entities
│   ├── GlobePolylines.tsx        # 3D polyline rendering
│   ├── WindField.tsx             # Wind radii overlays (34/50/64 kt)
│   ├── Interface.tsx             # Selectors, metrics, mobile sheet
│   ├── Selectors.tsx             # Basin, year, and storm pickers
│   ├── Metrics.tsx               # Storm stats & imagery
│   ├── Charts.tsx                # Desktop charts panel
│   ├── TotalsChart.tsx           # Multi-decade basin totals
│   ├── SeasonChart.tsx           # Season wind / ACE chart
│   ├── StormChart.tsx            # Per-storm intensity timeline
│   ├── Layers.tsx                # Per-basin map visibility toggles
│   ├── Playback.tsx              # Track animation controls
│   ├── Legend.tsx                # Map legend panel
│   ├── LoadingScreen.tsx         # Initial load screen
│   └── hooks/                    # GSAP reveal, mobile sheet, settings panel
├── contexts/
│   ├── AppContext.tsx            # Basin, year, storm, layer, globe state
│   └── PlaybackContext.tsx       # Playback index, speed, direction
├── libs/
│   ├── basins.ts                 # Basin config, year ranges, archive paths
│   ├── hurdat.ts                 # Archive fetch, IndexedDB cache
│   ├── normalizeArchive.ts       # Data normalization
│   ├── calculateACE.ts           # ACE computation
│   ├── mapUtils.ts               # Map helpers, wind radii, popups
│   ├── globeTrackUtils.ts        # Cesium track utilities
│   ├── playback.ts               # Playback timestamp formatting
│   ├── shiftMap.ts               # Dateline-aware map shifting
│   ├── loadCesium.ts             # Cesium dynamic loader
│   └── sum.ts                    # Numeric helpers
├── public/
│   ├── archive/                  # Storm JSON by basin/year (static files)
│   ├── cesium/                   # Cesium static assets (postinstall copy)
│   ├── sw.js                     # Service worker
│   └── manifest.json             # PWA manifest
├── scripts/
│   ├── copy-cesium.mjs           # Copy Cesium assets to public/
│   └── data/                     # Natural Earth land polygons for script.js
```

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Maps** — [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/), [Cesium](https://cesium.com/)
- **Charts** — [Chart.js](https://www.chartjs.org/) / [react-chartjs-2](https://react-chartjs-2.js.org/)
- **UI** — [Material UI](https://mui.com/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/)
- **Storage** — [IndexedDB](https://github.com/jakearchibald/idb) via `idb`

## Contributing

Contributions that improve educational clarity, data handling, accessibility, or documentation are welcome.

1. Fork the repository and create a feature branch
2. Make focused changes with clear commit messages
3. Run `npm run lint` before opening a pull request
4. Describe what you changed and why in the PR

Please preserve IBTrACS, NHC, and JTWC attribution when modifying or reusing track data.

## License

This project is shared as an open educational resource for learning about tropical cyclone history, meteorological datasets, and interactive web mapping.