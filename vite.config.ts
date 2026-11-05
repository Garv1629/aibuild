import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

try {
  const destPublicJpg = path.resolve('public', 'og-image.jpg');
  const destPublicPng = path.resolve('public', 'og-image.png');
  const destDistJpg = path.resolve('dist', 'og-image.jpg');
  const destDistPng = path.resolve('dist', 'og-image.png');
  const favPublic = path.resolve('public', 'favicon.svg');
  const favDist = path.resolve('dist', 'favicon.svg');
  const robotsPublic = path.resolve('public', 'robots.txt');
  const robotsDist = path.resolve('dist', 'robots.txt');
  const sitemapPublic = path.resolve('public', 'sitemap.xml');
  const sitemapDist = path.resolve('dist', 'sitemap.xml');

  if (fs.existsSync(path.resolve('dist'))) {
    if (fs.existsSync(destPublicJpg)) fs.copyFileSync(destPublicJpg, destDistJpg);
    if (fs.existsSync(destPublicPng)) fs.copyFileSync(destPublicPng, destDistPng);
    if (fs.existsSync(favPublic)) fs.copyFileSync(favPublic, favDist);
    if (fs.existsSync(robotsPublic)) fs.copyFileSync(robotsPublic, robotsDist);
    if (fs.existsSync(sitemapPublic)) fs.copyFileSync(sitemapPublic, sitemapDist);
  }
} catch (e) {}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger'],
    },
    build: {
      emptyOutDir: true,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion') || id.includes('motion')) return 'motion';
              if (id.includes('gsap') || id.includes('hls.js')) return 'media-fx';
              if (id.includes('lucide-react')) return 'icons';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
