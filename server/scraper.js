import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Weather Underground uses Weather.com API
const WEATHER_API_KEY = 'e1f10a1e78da46f5b10a1e78da96f525';
const WEATHER_API_BASE = 'https://api.weather.com';

/**
 * Fetches JSON data from Weather.com API
 */
async function fetchWeatherAPI(endpoint) {
  try {
    const url = `${WEATHER_API_BASE}${endpoint}`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

/**
 * Fetches active storms from Weather.com API
 */
async function getActiveStorms() {
  console.log('Fetching active storms from Weather Underground...');
  
  const data = await fetchWeatherAPI(
    `/v2/tropical/currentposition?apiKey=${WEATHER_API_KEY}&source=default&basin=all&language=en-US&units=e&nautical=true&format=json`
  );
  
  if (!data || !data.advisoryinfo) {
    console.log('No storm data available');
    return [];
  }

  console.log(`Found ${data.advisoryinfo.length} active storms`);
  return data.advisoryinfo;
}

/**
 * Formats a single position data point from advisory
 */
function formatPositionPoint(advisory) {
  const pos = advisory.currentposition;
  
  // API already returns signed coordinates
  return {
    latitude: pos.lat,
    longitude: pos.lon,
    maxWinds: pos.max_sustained_wind ? `${pos.max_sustained_wind} mph` : 'N/A',
    gusts: pos.wind_gust ? `${pos.wind_gust} mph` : 'N/A',
    minPressure: pos.min_pressure ? `${pos.min_pressure} inHg` : 'N/A',
    movement: pos.heading ? `${pos.heading.storm_dir_cardinal} at ${pos.heading.storm_spd} mph` : 'N/A',
    timestamp: advisory.issue_dt_tm,
    stormType: pos.storm_type || 'Unknown',
    windRadii: pos.wind_radii || []
  };
}

/**
 * Formats storm data from Weather.com API to simplified structure with track history
 */
function formatStormData(advisory, previousTrack = []) {
  const pos = advisory.currentposition;
  
  // Format location string
  const lat = `${Math.abs(pos.lat).toFixed(1)}°${pos.lat_hemisphere}`;
  const lon = `${Math.abs(pos.lon).toFixed(1)}°${pos.lon_hemisphere}`;
  const location = `${lat} ${lon}`;
  
  // Format timestamp
  const timestamp = new Date(advisory.issue_dt_tm).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: advisory.issue_dt_tm_tz_cd || 'UTC'
  });
  
  // Determine storm type and name
  let stormType = pos.storm_type || 'Unknown';
  let stormName = advisory.storm_name || `${advisory.basin}${advisory.storm_number}`;
  
  // Combine type and name
  let displayName = `${stormType} ${stormName}`;
  
  // Handle special cases like "Invest 98L"
  if (advisory.storm_id.includes('AL98') || advisory.storm_id.includes('EP98')) {
    displayName = `Invest ${advisory.storm_id.replace(/[A-Z]+/, '')}${advisory.basin}`;
  }
  
  // Create current position point
  const currentPoint = formatPositionPoint(advisory);
  
  // Merge previous track with current point, avoiding duplicates
  const track = [...previousTrack];
  const isDuplicate = track.some(pt => 
    pt.timestamp === currentPoint.timestamp &&
    pt.latitude === currentPoint.latitude &&
    pt.longitude === currentPoint.longitude
  );
  
  if (!isDuplicate) {
    track.push(currentPoint);
  }
  
  // API already returns signed coordinates
  return {
    id: advisory.storm_id,
    name: displayName,
    stormName: stormName,
    stormType: stormType,
    basin: advisory.basin,
    location: location,
    latitude: pos.lat,
    longitude: pos.lon,
    maxWinds: pos.max_sustained_wind ? `${pos.max_sustained_wind} mph` : 'N/A',
    gusts: pos.wind_gust ? `${pos.wind_gust} mph` : 'N/A',
    minPressure: pos.min_pressure ? `${pos.min_pressure} inHg` : 'N/A',
    movement: pos.heading ? `${pos.heading.storm_dir_cardinal} at ${pos.heading.storm_spd} mph` : 'N/A',
    timestamp: timestamp,
    windRadii: pos.wind_radii || [],
    isFinal: advisory.final_advisory || false,
    lastUpdate: advisory.issue_dt_tm,
    track: track // Full track history
  };
}

/**
 * Load previous storm data to preserve track history
 */
async function loadPreviousData() {
  const filePath = path.join(__dirname, 'live', 'hurdat.json');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Main scraper function that fetches all active storms and appends track history
 * Automatically removes storms that are no longer active
 */
export async function scrapeAllStorms() {
  try {
    const advisories = await getActiveStorms();
    
    // Load previous data to preserve track history
    const previousData = await loadPreviousData();
    const previousStorms = previousData?.storms || [];
    
    if (!advisories || advisories.length === 0) {
      console.log('No active storms found');
      
      // If there were previously active storms, log their removal
      if (previousStorms.length > 0) {
        console.log(`Removing ${previousStorms.length} inactive storm(s):`);
        previousStorms.forEach(storm => {
          console.log(`  - ${storm.name} (${storm.id})`);
        });
      }
      
      return {
        lastUpdated: new Date().toISOString(),
        stormCount: 0,
        storms: [],
        source: 'Weather Underground / Weather.com API'
      };
    }

    // Get IDs of currently active storms
    const activeStormIds = new Set(
      advisories
        .filter(advisory => !advisory.final_advisory)
        .map(advisory => advisory.storm_id)
    );

    // Check for storms that are no longer active
    const inactiveStorms = previousStorms.filter(storm => !activeStormIds.has(storm.id));
    if (inactiveStorms.length > 0) {
      console.log(`Removing ${inactiveStorms.length} inactive storm(s):`);
      inactiveStorms.forEach(storm => {
        console.log(`  - ${storm.name} (${storm.id}) - No longer detected by API`);
      });
    }

    // Format storm data with track history (only for currently active storms)
    const stormDetails = advisories
      .filter(advisory => !advisory.final_advisory) // Filter out dissipated storms
      .map(advisory => {
        // Find previous track for this storm ID
        const previousStorm = previousStorms.find(s => s.id === advisory.storm_id);
        const previousTrack = previousStorm?.track || [];
        
        const isNewStorm = !previousStorm;
        if (isNewStorm) {
          console.log(`  + New storm detected: ${advisory.storm_name || advisory.storm_id}`);
        }
        
        return formatStormData(advisory, previousTrack);
      });

    const result = {
      lastUpdated: new Date().toISOString(),
      stormCount: stormDetails.length,
      storms: stormDetails,
      source: 'Weather Underground / Weather.com API'
    };

    // Save to hurdat.json (main file) and weather-underground.json (backup)
    const livePath = path.join(__dirname, 'live');
    await fs.mkdir(livePath, { recursive: true });
    
    const jsonData = JSON.stringify(result, null, 2);
    await fs.writeFile(path.join(livePath, 'hurdat.json'), jsonData);
    await fs.writeFile(path.join(livePath, 'weather-underground.json'), jsonData);

    console.log(`Successfully scraped ${stormDetails.length} active storms with track history`);
    return result;

  } catch (error) {
    console.error('Error scraping storms:', error);
    throw error;
  }
}

/**
 * Gets cached storm data or scrapes if not available
 */
export async function getStormData(forceRefresh = false) {
  const filePath = path.join(__dirname, 'live', 'hurdat.json');
  
  if (!forceRefresh) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Check if data is less than 1 hour old (Weather.com updates frequently)
      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      const diffHours = (now - lastUpdated) / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        console.log(`Using cached storm data (${diffHours.toFixed(2)} hours old)`);
        return parsed;
      }
    } catch (error) {
      console.log('No cached data available, fetching fresh data...');
    }
  }
  
  // Fetch fresh data
  return await scrapeAllStorms();
}

