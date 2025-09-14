import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  build: {
    // Оптимизация производительности
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Выделяем vendor библиотеки в отдельный чанк
          vendor: ['react', 'react-dom'],
          // Выделяем xlsx в отдельный чанк (тяжелая библиотека)
          xlsx: ['xlsx']
        }
      }
    },
    // Оптимизация чанков
    chunkSizeWarningLimit: 1000
  },
  // Оптимизация development режима
  optimizeDeps: {
    include: ['react', 'react-dom', 'xlsx']
  }
})
