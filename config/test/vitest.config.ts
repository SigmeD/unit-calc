/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    
    // Оптимизация производительности тестов
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Улучшенная обработка timeout'ов
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    
    // Оптимизация coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/setupTests.ts',
        '**/vite.config.ts',
        '**/vitest.config.ts'
      ],
      // Целевые показатели покрытия (Фаза 5)
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Улучшенная работа с изменениями файлов
    watch: {
      ignore: ['node_modules/', 'dist/', 'coverage/']
    },
    
    // Оптимизация перезапуска тестов
    isolate: false,
    
    // Улучшенная отчетность
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  }
})
