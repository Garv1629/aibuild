import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const isVercel = Boolean(process.env.VERCEL);
  return {
    base: isVercel || command === 'serve' ? '/' : '/aibuild/',
    plugins: [react(), tailwindcss()],
    build: {
      emptyOutDir: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/dist/**', '**/docs/**', '**/.git/**', '**/node_modules/**'],
      },
    },
  };
});
