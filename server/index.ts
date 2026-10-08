import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest, applySecurityHeaders } from './apiRouter.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const PORT = process.env.PORT || 5173;

// MIME type map
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Initialize Database
db.init();

const server = http.createServer(async (req, res) => {
  // 1. Check if it's an API request
  const handled = await handleApiRequest(req, res);
  if (handled) return;

  // Apply baseline security headers
  applySecurityHeaders(res, false);

  // 2. Serve static production files
  let reqPath = req.url?.split('?')[0] || '/';
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isHashedAsset = reqPath.startsWith('/assets/');
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isHashedAsset
        ? 'public, max-age=31536000, immutable'
        : ext === '.html'
        ? 'no-cache, no-store, must-revalidate'
        : 'public, max-age=86400',
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA Fallback: serve index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[AI Build CMS Server] Running on http://localhost:${PORT}`);
  console.log(`[Database] Persistent storage mounted at /api/*`);
});
