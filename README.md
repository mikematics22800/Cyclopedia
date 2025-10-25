# 🌪️ Cyclopedia - Vanilla React

A comprehensive tropical cyclone tracking and visualization application built with vanilla React, Vite, and Express.js. This application provides historical storm data analysis, live storm tracking, and interactive maps for both Atlantic and Pacific hurricane basins.

## 🚀 Features

### 📊 **Historical Storm Analysis**
- **Complete Storm Database**: Access to Atlantic (1851-2024) and Pacific (1949-2024) storm data
- **Storm Details**: Wind speeds, pressure, landfalls, casualties, and economic impact
- **Energy Metrics**: Accumulated Cyclone Energy (ACE) and Track Integrated Kinetic Energy (TIKE)
- **Visual Charts**: Interactive intensity, ACE/TIKE, and season comparison charts
- **Storm Images**: Historical satellite imagery and storm photos

### 🗺️ **Interactive Mapping**
- **Leaflet Integration**: High-performance mapping with multiple tile layers
- **Storm Tracks**: Visual representation of storm paths and intensity
- **Wind Field Visualization**: 34kt, 50kt, and 64kt wind radius data (2004+)
- **Live Weather Layers**: Real-time cloud, precipitation, wind, and pressure data
- **Areas of Interest**: Current tropical weather outlooks and storm potential

### 📱 **Progressive Web App**
- **Mobile-First**: Optimized for all screen sizes
- **Offline Capabilities**: Service worker for offline data access
- **Installable**: Can be installed as a native app
- **Touch-Friendly**: Gesture support for mobile devices
- **Adaptive UI**: Different layouts for desktop and mobile

### 🔄 **Live Storm Tracking**
- **Real-Time Data**: Current active storms and their status
- **Forecast Cones**: NHC forecast tracks and uncertainty cones
- **Movement Analysis**: Speed and direction calculations
- **Advisory Integration**: Latest storm advisories and updates

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Component-based UI library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first styling
- **React Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Material-UI** - Component library
- **PWA** - Progressive Web App capabilities

### **Backend**
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **File System** - JSON-based data storage

### **Data Sources**
- **HURDAT2** - Historical hurricane database
- **NHC** - National Hurricane Center live data
- **NOAA** - Weather service APIs
- **FEMA** - Real-time storm tracking

## 📁 Project Structure

```
cyclopedia/
├── client/                          # React frontend
│   ├── public/                      # Static assets
│   │   ├── cyclone.png              # App icon
│   │   ├── hurricane.jpg            # Background image
│   │   ├── retired.png              # Retired storm badge
│   │   ├── storm.ttf                # Custom font
│   │   └── manifest.json            # PWA manifest
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Interface.jsx        # Main interface
│   │   │   ├── Map.jsx              # Interactive map
│   │   │   ├── StormArchive.jsx     # Storm details
│   │   │   ├── SeasonArchive.jsx    # Season statistics
│   │   │   ├── LiveTracker.jsx      # Live storm tracking
│   │   │   ├── ArchiveCharts.jsx    # Data visualization
│   │   │   ├── AceTike.jsx          # ACE/TIKE calculations
│   │   │   ├── AreasOfInterest.jsx  # Weather outlooks
│   │   │   ├── ClimateLayers.jsx    # Weather layers
│   │   │   ├── Intensity.jsx        # Intensity charts
│   │   │   ├── Legend.jsx           # Map legend
│   │   │   ├── LiveStorms.jsx       # Live storm list
│   │   │   ├── MapController.jsx    # Map controls
│   │   │   ├── PointsOfInterest.jsx # POI management
│   │   │   ├── SeasonAceTike.jsx    # Season energy metrics
│   │   │   ├── SeasonIntensity.jsx  # Season intensity charts
│   │   │   └── WindField.jsx        # Wind field visualization
│   │   ├── libs/                    # Utility libraries
│   │   │   ├── hurdat.js            # Data fetching
│   │   │   └── sum.js               # Math utilities
│   │   ├── App.jsx                  # Main application
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── dist/                        # Built application
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   └── postcss.config.js            # PostCSS configuration
├── server/                          # Express.js backend
│   ├── archive/                     # Storm data files
│   │   ├── atl/                     # Atlantic storms (1851-2024)
│   │   └── pac/                     # Pacific storms (1949-2024)
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Express server
└── README.md                        # This file
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 20.18.0+ 
- npm or yarn
- Modern web browser

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cyclopedia
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:3000`

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Production Build**

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start production server**
   ```bash
   cd server
   npm start
   ```

3. **Deploy to GitHub Pages** (optional)
   ```bash
   cd client
   npm run deploy
   ```

## 📖 Usage Guide

### **Historical Analysis**

1. **Select Basin**: Choose Atlantic or Pacific
2. **Pick Year**: Select from 1851-2024 (Atlantic) or 1949-2024 (Pacific)
3. **Choose Storm**: Select specific storm from dropdown
4. **View Details**: See storm statistics, track, and impact data
5. **Analyze Charts**: Review intensity curves and energy metrics

### **Live Tracking**

1. **Toggle Mode**: Switch to "Live Tracker" mode
2. **View Active Storms**: See currently active tropical systems
3. **Weather Layers**: Enable/disable real-time weather data
4. **Storm Details**: Click storms for detailed information

### **Mobile Usage**

1. **Touch Navigation**: Swipe and tap to navigate
2. **Chart Expansion**: Tap charts to view full-screen
3. **Map Interaction**: Pinch to zoom, drag to pan
4. **Interface Toggle**: Use bottom interface panel
5. **Install App**: Add to home screen for native app experience

## 🔧 API Endpoints

Returns server status and timestamp.

### **Storm Data**
```http
GET /:basin/:year
```
- `basin`: `atl` (Atlantic) or `pac` (Pacific)
- `year`: 1851-2024 (Atlantic) or 1949-2024 (Pacific)

**Example:**
```bash
curl http://localhost:3000/atl/2023
```

## 🔍 Data Sources

### **Historical Data**
- **HURDAT2**: Atlantic and Pacific hurricane database
- **NHC**: National Hurricane Center archives
- **NOAA**: Historical storm track data

### **Live Data**
- **NHC Advisories**: Current storm information
- **FEMA APIs**: Real-time storm tracking
- **NOAA Weather**: Live weather layers

### **Data Updates**
- Historical data is static (updated annually)
- Live data refreshes every 6 hours
- Forecast data updates every 6 hours

## 🛠️ Development

**Frontend (client/):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

**Backend (server/):**
- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run build` - Build command (placeholder)

### **Environment Variables**

Create a `.env` file in the server directory:
```env
PORT=3000
NODE_ENV=development
```

## 🙏 Acknowledgments

- **National Hurricane Center** for storm data and forecasts
- **NOAA** for historical hurricane databases
- **FEMA** for real-time storm tracking APIs
- **OpenStreetMap** for map tiles
- **React Leaflet** for mapping components
- **Chart.js** for data visualization
- **Vite** for fast development experience

Built with ❤️ for hurricane tracking and research