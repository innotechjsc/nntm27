import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://localhost:4201'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4203,
    host: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
