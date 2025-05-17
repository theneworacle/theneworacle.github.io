import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { plugin as markdown } from 'vite-plugin-markdown';

export default defineConfig({
  plugins: [react(), markdown()],
  resolve: {
    alias: {
      // Polyfill Node.js modules
      process: 'process/browser',
      buffer: 'buffer/',
    },
  },
});
