/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    // Оптимизация производительности тестов
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2
      }
    },
    // Кэширование тестов
    cache: {
      dir: './node_modules/.vitest'
    },
    // Параллельное выполнение
    maxConcurrency: 4,
    // Оптимизация coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Исключаем файлы конфигурации и тестов
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/setupTests.ts',
        '**/TestApp.tsx',
        '**/TestComponents.tsx',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/tailwind.config.cjs',
        '**/postcss.config.mjs',
        '**/eslint.config.js',
        '**/tsconfig*.json'
      ],
      // Настройки покрытия
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
