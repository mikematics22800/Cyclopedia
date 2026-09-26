# Cyclopedia

日本語の説明は [下記](#日本語)。

An open-source educational web app for exploring historical tropical cyclone tracks, intensity, wind fields, and season statistics across six global basins — from the Atlantic in 1851 to the present.

Use Cyclopedia to study how storms moved, intensified, and varied by basin and season. It is built for learning and research exploration, not for live forecasting or emergency decisions.

> **Not for operational use.** For current storm information, consult official sources such as [NHC](https://www.nhc.noaa.gov/) and [JTWC](https://www.metoc.navy.mil/jtwc/).

## What You Can Explore

- **Storm tracks** on a 2D Leaflet map or 3D Cesium globe, with landfall markers and optional wind radii (2002+)
- **Intensity over time** via per-storm wind timelines and basin season charts
- **Season metrics** including storm counts, major-hurricane totals, and ACE (Accumulated Cyclone Energy)
- **Multi-basin comparison** across the North Atlantic, East Pacific, West Pacific, North Indian, South Indian, and South Pacific
- **Historical context** spanning more than a century of best-track records in a browser-based PWA

## Features

- **Tracking maps** — Leaflet 2D map and Cesium 3D globe with storm track polylines, landfall markers, and optional wind radii (2002+)
- **Metric Charts** — Season totals, per-storm wind timelines, and ACE metrics
- **Desktop navbar** — Tracking Maps and Intensity Charts are centered. English / 日本語 on the right switches every interface label. Japanese copy is written in kanji, and the choice is saved in the browser (`cyclopedia-lang`)
- **Season playback** — Play, pause, step backward, step forward, and speed (1×–16×) move every visible track on the map and globe together
- **Legend controls** — Classification key, wind-field overlay (2002+), and switches to isolate the selected basin or the selected storm
- **Multi-basin support** — Six global basins with basin and year selectors
- **Historical archive** — Decades of best-track data served as static JSON from `public/archive/`
- **PWA** — Installable progressive web app with service worker and offline-friendly asset caching
- **Responsive layout** — Desktop split view and mobile bottom sheet UI

## Basin Coverage

| Basin | Code | Years |
|-------|------|-------|
| North Atlantic | `n_atlantic` | 1851–2025 |
| East Pacific | `e_pacific` | 1949–2025 |
| West Pacific | `w_pacific` | 1945–2024 |
| North Indian | `n_indian` | 1945–2024 (1958 missing) |
| South Indian | `s_indian` | 1945–2024 |
| South Pacific | `s_pacific` | 1945–2024 |

Storm IDs use standard prefixes: `AL` (North Atlantic), `EP`/`CP` (East Pacific), `WP` (West Pacific), `IO` (North Indian), `SI` (South Indian), `SP` (South Pacific).

## Data Sources & Attribution

Track datasets are derived from official best-track archives maintained by:

| Basin | Source | Agency |
|-------|--------|--------|
| North Atlantic (`n_atlantic`) | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [National Hurricane Center (NHC)](https://www.nhc.noaa.gov/) |
| East Pacific (`e_pacific`) | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [National Hurricane Center (NHC)](https://www.nhc.noaa.gov/) |
| West Pacific (`w_pacific`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| North Indian (`n_indian`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| South Indian (`s_indian`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |
| South Pacific (`s_pacific`) | JTWC best-track archive | [Joint Typhoon Warning Center (JTWC)](https://www.metoc.navy.mil/jtwc/) |

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
  "casualties": 1,
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

Processes `w_pacific`, `n_indian`, `s_indian`, and `s_pacific`. Downloads `ne_50m_land.geojson` to `scripts/data/` on first run.

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
│   ├── Charts.tsx          # Desktop Metric Charts view
│   └── hooks/              # GSAP reveal, mobile sheet drag
├── contexts/
│   ├── AppContext.tsx      # Shared app state, including language
│   └── PlaybackContext.tsx # Season playback state
├── libs/
│   ├── basins.ts           # Basin config & year ranges
│   ├── hurdat.ts           # Archive fetch & storm helpers
│   ├── calculateACE.ts     # ACE computation
│   ├── i18n.ts             # English and kanji interface copy
│   ├── mapUtils.ts         # Map helpers
│   ├── playback.ts         # Season playback scheduling
│   ├── globeTrackUtils.ts  # Cesium track rendering
│   ├── chartMetric.ts      # Stable chart series ids for translated labels
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

# 日本語

英語は [冒頭](#cyclopedia)。

歴史上の熱帯低気圧について、経路、強度、風域、季節統計を六海域で調べる公開教育用の網頁応用。北大西洋は1851年から現在までを含む。

暴風の移動、発達、海域と季節による差を学ぶための応用。現況予報や防災判断には用いない。

> **運用用途外。** 現在の暴風情報は [国立颶風中心（NHC）](https://www.nhc.noaa.gov/) と [合同台風警報中心（JTWC）](https://www.metoc.navy.mil/jtwc/) を参照。

## 探索できる内容

- **暴風経路** — 平面地図または立体地球儀。上陸印と任意の風域（2002年以降）
- **強度の時間変化** — 各暴風の風速経過と、海域ごとの季節図表
- **季節指標** — 暴風数、大型颶風数、蓄積低気圧エネルギー（ACE）
- **複数海域の比較** — 北大西洋、東太平洋、西太平洋、北印度洋、南印度洋、南太平洋
- **長期記録** — 一世紀を超える確定経路を、導入可能な網頁応用として閲覧

## 機能

- **追跡地図** — Leaflet の平面地図と Cesium の立体地球儀。経路線、上陸印、任意の風域（2002年以降）
- **強度図表** — 季節合計、各暴風の風速経過、蓄積低気圧エネルギー
- **卓上画面の見出し** — 追跡地図と強度図表を中央に置く。右側の English／日本語で全表示文を切り替える。日本語は漢字。選択は閲覧器に保存（`cyclopedia-lang`）
- **季節再生** — 再生、一時停止、後退、前進、速度（1倍から16倍）。地図と地球儀に出ている全経路を同時に進める
- **凡例** — 分類、風域表示（2002年以降）、選択海域の限定、選択暴風の限定
- **六海域** — 海域と年の選択
- **歴史資料** — 数十年分の確定経路を `public/archive/` の静的 JSON として配信
- **導入可能網頁応用** — 常駐脚本と、回線切断時にも使える資産保存
- **画面幅への対応** — 卓上は左右分割。携帯は下端から引き出す面板

## 海域範囲

| 海域 | 符号 | 年 |
|------|------|-----|
| 北大西洋 | `n_atlantic` | 1851–2025 |
| 東太平洋 | `e_pacific` | 1949–2025 |
| 西太平洋 | `w_pacific` | 1945–2024 |
| 北印度洋 | `n_indian` | 1945–2024（1958年欠） |
| 南印度洋 | `s_indian` | 1945–2024 |
| 南太平洋 | `s_pacific` | 1945–2024 |

暴風識別子の接頭は次のとおり。`AL`（北大西洋）、`EP`／`CP`（東太平洋）、`WP`（西太平洋）、`IO`（北印度洋）、`SI`（南印度洋）、`SP`（南太平洋）。

## 資料源と表示

経路資料は、各機関が公開する確定経路から作る。

| 海域 | 資料源 | 機関 |
|------|--------|------|
| 北大西洋（`n_atlantic`） | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [国立颶風中心（NHC）](https://www.nhc.noaa.gov/) |
| 東太平洋（`e_pacific`） | [HURDAT2](https://www.nhc.noaa.gov/data/#hurdat) | [国立颶風中心（NHC）](https://www.nhc.noaa.gov/) |
| 西太平洋（`w_pacific`） | JTWC 確定経路 | [合同台風警報中心（JTWC）](https://www.metoc.navy.mil/jtwc/) |
| 北印度洋（`n_indian`） | JTWC 確定経路 | [合同台風警報中心（JTWC）](https://www.metoc.navy.mil/jtwc/) |
| 南印度洋（`s_indian`） | JTWC 確定経路 | [合同台風警報中心（JTWC）](https://www.metoc.navy.mil/jtwc/) |
| 南太平洋（`s_pacific`） | JTWC 確定経路 | [合同台風警報中心（JTWC）](https://www.metoc.navy.mil/jtwc/) |

国立颶風中心は米国海洋大気庁（NOAA）の一部。本応用の経路、強度、風域は、各機関が公表した確定経路に従う。

**Cyclopedia は NOAA、国立颶風中心、米国海軍の所属、承認、代行ではない。**

### 資料配置

暴風資料は `public/archive/` の静的 JSON。実行時に `/archive/{basin}/{year}.json` を直接取得する。

季節合計は `/archive/{basin}/totals.json`。

### 資料形式

各資料（`public/archive/{basin}/{year}.json`）は暴風物体の配列。

```json
{
  "id": "AL011851_One",
  "retired": false,
  "cost_usd": 0,
  "casualties": 1,
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

- `record: "L"` は上陸点
- 風域欄（`34kt_wind_nm`、`50kt_wind_nm`、`64kt_wind_nm`）は2002年以降
- `status` は国立颶風中心の符号（例: `TD`、`TS`、`HU`）

### 上陸判定

`script.js` は自然地球の陸地多角形で資料へ上陸印を付ける。

```bash
node script.js --dry-run   # 書込前の確認
node script.js             # 上陸印を資料 JSON へ書く
```

対象は `w_pacific`、`n_indian`、`s_indian`、`s_pacific`。初回実行で `ne_50m_land.geojson` を `scripts/data/` へ取得する。

## 構成

```
Cyclopedia/
├── app/                    # Next.js 応用経路
│   ├── layout.tsx          # 根配置、導入情報、常駐脚本
│   └── page.tsx
├── components/             # React 画面
│   ├── App.tsx             # 主画面と状態
│   ├── Tracker.tsx         # 地図／地球儀の切替
│   ├── Map.tsx             # Leaflet 平面地図
│   ├── Globe.tsx           # Cesium 立体地球儀
│   ├── Interface.tsx       # 選択、指標、図表面板
│   ├── Charts.tsx          # 卓上の強度図表
│   └── hooks/              # GSAP 表示、携帯面板の引き
├── contexts/
│   ├── AppContext.tsx      # 共有状態。言語を含む
│   └── PlaybackContext.tsx # 季節再生の状態
├── libs/
│   ├── basins.ts           # 海域設定と年範囲
│   ├── hurdat.ts           # 資料取得と暴風補助
│   ├── calculateACE.ts     # 蓄積低気圧エネルギーの計算
│   ├── i18n.ts             # 英語と漢字の表示文
│   ├── mapUtils.ts         # 地図補助
│   ├── playback.ts         # 季節再生の時刻
│   ├── globeTrackUtils.ts  # Cesium 経路描画
│   ├── chartMetric.ts      # 翻訳後も図表系列を識別する固定符号
│   ├── loadCesium.ts       # Cesium の遅延読込
│   ├── shiftMap.ts         # Leaflet の日付変更線移動
│   └── sum.ts              # 数値合計
├── public/
│   ├── archive/            # 海域・年ごとの暴風 JSON
│   ├── sw.js               # 常駐脚本
│   └── manifest.json       # 導入可能網頁応用の宣言
├── scripts/
│   └── copy-cesium.mjs     # Cesium 静的資産の複製
└── script.js               # 上陸判定
```

## 技術

- **枠組** — [Next.js 16](https://nextjs.org/)（App Router、React 19）
- **地図** — [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/)、[Cesium](https://cesium.com/)
- **図表** — [Chart.js](https://www.chartjs.org/) / [react-chartjs-2](https://react-chartjs-2.js.org/)
- **画面** — [Material UI](https://mui.com/)、[Tailwind CSS](https://tailwindcss.com/)、[GSAP](https://gsap.com/)

## 参加

教育上の明確さ、資料処理、利用しやすさ、説明文書を改善する変更を歓迎する。

1. 源庫を分岐し、機能用の枝を作る
2. 意図の分かる記録文で、範囲を絞った変更をする
3. 取込要求の前に `npm run lint` を実行する
4. 取込要求に、何をなぜ変えたかを書く

経路資料を変更または再使用するときは、国立颶風中心と合同台風警報中心の表示を残す。

## 許諾

本応用は、熱帯低気圧の歴史、気象資料、対話型の網頁地図を学ぶための公開教育資料として共有する。

