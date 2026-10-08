import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from '../server/apiRouter.js';
import { db } from '../server/db.js';

let initialized = false;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!initialized) {
    try {
      db.init();
      initialized = true;
    } catch (e) {
      console.warn('[Vercel Serverless] DB init note:', e);
    }
  }

  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
}
