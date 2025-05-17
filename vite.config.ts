import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { plugin as markdown } from 'vite-plugin-markdown';
import path from 'path';

export default defineConfig({
  plugins: [react(), markdown()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      // Polyfill Node.js modules
      process: 'process/browser',
      buffer: 'buffer/',
    },
  },
});
