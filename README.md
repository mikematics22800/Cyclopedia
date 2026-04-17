# Cyclopedia

**Cyclopedia** is a [Next.js](https://nextjs.org/) web app for exploring historical North Atlantic and Eastern North Pacific tropical cyclones and switching to a **live tracker** with forecast cones, disturbance/invest overlays, and optional weather map layers. The UI pairs a **Leaflet** map with **Chart.js** season and storm analytics, **Material UI**, and a installable **PWA**-style experience (manifest, service worker, portrait-oriented layout).

---

## Features

### Historical archive

- **Basins**: North Atlantic (`atl`) and Eastern North Pacific (`pac`).
- **Season range**: Atlantic from **1850** through **2025**; Pacific data in the app is constrained from **1949** upward (see `components/App.tsx`).
- **Per-storm tracks** with intensity, pressure, and wind radii (34/50/64 kt) on the map.
- **Satellite or imagery thumbnails** when available: the archive API resolves image filenames under `archive/<basin>/<year>/images/` and exposes them via `/api/archive/.../images/...`.
- **Wind-field visualization** for archive seasons from **2004** onward when enabled (see `components/Map.tsx`).
- **Season-level charts**: intensity distribution, ACE (Accumulated Cyclone Energy (ACE)), and per-storm intensity/ACE views (`components/ArchiveCharts.tsx` and related chart components).
- **Client-side caching** of fetched season JSON in `localStorage` keyed by basin and year.

### Live tracker

- **Active storm tracks** proxied from a GeoJSON feed (see `/api/live`).
- **Forecast cones** from a companion endpoint (see `/api/cone`).
- **NHC tropical summary layers**: points of interest and invest-area polygons via NOAA MapServer queries (see `/api/invest` and `/api/invest-area`).
- **Optional OpenWeatherMap overlays** (clouds, precipitation, wind, temperature, pressure) when `NEXT_PUBLIC_OWM_KEY` is set.

### App shell

- **Responsive layout**: desktop split view (interface + map or charts); mobile uses a dedicated map and interface stack.
- **Toggle** between map and charts on large screens; **toggle** between historical archive and live tracker.
- **Service worker** registration for offline-oriented behavior (`public/sw.js`, `workbox-window`, `ServiceWorkerRegister`).

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js **16** (App Router) |
| UI | React **19**, TypeScript |
| Styling | Tailwind CSS **3**, Emotion, MUI **5** |
| Map | Leaflet, react-leaflet **5** |
| Charts | Chart.js **4**, react-chartjs-2 |
| Animation | GSAP |
| PWA | Web app manifest, custom service worker |

---

## Requirements

- **Node.js 20** (matches `netlify.toml` and is a safe choice for Next 16).
- npm (or another client compatible with `package-lock.json`).

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_OWM_KEY` | No* | OpenWeatherMap API key for live weather tile layers. If unset, those layers still render with `undefined` in the tile URL and may not load. |

Create a `.env.local` in the project root (Next.js loads it automatically):

```bash
NEXT_PUBLIC_OWM_KEY=your_openweathermap_api_key
```

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Run the production server (after `build`) |
| `npm run lint` | ESLint (Next.js config) |

---

## Deployment (Netlify)

The repo includes **`netlify.toml`** with:

- Build command: `npm run build`
- **`@netlify/plugin-nextjs`** for Next.js on Netlify
- **Node 20** in the build environment
- Long-cache headers for static assets and CORS-friendly headers for `/api/*`

Ensure production environment variables (e.g. `NEXT_PUBLIC_OWM_KEY`) are set in the Netlify UI if you use weather overlays.

---

## Project structure (high level)

```
app/
  api/                 # Route handlers (archive, live, cone, invest, images)
  layout.tsx           # Root layout, fonts, manifest, service worker hook
  page.tsx             # Renders main App component
components/          # Map, archive/live storm layers, UI, charts
contexts/              # React context for basin/year/storm/live state
libs/                  # Client fetch helpers, archive image utilities, math helpers
archive/
  atl/<year>/<year>.json   # Season storm arrays + images/ thumbnails
  pac/<year>/<year>.json
public/                # Icons, manifest, sw.js, static assets
```

---

## Archive JSON shape

Each season file is a **JSON array** of storm objects. A minimal illustration:

```json
{
  "id": "AL012020_Arthur",
  "dead_or_missing": 0,
  "cost_usd": 0,
  "retired": false,
  "data": [
    {
      "date": "20200516",
      "time_utc": "1800",
      "status": "TD",
      "lat": 28,
      "lng": -78.7,
      "max_wind_kt": 30,
      "min_pressure_mb": 1008,
      "34kt_wind_nm": { "ne": 0, "se": 0, "sw": 0, "nw": 0 },
      "50kt_wind_nm": { "ne": 0, "se": 0, "sw": 0, "nw": 0 },
      "64kt_wind_nm": { "ne": 0, "se": 0, "sw": 0, "nw": 0 }
    }
  ]
}
```

The archive **GET** handler may add an `image` URL per storm when a matching file exists under `images/`. Types aligned with this data live in `libs/hurdat.ts`.

---

## HTTP API (App Router)

All routes respond with JSON (or image bytes for the image route) and set permissive **CORS** headers where implemented.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/archive/{basin}/{year}` | `basin`: `atl` \| `pac`. `year`: **1850–2025** (validated). Returns season array; attaches `image` URLs when files exist. |
| `GET` | `/api/archive/{basin}/{year}/images/{file}` | Serves a single image from the season `images/` folder (used by the archive response). |
| `GET` | `/api/live` | Proxies live storm track GeoJSON (upstream configured in `app/api/live/route.ts`). |
| `GET` | `/api/cone` | Proxies forecast cone GeoJSON. |
| `GET` | `/api/invest` | NHC tropical weather summary — feature layer as GeoJSON. |
| `GET` | `/api/invest-area` | NHC invest areas — feature layer as GeoJSON. |
| `OPTIONS` | Same as above | CORS preflight where implemented. |

---

## Data sources and attribution

- **Historical archive** files and images in `archive/` are project-local datasets formatted for this app.
- **Live tracks and cones** are fetched via third-party HTTP services configured in the API routes (see each `route.ts` for the current URL).
- **NHC / NOAA** MapServer endpoints back invest-related layers (`mapservices.weather.noaa.gov`).
- **Base map**: [OpenStreetMap](https://www.openstreetmap.org/copyright) tiles.
- **Weather overlays**: [OpenWeatherMap](https://openweathermap.org/) (requires API key).
- **NHC imagery** may be loaded remotely where configured in `next.config.ts` (`www.nhc.noaa.gov`).

Respect upstream terms of use, rate limits, and attribution for any data you rely on in production.

---

## Name

Package name in `package.json` is **`cyclopedia-next`**; the product name shown in the UI and manifest is **Cyclopedia**.
