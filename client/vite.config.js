import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/notifications': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/pins': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/comments': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,  // Enable proxying WebSocket for Socket.IO chat
      },
       historyApiFallback: true,
      // Add other API routes here as needed
    }
  }
});
