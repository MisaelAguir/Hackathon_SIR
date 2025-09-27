// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config simple: sin path, sin __dirname, sin 'url'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',      // atajo para importar desde src: "@/..."
    },
  },
  server: {
    host: true,         // permite localhost y red
    port: 5174,         // fuerza el puerto
  },
})