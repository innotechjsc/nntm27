import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev: localhost. Docker: set VITE_API_TARGET=http://agriverse-api:4201
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:4201'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4202,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})

