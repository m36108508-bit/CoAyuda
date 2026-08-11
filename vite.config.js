import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Red Sismo Colombia',
        short_name: 'Red Sismo',
        description: 'Ayuda entre vecinos tras el terremoto: personas desaparecidas, zonas críticas y guía de emergencia. Funciona sin internet.',
        theme_color: '#1c1917',
        background_color: '#f7f5f0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // App shell disponible 100% offline. Los datos van por Supabase (red)
        // y se guardan en cola local cuando no hay conexión (ver src/lib/offlineQueue.js).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ]
})
