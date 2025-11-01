import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: null, // Disable PostCSS
  },
  server: {
    port: 5173,
     // Don't try other ports if 5173 is taken
  },
})