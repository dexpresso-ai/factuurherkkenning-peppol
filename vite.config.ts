import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // TODO: Bij koppelen aan echte .NET backend, voeg proxy toe:
    // proxy: {
    //   '/api': {
    //     target: 'https://localhost:5001',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});
