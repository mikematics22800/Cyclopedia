import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = 'https://www.tropicaltidbits.com/storminfo/';

// Global browser instance for reuse
let browserInstance = null;

/**
 * Gets or creates a browser instance for reuse across scrapes
 */
async function getBrowser() {
  // Check if browser exists and is still connected
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  
  // Create new browser instance
  console.log('Creating new browser instance...');
  browserInstance = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
  });
  
  return browserInstance;
}

/**
 * Closes the browser instance (call on shutdown)
 */
export async function closeBrowser() {
  if (browserInstance) {
    console.log('Closing browser instance...');
    await browserInstance.close();
    browserInstance = null;
  }
}

// Cleanup on process exit
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

/**
 * Parses coordinates from location string like "17.9°N 112.9°E"
 */
function parseCoordinates(locationStr) {
  const match = locationStr.match(/([\d.]+)°([NS])\s+([\d.]+)°([EW])/);
  if (!match) return null;
  
  const lat = parseFloat(match[1]) * (match[2] === 'S' ? -1 : 1);
  const lon = parseFloat(match[3]) * (match[4] === 'W' ? -1 : 1);
  
  return { lat, lon };
}

/**
 * Parses storm type and name from text like "Tropical Storm FENGSHEN"
 */
function parseStormName(nameStr) {
  const parts = nameStr.trim().split(/\s+/);
  if (parts.length < 2) return { type: 'Unknown', name: parts[0] };
  
  // Last word is the name, everything before is the type
  const name = parts[parts.length - 1];
  const type = parts.slice(0, -1).join(' ');
  
  return { type, name };
}

/**
 * Parses timestamp from string like "As of 18:00 UTC Oct 20, 2025:"
 */
function parseTimestamp(timestampStr) {
  const match = timestampStr.match(/As of ([\d:]+) UTC ([A-Za-z]+) ([\d]+), ([\d]+)/);
  if (!match) return null;
  
  const [_, time, month, day, year] = match;
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const monthNum = monthMap[month] || '01';
  const isoDate = `${year}-${monthNum}-${day.padStart(2, '0')}T${time}:00Z`;
  
  return isoDate;
}

function formatPositionPoint(stormData) {
  return {
    latitude: stormData.latitude,
    longitude: stormData.longitude,
    maxWinds: stormData.maxWinds,
    gusts: stormData.gusts,
    minPressure: stormData.minPressure,
    movement: 'N/A',
    timestamp: stormData.timestamp,
    stormType: stormData.stormType,
    windRadii: []
  };
}

/**
 * Parses storm data from HTML using cheerio
 */
function parseStormFromHTML($, stormId) {
  const stormWrapper = $(`#${stormId}`);
  if (!stormWrapper.length) {
    console.log(`    [DEBUG] No wrapper found for storm ID: ${stormId}`);
    return null;
  }
  
  // Extract storm name and type
  const stormNameText = stormWrapper.find('.storm-name').text().trim();
  if (!stormNameText) {
    console.log(`    [DEBUG] No storm name found for ${stormId}`);
    return null;
  }
  const { type: stormType, name: stormName } = parseStormName(stormNameText);
  
  // Extract timestamp
  const timestampText = stormWrapper.find('.timestamp').text().trim();
  const timestamp = parseTimestamp(timestampText);
  
  // Extract storm info spans
  const stormInfo = stormWrapper.find('.storm-info');
  
  // Parse location
  const locationText = stormInfo.find('span').filter((i, el) => $(el).text().includes('Location:')).text();
  const locationMatch = locationText.match(/Location:\s*(.+)/);
  const locationStr = locationMatch ? locationMatch[1].trim() : '';
  const coords = parseCoordinates(locationStr);
  
  if (!coords) return null;
  
  // Parse winds
  const windsText = stormInfo.find('span').filter((i, el) => $(el).text().includes('Maximum Winds:')).text();
  const windsMatch = windsText.match(/Maximum Winds:\s*([\d.]+)\s*kt/);
  const gustsMatch = windsText.match(/Gusts:\s*([\d.]+|N\/A)/);
  const maxWinds = windsMatch ? `${windsMatch[1]} kt` : 'N/A';
  const gusts = gustsMatch && gustsMatch[1] !== 'N/A' ? `${gustsMatch[1]} kt` : 'N/A';
  
  // Parse pressure
  const pressureText = stormInfo.find('span').filter((i, el) => $(el).text().includes('Minimum Central Pressure:')).text();
  const pressureMatch = pressureText.match(/Minimum Central Pressure:\s*([\d.]+)\s*mb/);
  const minPressure = pressureMatch ? `${pressureMatch[1]} mb` : 'N/A';
  
  // Determine basin from storm ID
  let basin = 'Unknown';
  if (stormId.endsWith('L')) basin = 'AL';
  else if (stormId.endsWith('E')) basin = 'EP';
  else if (stormId.endsWith('W')) basin = 'WP';
  else if (stormId.endsWith('S')) basin = 'SH';
  else if (stormId.endsWith('A')) basin = 'IO';
  else if (stormId.endsWith('B')) basin = 'IO';
  
  // Format location string
  const latStr = `${Math.abs(coords.lat).toFixed(1)}°${coords.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(coords.lon).toFixed(1)}°${coords.lon >= 0 ? 'E' : 'W'}`;
  const location = `${latStr} ${lonStr}`;
  
  // Format timestamp for display
  const displayTimestamp = timestamp ? new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }) + ' UTC' : 'Unknown';
  
  return {
    id: stormId,
    name: `${stormType} ${stormName}`,
    stormName: stormName,
    stormType: stormType,
    basin: basin,
    location: location,
    latitude: coords.lat,
    longitude: coords.lon,
    maxWinds: maxWinds,
    gusts: gusts,
    minPressure: minPressure,
    movement: 'N/A',
    timestamp: displayTimestamp,
    windRadii: [],
    isFinal: false,
    lastUpdate: timestamp,
    rawTimestamp: timestamp
  };
}

/**
 * Formats storm data with track history
 */
function formatStormData(stormData, previousTrack = []) {
  // Create current position point
  const currentPoint = formatPositionPoint(stormData);
  
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
  
  return {
    ...stormData,
    track: track
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
 * Main scraper function that fetches all active storms from Tropical Tidbits and appends track history
 * Automatically removes storms that are no longer active
 * Uses Puppeteer to load each storm individually via hash anchors
 * Reuses a single browser instance to prevent memory leaks
 */
export async function scrapeAllStorms() {
  let page;
  try {
    // Get or create browser instance (reused across calls)
    const browser = await getBrowser();
    
    // Load main page to get storm IDs
    page = await browser.newPage();
    console.log(`Fetching: ${baseURL}`);
    await page.goto(baseURL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Get storm IDs from dropdown
    const stormIds = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('#storm-select option'));
      return options
        .map(opt => opt.value)
        .filter(val => val && val !== '');
    });
    
    console.log(`Found ${stormIds.length} active storms on Tropical Tidbits`);
    
    // Load previous data to preserve track history
    const previousData = await loadPreviousData();
    const previousStorms = previousData?.storms || [];
    
    if (stormIds.length === 0) {
      console.log('No active storms found');
      await page.close();
      
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
        source: 'Tropical Tidbits ATCF'
      };
    }

    // Visit each storm by selecting from dropdown
    const currentStorms = [];
    for (const stormId of stormIds) {
      try {
        console.log(`  Selecting storm: ${stormId}`);
        
        // Select the storm from the dropdown
        await page.select('#storm-select', stormId);
        
        // Wait for the page to update after selection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the updated HTML
        const html = await page.content();
        const $ = cheerio.load(html);
        
        // Parse the storm data
        const stormData = parseStormFromHTML($, stormId);
        if (stormData) {
          currentStorms.push(stormData);
          console.log(`  ✓ Parsed: ${stormData.name} (${stormId})`);
        } else {
          console.log(`  ! Failed to parse data for ${stormId}`);
        }
      } catch (error) {
        console.error(`  ! Error loading ${stormId}:`, error.message);
      }
    }
    
    // Close the page but keep browser alive for reuse
    await page.close();

    // Get IDs of currently active storms
    const activeStormIds = new Set(currentStorms.map(s => s.id));

    // Check for storms that are no longer active
    const inactiveStorms = previousStorms.filter(storm => !activeStormIds.has(storm.id));
    if (inactiveStorms.length > 0) {
      console.log(`Removing ${inactiveStorms.length} inactive storm(s):`);
      inactiveStorms.forEach(storm => {
        console.log(`  - ${storm.name} (${storm.id}) - No longer detected`);
      });
    }

    // Format storm data with track history (only for currently active storms)
    const stormDetails = currentStorms.map(stormData => {
      // Find previous track for this storm ID
      const previousStorm = previousStorms.find(s => s.id === stormData.id);
      const previousTrack = previousStorm?.track || [];
      
      const isNewStorm = !previousStorm;
      if (isNewStorm) {
        console.log(`  + New storm detected: ${stormData.stormName} (${stormData.id})`);
      }
      
      return formatStormData(stormData, previousTrack);
    });

    const result = {
      lastUpdated: new Date().toISOString(),
      stormCount: stormDetails.length,
      storms: stormDetails,
      source: 'Tropical Tidbits ATCF'
    };

    // Save to hurdat.json (main file) and weather-underground.json (backup)
    const livePath = path.join(__dirname, 'live');
    await fs.mkdir(livePath, { recursive: true });
    
    const jsonData = JSON.stringify(result, null, 2);
    await fs.writeFile(path.join(livePath, 'hurdat.json'), jsonData);
    await fs.writeFile(path.join(livePath, 'tropical-tidbits.json'), jsonData);

    console.log(`Successfully scraped ${stormDetails.length} active storms with track history`);
    return result;

  } catch (error) {
    console.error('Error scraping storms:', error);
    // Close page if it exists, but keep browser alive for next attempt
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error('Error closing page:', closeError.message);
      }
    }
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
      
      // Check if data is less than 15 minutes old (Tropical Tidbits updates every 15 minutes)
      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      const diffMinutes = (now - lastUpdated) / (1000 * 60);
      
      if (diffMinutes < 15) {
        console.log(`Using cached storm data (${diffMinutes.toFixed(1)} minutes old)`);
        return parsed;
      }
    } catch (error) {
      console.log('No cached data available, fetching fresh data...');
    }
  }
  
  // Fetch fresh data
  return await scrapeAllStorms();
}

