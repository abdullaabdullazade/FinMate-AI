import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite konfiqurasiyası - React app üçün
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Backend API-yə proxy - CORS problemlərini həll edir
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

