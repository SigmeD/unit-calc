/**
 * Утилиты для оптимизации производительности тестов - Фаза 5
 * Создано в рамках пятой фазы TESTING_COVERAGE_ROADMAP.md
 */

import { vi } from 'vitest'
import type { RenderOptions } from '@testing-library/react'
import { render, cleanup } from '@testing-library/react'
import type { ReactElement } from 'react'

/**
 * Оптимизированная функция рендеринга для тестов
 * Автоматически очищает DOM и моки после рендеринга
 */
export const optimizedRender = (
  ui: ReactElement,
  options?: RenderOptions
) => {
  // Очистка предыдущих рендеров
  cleanup()
  
  // Рендер с автоматической очисткой
  const result = render(ui, {
    ...options,
    // Отключаем строгий режим для ускорения тестов
    wrapper: options?.wrapper
  })
  
  return result
}

/**
 * Создает оптимизированные моки для хуков
 */
export const createOptimizedMocks = () => {
  const mockUseAppState = vi.fn(() => ({
    selectedMarketplace: 'wildberries',
    inputData: {
      purchasePrice: 0,
      deliveryToWarehouse: 0,
      packaging: 0,
      otherCOGS: 0,
      commission: 17,
      logistics: 0,
      storage: 0,
      returnProcessing: 0,
      pickupRate: 70,
      returnRate: 15,
      advertising: 0,
      otherVariableCosts: 0,
      fixedCostsPerMonth: 0,
      taxRegime: 'USN_6' as const,
      retailPrice: 0,
      sellerDiscount: 0,
      additionalPromo: 0
    },
    scenarios: [],
    currentScenario: 0,
    dispatch: vi.fn(),
    errors: {},
    isValid: true
  }))

  const mockUseCalculations = vi.fn(() => ({
    results: {
      cm1: 0,
      cm2: 0,
      netProfit: 0,
      marginPercent: 0,
      roi: 0,
      adRoi: 0,
      acos: 0,
      breakEvenPrice: 0,
      breakEvenVolume: 0,
      status: 'loss' as const,
      breakdown: {
        revenue: 0,
        totalCOGS: 0,
        marketplaceFees: 0,
        taxes: 0,
        advertising: 0,
        variableCosts: 0,
        fixedCosts: 0
      }
    },
    isCalculating: false,
    lastCalculated: new Date()
  }))

  const mockUseExport = vi.fn(() => ({
    exportCurrentScenario: vi.fn(),
    exportDataOnly: vi.fn(),
    canExport: vi.fn().mockReturnValue(true),
    getExportInfo: vi.fn().mockReturnValue({
      scenarioName: 'Test Scenario',
      marketplaceName: 'Wildberries',
      dataPoints: 10,
      calculatedMetrics: 8
    }),
    isExporting: false
  }))

  const mockUseMarketplace = vi.fn(() => ({
    marketplaces: [
      { id: 'wildberries', name: 'Wildberries' },
      { id: 'ozon', name: 'Ozon' }
    ],
    selectedMarketplace: { id: 'wildberries', name: 'Wildberries' },
    setSelectedMarketplace: vi.fn(),
    getMarketplaceDefaults: vi.fn().mockReturnValue({}),
    validateMarketplaceData: vi.fn().mockReturnValue({ isValid: true, errors: {} })
  }))

  const mockUseScenarios = vi.fn(() => ({
    scenarios: [],
    currentScenario: 0,
    saveCurrentScenario: vi.fn(),
    loadScenario: vi.fn(),
    deleteScenario: vi.fn(),
    createNewScenario: vi.fn(),
    canSaveScenario: vi.fn().mockReturnValue(true),
    getScenarioSummary: vi.fn().mockReturnValue({
      name: 'Test',
      marketplace: 'wildberries',
      isValid: true
    })
  }))

  return {
    mockUseAppState,
    mockUseCalculations,
    mockUseExport,
    mockUseMarketplace,
    mockUseScenarios
  }
}

/**
 * Быстрое создание тестовых данных для различных сценариев
 */
export const createTestData = {
  /**
   * Базовые входные данные для тестов
   */
  basicInput: () => ({
    purchasePrice: 300,
    deliveryToWarehouse: 50,
    packaging: 20,
    otherCOGS: 30,
    commission: 17,
    logistics: 0,
    storage: 10,
    returnProcessing: 20,
    pickupRate: 70,
    returnRate: 15,
    advertising: 100,
    otherVariableCosts: 50,
    fixedCostsPerMonth: 10000,
    taxRegime: 'USN_6' as const,
    retailPrice: 1000,
    sellerDiscount: 10,
    additionalPromo: 5
  }),

  /**
   * Результаты расчетов для тестов
   */
  basicResults: () => ({
    cm1: 450,
    cm2: 350,
    netProfit: 300,
    marginPercent: 30,
    roi: 100,
    adRoi: 300,
    acos: 25,
    breakEvenPrice: 700,
    breakEvenVolume: 30,
    status: 'profit' as const,
    breakdown: {
      revenue: 850,
      totalCOGS: 400,
      marketplaceFees: 144.5,
      taxes: 51,
      advertising: 100,
      variableCosts: 50,
      fixedCosts: 333.33
    }
  }),

  /**
   * Сценарии для тестов
   */
  scenarios: () => [
    {
      id: '1',
      name: 'Тестовый сценарий 1',
      description: 'Базовый сценарий для тестирования',
      marketplace: 'wildberries' as const,
      inputData: createTestData.basicInput(),
      results: createTestData.basicResults(),
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-15')
    },
    {
      id: '2',
      name: 'Тестовый сценарий 2',
      description: 'Убыточный сценарий',
      marketplace: 'ozon' as const,
      inputData: { ...createTestData.basicInput(), retailPrice: 500 },
      results: { ...createTestData.basicResults(), status: 'loss' as const },
      createdAt: new Date('2025-09-14'),
      updatedAt: new Date('2025-09-14')
    }
  ]
}

/**
 * Профилирование производительности тестов
 */
export const testPerformance = {
  /**
   * Замеряет время выполнения функции
   */
  measureTime: async <T>(fn: () => T | Promise<T>, label?: string): Promise<{ result: T; time: number }> => {
    const start = performance.now()
    const result = await fn()
    const time = performance.now() - start
    
    if (label) {
      console.log(`⏱️ ${label}: ${time.toFixed(2)}ms`)
    }
    
    return { result, time }
  },

  /**
   * Создает benchmark для сравнения производительности
   */
  benchmark: async (tests: Array<{ name: string; fn: () => any }>) => {
    const results = []
    
    for (const test of tests) {
      const { time } = await testPerformance.measureTime(test.fn, test.name)
      results.push({ name: test.name, time })
    }
    
    // Сортируем по времени выполнения
    results.sort((a, b) => a.time - b.time)
    
    console.log('\n📊 Benchmark Results:')
    results.forEach((result, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
      console.log(`${emoji} ${result.name}: ${result.time.toFixed(2)}ms`)
    })
    
    return results
  }
}

/**
 * Хелперы для работы с async компонентами
 */
export const asyncHelpers = {
  /**
   * Ожидает выполнения всех промисов в компоненте
   */
  waitForAsyncOperations: async (timeout = 1000) => {
    await new Promise(resolve => {
      setTimeout(resolve, 0) // Следующий тик
    })
    
    // Ждем выполнения микротасков
    await Promise.resolve()
  },

  /**
   * Создает mock промиса с контролем разрешения
   */
  createControlledPromise: <T>() => {
    let resolve: (value: T) => void
    let reject: (reason?: any) => void
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    
    return {
      promise,
      resolve: resolve!,
      reject: reject!
    }
  }
}

/**
 * Настройки для оптимизации отдельных типов тестов
 */
export const testOptimizationConfigs = {
  /**
   * Конфигурация для UI тестов
   */
  ui: {
    // Отключаем анимации для ускорения
    beforeEach: () => {
      document.documentElement.style.setProperty('--animation-duration', '0s')
      document.documentElement.style.setProperty('--transition-duration', '0s')
    },
    
    // Очистка стилей после тестов
    afterEach: () => {
      document.documentElement.style.removeProperty('--animation-duration')
      document.documentElement.style.removeProperty('--transition-duration')
    }
  },

  /**
   * Конфигурация для интеграционных тестов
   */
  integration: {
    timeout: 15000, // Больше времени для сложных сценариев
    retries: 2 // Повторы для нестабильных тестов
  },

  /**
   * Конфигурация для unit тестов
   */
  unit: {
    timeout: 5000, // Быстрые unit тесты
    retries: 0 // Без повторов для детерминированных тестов
  }
}
