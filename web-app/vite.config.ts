import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pixelfy Web (laptop-first) — local-only; no backend calls.
// host:true + allowedHosts:true lets the Arena live-preview proxy reach the dev server.
export default defineConfig({
  plugins: [react()],
  define: {
    BUILD_TIME: JSON.stringify(new Date().toISOString()),
  },
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
})
