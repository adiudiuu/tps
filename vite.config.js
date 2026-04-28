import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
