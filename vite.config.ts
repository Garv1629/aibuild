import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { apiServerPlugin } from './server/vitePlugin';

export default defineConfig(({ command }) => {
  const isVercel = Boolean(process.env.VERCEL);
  return {
    base: isVercel || command === 'serve' ? '/' : '/aibuild/',
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    build: {
      emptyOutDir: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['motion'],
            'vendor-lenis': ['lenis'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/dist/**', '**/docs/**', '**/.git/**', '**/node_modules/**', '**/data/**'],
      },
    },
  };
});

