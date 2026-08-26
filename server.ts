import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './src/server/apiRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON body for incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle API requests via unified router
app.use('/api', (req, res, next) => {
  // Ensure req.url starts with /api for handler matching or strip appropriately
  req.url = '/api' + (req.url === '/' ? '' : req.url);
  handleApiRequest(req, res, next);
});

// Serve compiled frontend production assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[HaulBack Server] Running on http://0.0.0.0:${PORT}`);
});
