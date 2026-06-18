import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxifie /api vers le serveur Express en dev
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxifie les connexions Socket.IO vers le backend
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      // Proxifie les fichiers uploadés (stockés dans server/uploads/)
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
