# Cyclopedia

An interactive web app for exploring historical Atlantic and eastern Pacific tropical cyclone seasons. Browse storm tracks on a 2D map or 3D globe, inspect season and storm metrics, and visualize intensity with Chart.js—all backed by a local archive of structured storm data from 1851 through present day.

![Cyclopedia](public/cyclone.png)

## Features

### Storm tracking
- **2D map** — Leaflet with OpenStreetMap tiles, color-coded track points by classification, landfall markers, and clickable popups
- **3D globe** — CesiumJS globe with the same track data, wind radii overlays, and interactive entity popups
- **Toggle views** — Switch between map and globe from the tracker controls

### Data exploration
- **Basin selector** — Atlantic (`atl`) or eastern Pacific (`pac`)
- **Year selector** — Atlantic: 1850–2025; Pacific: 1949–2025
- **Storm selector** — Pick any storm in the loaded season
- **Season metrics** — Tropical cyclone count, hurricanes, major hurricanes, total ACE, landfalls, fatalities, and economic cost
- **Storm metrics** — Peak wind, minimum pressure, ACE, landfalls, duration, cost, fatalities, and NHC Tropical Cyclone Report links (1995+)

### Visualizations
- **Storm Tracks view** — Full-screen map/globe with legend and optional wind field overlay
- **Intensity Charts view** — Season-wide bar chart (max wind + ACE per storm) and per-storm intensity timeline
- **Wind field overlay** — 34/50/64 kt wind radii on map and globe (2004+ seasons only)

### UX and platform
- **Responsive layout** — Desktop split view (sidebar + map); mobile bottom sheet with drag-to-expand
- **Animations** — GSAP transitions for selectors, metrics, and panels
- **PWA** — Web app manifest, service worker, and portrait orientation lock on supported devices
- **Client caching** — Season data cached in `localStorage` after first fetch

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS, Emotion, MUI components |
| 2D mapping | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| 3D globe | [CesiumJS](https://cesium.com/platform/cesiumjs/) |
| Charts | [Chart.js](https://www.chartjs.org/) + react-chartjs-2 |
| Animation | [GSAP](https://gsap.com/) |
| Deployment | [Netlify](https://www.netlify.com/) (`@netlify/plugin-nextjs`) |

## Getting started

### Prerequisites

- **Node.js 20** (matches Netlify build environment)
- **npm**

### Install and run

```bash
git clone https://github.com/mikematics22800/Cyclopedia.git
cd Cyclopedia
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `postinstall` script copies Cesium static assets into `public/cesium/` (required for the 3D globe). This also runs automatically during `npm run build`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (webpack mode) |
| `npm run build` | Copy Cesium assets and produce production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

## Project structure

```
Cyclopedia/
├── app/                    # Next.js App Router
│   ├── api/archive/        # REST API for season JSON
│   ├── layout.tsx          # Root layout, fonts, PWA meta
│   ├── page.tsx            # Entry page
│   └── globals.css         # Global styles
├── archive/                # Storm season data (JSON)
│   ├── atl/{year}/         # Atlantic seasons (1850–2025)
│   └── pac/{year}/         # Pacific seasons (1949–2025)
├── components/             # React UI
│   ├── App.tsx             # Root app state and layout
│   ├── Tracker.tsx         # Map/globe container
│   ├── Map.tsx             # Leaflet map
│   ├── Globe.tsx           # Cesium globe
│   ├── Interface.tsx       # Metrics sidebar / mobile sheet
│   ├── Selectors.tsx       # Basin, year, storm pickers
│   ├── Metrics.tsx         # Season and storm statistics
│   ├── Charts.tsx          # Intensity chart panel
│   ├── Tracks.tsx          # Storm track rendering (Leaflet)
│   ├── WindField.tsx       # Wind radii overlay (Leaflet)
│   └── hooks/              # GSAP reveal, mobile sheet drag
├── contexts/
│   └── AppContext.tsx      # Shared application state
├── libs/
│   ├── hurdat.ts           # Archive fetch client + types
│   ├── calculateACE.ts     # ACE calculations (NHC formula)
│   ├── mapUtils.ts         # Status colors, popups, formatting
│   └── loadCesium.ts       # Dynamic Cesium loader
├── public/                 # Static assets, manifest, service worker
├── scripts/
│   └── copy-cesium.mjs     # Copies Cesium build to public/
└── netlify.toml            # Netlify deployment config
```

## Data

### Archive layout

Season data lives under `archive/{basin}/{year}/{year}.json`:

- **`atl`** — 175 seasons (1850–2025)
- **`pac`** — 77 seasons (1949–2025)

Each file is a JSON array of storm objects. Track points follow a HURDAT-style schema with position, intensity, wind radii (where available), and landfall records.

### Storm object schema

```json
{
  "id": "AL012024_Alberto",
  "dead_or_missing": 5,
  "cost_usd": 265000000,
  "retired": false,
  "data": [
    {
      "date": "20240617",
      "time_utc": "1800",
      "record": "",
      "status": "DB",
      "lat": 19.9,
      "lng": -92.7,
      "max_wind_kt": 35,
      "min_pressure_mb": 1001,
      "34kt_wind_nm": { "ne": 250, "se": 0, "sw": 0, "nw": 0 },
      "50kt_wind_nm": { "ne": 0, "se": 0, "sw": 0, "nw": 0 },
      "64kt_wind_nm": { "ne": 0, "se": 0, "sw": 0, "nw": 0 }
    }
  ]
}
```

| Field | Description |
| --- | --- |
| `id` | Storm identifier (`{basin}{number}{year}_{name}`) |
| `status` | Classification code (e.g. `TD`, `TS`, `HU`, `SS`, `EX`) |
| `record` | `"L"` marks a landfall point |
| `max_wind_kt` | Maximum sustained wind (knots) |
| `min_pressure_mb` | Minimum central pressure (millibars) |
| `34kt_wind_nm` / `50kt_wind_nm` / `64kt_wind_nm` | Wind radii by quadrant (nautical miles) |

### ACE calculation

Accumulated Cyclone Energy uses the standard NHC synoptic-time formula implemented in `libs/calculateACE.ts`:

- Eligible statuses: tropical storm (`TS`), subtropical storm (`SS`), hurricane (`HU`)
- Minimum wind: 34 kt
- Synoptic times only: 0000, 0600, 1200, 1800 UTC
- Contribution per point: `(max_wind_kt)² / 10,000`

### External assets

- **Storm track images** — Loaded from `cyclopedia-images.s3.us-east-2.amazonaws.com`
- **NHC reports** — Linked to `nhc.noaa.gov/data/tcr/` PDFs (1995+)
- **Map tiles** — [OpenStreetMap](https://www.openstreetmap.org/copyright)

## API

Season data is served by a Next.js Route Handler:

```
GET /api/archive/{basin}/{year}
```

| Parameter | Values |
| --- | --- |
| `basin` | `atl` or `pac` |
| `year` | 1850–2025 (must exist in archive) |

**Example:**

```bash
curl http://localhost:3000/api/archive/atl/2024
```

Responses include CORS headers (`Access-Control-Allow-Origin: *`) for cross-origin use. Image paths embedded in raw JSON are stripped before serving.

## Deployment

The app is configured for Netlify:

1. Connect the GitHub repository
2. Build command: `npm run build`
3. Node version: **20** (set in `netlify.toml`)
4. The `@netlify/plugin-nextjs` plugin handles Next.js routing and serverless functions

Cache headers are configured for static assets, API responses, and the service worker.

## Progressive Web App

Cyclopedia can be installed as a standalone PWA:

- **`public/manifest.json`** — App name, icons, theme color, portrait orientation
- **`public/sw.js`** — Caches core shell assets; network fallback for other requests
- **Service worker registration** — `app/components/ServiceWorkerRegister.tsx`

## Classification legend

Track point colors follow Saffir-Simpson categories for hurricanes and distinct colors for other classifications:

| Color | Classification |
| --- | --- |
| Dodger blue | Tropical Depression |
| Lime | Tropical Storm |
| Yellow / Orange / Red / Hot pink / Pink | Category 1–5 Hurricane |
| Aqua | Subtropical Depression |
| Pale green | Subtropical Storm |
| Purple | Extratropical Cyclone |
| Gray / Tropical Low |

Landfall points use a strike marker instead of a dot.

## Development notes

### Cesium asset copy

Cesium is loaded from static files in `public/cesium/` rather than bundled through webpack, avoiding WASM chunk errors. Run manually if needed:

```bash
node scripts/copy-cesium.mjs
```

### Webpack fallbacks

`next.config.ts` disables Node.js polyfills (`fs`, `http`, etc.) on the client for Cesium compatibility.

### Local data cache

Fetched seasons are stored in `localStorage` under keys `cyclopedia-{basin}-{year}`. Clear site data in the browser to force a refresh from the API.

## Contributing

Contributions are welcome. For data corrections or new seasons, update the JSON files under `archive/` and ensure they match the schema above. For UI or feature work, follow existing patterns in `components/` and `libs/`.

## Acknowledgments

- Storm data structured in a HURDAT-compatible format
- [NOAA National Hurricane Center](https://www.nhc.noaa.gov/) for official reports and reference material
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [CesiumJS](https://cesium.com/) for 3D geospatial visualization
