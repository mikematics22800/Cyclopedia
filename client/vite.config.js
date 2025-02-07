import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import manifest from './public/manifest.json'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      manifest,
      workbox: {
        globPatterns: ["**/*"],
        maximumFileSizeToCacheInBytes: 5242880
      },
      includeAssets: [ "**/*"],
      registerType: 'autoUpdate',
    })
  ]
})