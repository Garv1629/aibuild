import type { Plugin } from 'vite';
import { handleApiRequest } from './apiRouter.js';
import { db } from './db.js';

export function apiServerPlugin(): Plugin {
  return {
    name: 'aibuild-api-server',
    configureServer(server) {
      // Initialize database
      db.init();
      console.log('[Vite API Plugin] Persistent Database Backend Mounted on /api/*');

      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          console.error('[API Middleware Error]:', err);
          next(err);
        }
      });
    },
    configurePreviewServer(server) {
      db.init();
      console.log('[Vite Preview API Plugin] Persistent Database Backend Mounted on /api/*');

      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApiRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          console.error('[Preview API Middleware Error]:', err);
          next(err);
        }
      });
    },
  };
}
