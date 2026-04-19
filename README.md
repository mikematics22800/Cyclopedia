# Cyclopedia

Cyclopedia is a **Next.js** web app for exploring **historical Atlantic and eastern Pacific tropical cyclone seasons** (HURDAT-style archive JSON). The UI combines **Leaflet** maps, **Material UI** controls, and **Chart.js** intensity charts behind a custom storm-themed interface.

## Features

- **Season browser** — Browse seasons by basin (`atl` / `pac`) and year; pick a storm and view its track on the map with optional wind-field visualization, legends, and archive-oriented panels.
- **Season analytics** — Season-level charts and metrics (for example ACE-related views) driven by the same archive data.
- **Progressive Web App** — `manifest.json` and `public/sw.js` provide installability and a small offline shell for cached static assets; registration runs from `app/components/ServiceWorkerRegister.tsx`.
- **Responsive layout** — Separate desktop and mobile map/interface regions with Tailwind-driven styling and a local display font.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, [MUI](https://mui.com/) 5, [Emotion](https://emotion.sh/) (via MUI) |
| Maps | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| Charts | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| Animation | [GSAP](https://gsap.com/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 3, `app/globals.css` |
| Deploy | [Netlify](https://www.netlify.com/) (`netlify.toml`, `@netlify/plugin-nextjs`) |

## Requirements

- **Node.js** 20.x (matches Netlify and modern Next.js; other LTS versions may work but are not guaranteed.)
- **npm** (lockfile is `package-lock.json`).

## Getting started

```bash
git clone <repository-url>
cd Cyclopedia
npm install
```

### Environment

Optional `.env` files are ignored by git (see `.gitignore`). Add one locally if you introduce environment-based configuration; nothing in the public README assumes secret values.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app loads archive data over the network from `/api/archive/...` and caches season JSON in `localStorage` under keys like `cyclopedia-{basin}-{year}`.

### Production build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project layout

| Path | Role |
|------|------|
| `app/` | App Router: `layout.tsx`, `page.tsx`, `globals.css`, API route handlers under `app/api/` |
| `components/` | React UI: map, archive layers, charts, interface shell, loading screen |
| `contexts/AppContext.tsx` | Shared state (basin, year, selected storm, map vs charts, etc.) |
| `libs/` | Client data helpers (`hurdat.ts`, `sum.ts`) and server helpers for archive images (`archiveImageServer.ts`) |
| `archive/` | Static JSON per basin/year (`archive/{basin}/{year}/{year}.json`) and optional `images/` subfolders |
| `public/` | Icons, `manifest.json`, service worker `sw.js`, static imagery |

## Archive data

- Season files live at `archive/<basin>/<year>/<year>.json` (for example `archive/atl/2024/2024.json`).
- Supported basins in API validation are **`atl`** and **`pac`**. Pacific seasons before 1949 are clamped in the client when switching basin.
- Optional per-storm images can be placed under `archive/<basin>/<year>/images/`. The archive API enriches storm objects with an `image` URL when a filename matches the storm id (see `archiveImageStemFromStormId` in `libs/archiveImageServer.ts`). Serving those URLs may require a matching Next.js route under `app/api/archive/.../images/...` if not already present in your branch.

## API routes (Next.js)

These handlers live under `app/api/` and are the supported way for the browser to load data without configuring remote CORS for third-party origins.

| Route | Purpose |
|-------|---------|
| `GET /api/archive/[basin]/[year]` | Reads `archive/<basin>/<year>/<year>.json`, attaches optional local image URLs, returns JSON |

CORS and cache headers for `/api/*` are set in `next.config.ts` and mirrored in `netlify.toml` where relevant.

## Remote image hosts

`next.config.ts` allows optimized images from hosts such as `www.nhc.noaa.gov` and `tile.openstreetmap.org`. Add patterns there if you introduce new remote image domains.

## Deployment (Netlify)

- Build: `npm run build` with Node 20 (`netlify.toml`).
- The **`@netlify/plugin-nextjs`** plugin enables the Next.js runtime on Netlify (SSR, API routes, etc.).
- Do not use a single-page-app fallback that rewrites all paths to `/index.html`; Next.js needs its own routing and server handlers.

## License and data

Hurricane track and operational products are subject to the terms and availability of their respective providers (NHC, NOAA, and any third-party services referenced in the API route source files). Verify licensing and attribution before redistributing derived datasets.
