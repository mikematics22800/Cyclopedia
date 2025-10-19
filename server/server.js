import express from 'express';
import cors from 'cors'; 
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { scrapeAllStorms, getStormData } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const corsOptions = {
  origin: ['https://tropical-cyclopedia.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.static('public')); 

app.get('/archive/:basin/:year', (req, res) => {
  const year = req.params.year;
  const basin = req.params.basin;
  const filePath = path.join(__dirname, `./archive/${basin}/${year}.json`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err); 
      return res.status(404).send('File not found'); 
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error(parseError);
      res.status(500).send('Error parsing JSON data');
    }
  });
});

// Live storm data from Weather Underground / Weather.com API
app.get('/live', async (req, res) => {
  try {
    const data = await getStormData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching storm data:', error);
    res.status(500).json({ error: 'Failed to fetch storm data' });
  }
});

// Initial scrape on server start
console.log('Performing initial storm data scrape...');
scrapeAllStorms().catch(err => {
  console.error('Initial scrape failed:', err);
});

// Schedule regular scraping from Weather Underground
function scheduleAdvisoryScrapers() {
  // Weather.com/Weather Underground updates frequently
  // Scrape every hour to catch updates
  const intervalHours = 1;
  
  setInterval(() => {
    const now = new Date();
    console.log(`Running scheduled Weather Underground scrape at ${now.toISOString()}...`);
    scrapeAllStorms().catch(err => {
      console.error('Scheduled scrape failed:', err);
    });
  }, intervalHours * 60 * 60 * 1000); // Every hour
  
  console.log(`Scheduled scraping every ${intervalHours} hour(s) from Weather Underground`);
}

scheduleAdvisoryScrapers();

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));