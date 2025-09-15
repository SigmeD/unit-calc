import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll, afterAll } from 'vitest'

// Оптимизация производительности тестов - Фаза 5
// Глобальная очистка после каждого теста
afterEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// Настройка перед всеми тестами
beforeAll(() => {
  // Увеличиваем timeout для медленных тестов
  vi.setConfig({ testTimeout: 10000 })
})

// Очистка после всех тестов
afterAll(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

// Мокаем window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Мокаем ResizeObserver для компонентов с динамическими размерами
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Мокаем IntersectionObserver для компонентов с lazy loading
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Оптимизация DOM операций
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue('')
  }))
})

// Мокаем localStorage для тестов с персистентностью
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Мокаем URL.createObjectURL для Excel export тестов
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Отключаем console.log в тестах для чистоты вывода (кроме ошибок)
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: console.warn, // Оставляем warnings
  error: console.error, // Оставляем errors
}
