import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    assetsInlineLimit: 0,
    cssCodeSplit: false
  },
  server: {
    mimeTypes: {
      'js': 'application/javascript',
      'mjs': 'application/javascript'
    }
  }
})
