# Cyclopedia

Interactive historical tropical cyclone explorer. Browse storm tracks, intensity charts, wind fields, and season statistics across five global basins — from the Atlantic in 1851 to the present.

## Features

- **Tracking maps** — Leaflet 2D map and Cesium 3D globe with storm track polylines, landfall markers, and optional wind radii (2002+)
- **Intensity charts** — Season totals, per-storm wind timelines, and ACE (Accumulated Cyclone Energy) metrics
- **Multi-basin support** — Atlantic, Eastern Pacific, Western Pacific, North Indian Ocean, and Southern Hemisphere
- **Historical archive** — Decades of best-track data served as static JSON with IndexedDB caching for fast repeat visits
- **PWA** — Installable progressive web app with service worker and offline-friendly asset caching
- **Responsive layout** — Desktop split view and mobile bottom sheet UI

## Basins & Coverage

| Basin | Code | Years |
|-------|------|-------|
| Atlantic | `atl` | 1851–2025 |
| Eastern Pacific | `epac` | 1949–2025 |
| Western Pacific | `wpac` | 1945–2024 |
| North Indian Ocean | `ind` | 1945–2024 (1958 missing) |
| Southern Hemisphere | `shem` | 1945–2024 |

Storm IDs use standard prefixes: `AL` (Atlantic), `EP`/`CP` (Pacific), `WP`, `IO`, `SH`.

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Maps** — [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/), [Cesium](https://cesium.com/)
- **Charts** — [Chart.js](https://www.chartjs.org/) / [react-chartjs-2](https://react-chartjs-2.js.org/)
- **UI** — [Material UI](https://mui.com/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/)
- **Storage** — [IndexedDB](https://github.com/jakearchibald/idb) via `idb`
- **Deploy** — [Netlify](https://www.netlify.com/) with `@netlify/plugin-nextjs`

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`postinstall` copies Cesium assets into `public/`. Production builds run the same copy step automatically.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

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
│   ├── hurdat.ts           # Archive fetch, IndexedDB cache
│   ├── calculateACE.ts     # ACE computation
│   ├── normalizeArchive.ts # Data normalization
│   └── mapUtils.ts         # Map helpers
├── public/
│   ├── archive/            # Storm JSON by basin/year (static files)
│   ├── sw.js               # Service worker
│   └── manifest.json       # PWA manifest
├── scripts/
│   └── copy-cesium.mjs     # Copy Cesium static assets
└── script.js               # Landfall detection utility
```

## Data Format

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

## Landfall Detection

`script.js` annotates archive files with landfall markers using Natural Earth land polygons:

```bash
node script.js --dry-run   # Preview changes
node script.js               # Write landfall markers to archive JSON
```

Processes `wpac`, `shem`, and `ind` basins. Downloads `ne_50m_land.geojson` to `scripts/data/` on first run.

## Archive Data

Storm archives are static JSON files served from `public/archive/` at `/archive/{basin}/{year}.json`. The app fetches them directly and normalizes fields client-side via `libs/normalizeArchive.ts`. Repeat visits are accelerated with IndexedDB caching in `libs/hurdat.ts`.

Season totals are available at `/archive/{basin}/totals.json`.

## Deployment

Configured for Netlify (`netlify.toml`):

```bash
npm run build
```

Uses Node 22 and `@netlify/plugin-nextjs`. Archive JSON is served with long-lived cache headers; the service worker enables offline access to cached assets.

## License

Private project.
