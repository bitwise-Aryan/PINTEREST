import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite's dev server to proxy requests starting with /notifications
    proxy: {
      '/notifications': {
        // Target your backend server running on port 3000
        target: 'http://localhost:3000', 
        // This is necessary to change the Origin header for CORS
        changeOrigin: true, 
        // Rewrite the path, removing the /notifications prefix before forwarding (optional, but clean)
        // Since your Express routes start with /notifications, we usually don't rewrite it.
      },
      // If you have other API routes (e.g., /users, /pins, /comments), you should proxy those too:
      '/users': { target: 'http://localhost:3000', changeOrigin: true },
      '/pins': { target: 'http://localhost:3000', changeOrigin: true },
      '/comments': { target: 'http://localhost:3000', changeOrigin: true },
    }
  }
});
