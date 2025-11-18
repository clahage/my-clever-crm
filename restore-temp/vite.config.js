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
      // Ignore backup folders
      deny: [
        '**/backups/**',
        '**/src_broken_backup_*/**',
        '**/src_working_backup_*/**'
      ]
    }
  }
})
