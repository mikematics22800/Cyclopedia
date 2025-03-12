import express from 'express';
import cors from 'cors'; 
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
const corsOptions = {
  origin: ['https://storm-cyclopedia.com', 'http://localhost:4173', 'http://localhost:5173', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.static('public')); 

app.get('/:basin/:year', (req, res) => {
  const year = req.params.year;
  const basin = req.params.basin;
  const filePath = path.join(__dirname, `./${basin}/${year}.json`);

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

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));