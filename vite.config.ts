import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/utils': '/src/utils',
      '@/hooks': '/src/hooks',
      '@/types': '/src/types',
      '@/calculations': '/src/calculations',
      '@/data': '/src/data'
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  build: {
    // Оптимизация производительности
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false, // Отключаем source maps для продакшена
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Выделяем vendor библиотеки в отдельный чанк
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('xlsx')) {
              return 'vendor-xlsx';
            }
            if (id.includes('@testing-library') || id.includes('vitest') || id.includes('jsdom')) {
              return 'vendor-test';
            }
            return 'vendor';
          }
          // Группируем компоненты по функциональности
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/components/forms/')) {
            return 'form-components';
          }
          if (id.includes('/calculations/')) {
            return 'calculations';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
        // Оптимизация имен файлов
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Оптимизация чанков
    chunkSizeWarningLimit: 1000,
    // Оптимизация CSS
    cssCodeSplit: true,
    // Оптимизация ассетов
    assetsInlineLimit: 4096
  },
  // Оптимизация development режима
  optimizeDeps: {
    include: ['react', 'react-dom', 'xlsx'],
    exclude: ['@testing-library/jest-dom', 'vitest']
  },
  // Дополнительные оптимизации
  esbuild: {
    // Удаляем console.log в продакшене
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Оптимизация JSX
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  // Оптимизация CSS
  css: {
    devSourcemap: false
  }
})
