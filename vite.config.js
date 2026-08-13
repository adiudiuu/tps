import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      useCredentials: false,
      manifest: {
        name: 'GPU/LLM 推理速度与显存估算',
        short_name: 'TPS Calculator',
        description: '估算 Qwen3.8-Max（已开源）/ DeepSeek V4 / Kimi K3 等在 RTX 5090、H200、B200 上的 TPS 与显存 / Estimate TPS & VRAM. 403 models, 251 GPUs (2026-08).',
        lang: 'zh-CN',
        theme_color: '#ffffff',
        background_color: '#f9fafb',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['productivity', 'utilities', 'developer tools'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    historyApiFallback: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'chart-vendor'
          if (id.includes('vue-router') || id.includes('vue-i18n')) return 'vue-vendor'
          if (id.includes('node_modules/vue/')) return 'vue-vendor'
          if (id.includes('src/data/gpus')) return 'gpu-data'
          if (id.includes('src/data/models')) return 'model-data'
        },
      },
    },
  },
})
