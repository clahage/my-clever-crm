import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    fs: {
      deny: [
        '**/backups/**',
        '**/src_broken_backup_*/**',
        '**/src_working_backup_*/**'
      ]
    },
    // FIX: Make sure all routes fallback to index.html (SPA routing)
    historyApiFallback: true
  },
  // ALSO ADD: Build configuration for production
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})