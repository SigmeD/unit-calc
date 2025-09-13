/**
 * Unit тесты для хука useAppState
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppState } from '../useAppState';
import type { CalculationInput, CalculationResults, Scenario } from '../../types';

// Мокаем хук useScenarios
vi.mock('../useScenarios', () => ({
  useScenarios: () => ({
    loadScenariosFromStorage: vi.fn(() => []),
    saveScenario: vi.fn(),
    deleteScenario: vi.fn()
  })
}));

describe('useAppState', () => {
  const mockInput: CalculationInput = {
    purchasePrice: 500,
    deliveryToWarehouse: 50,
    packaging: 30,
    otherCOGS: 20,
    commission: 15,
    logistics: 100,
    storage: 50,
    returnProcessing: 10,
    pickupRate: 80,
    returnRate: 10,
    advertising: 150,
    otherVariableCosts: 25,
    fixedCostsPerMonth: 50000,
    expectedSalesPerMonth: 100,
    taxRegime: 'USN_6',
    retailPrice: 2000,
    sellerDiscount: 10,
    additionalPromo: 5,
    specificData: {}
  };

  const mockResults: CalculationResults = {
    revenue: 1197,
    cm1: 173.4,
    cm2: 23.4,
    netProfit: -604.2,
    marginPercent: -50.48,
    roi: -100.7,
    adRoi: -402.8,
    acos: 12.53,
    status: 'loss',
    breakEvenPrice: 3500,
    breakEvenVolume: Infinity,
    breakdown: {
      totalCOGS: 600,
      marketplaceFees: {
        commission: 256.5,
        logistics: 100,
        storage: 50,
        returns: 17.1,
        total: 423.6
      },
      additionalCosts: {
        advertising: 150,
        otherVariable: 25,
        fixedPerUnit: 500,
        total: 675
      },
      taxes: {
        amount: 102.6,
        rate: 0.06,
        base: 1710
      },
      totalCosts: 1801.2
    },
    effectivePrice: 1710,
    effectivePickupRate: 70
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Инициализация', () => {
    it('должен инициализироваться с корректными начальными значениями', () => {
      const { result } = renderHook(() => useAppState());

      expect(result.current.selectedMarketplace).toBe('wildberries');
      expect(result.current.currentScenario).toBeNull();
      expect(result.current.scenarios).toEqual([]);
      expect(result.current.input.retailPrice).toBe(1000);
      expect(result.current.results).toBeNull();
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('Управление маркетплейсом', () => {
    it('должен изменять выбранный маркетплейс', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setMarketplace('ozon');
      });

      expect(result.current.selectedMarketplace).toBe('ozon');
      expect(result.current.errors).toEqual({}); // Ошибки должны сбрасываться
    });
  });

  describe('Управление входными данными', () => {
    it('должен обновлять входные данные', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.updateInput({ retailPrice: 1500 });
      });

      expect(result.current.input.retailPrice).toBe(1500);
      // Остальные поля должны остаться неизменными
      expect(result.current.input.purchasePrice).toBe(0);
    });

    it('должен обновлять несколько полей одновременно', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.updateInput({
          retailPrice: 1500,
          purchasePrice: 800,
          commission: 18
        });
      });

      expect(result.current.input.retailPrice).toBe(1500);
      expect(result.current.input.purchasePrice).toBe(800);
      expect(result.current.input.commission).toBe(18);
    });
  });

  describe('Управление результатами', () => {
    it('должен устанавливать результаты расчетов', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setResults(mockResults);
      });

      expect(result.current.results).toEqual(mockResults);
      expect(result.current.isCalculating).toBe(false);
    });
  });

  describe('Управление сценариями', () => {
    it('должен сохранять новый сценарий', () => {
      const { result } = renderHook(() => useAppState());

      const scenario: Scenario = {
        id: 'test-scenario',
        name: 'Тестовый сценарий',
        description: 'Описание',
        input: mockInput,
        results: mockResults,
        marketplace: 'wildberries',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      act(() => {
        result.current.saveScenario(scenario);
      });

      expect(result.current.scenarios).toHaveLength(1);
      expect(result.current.scenarios[0].name).toBe('Тестовый сценарий');
    });

    it('должен загружать сценарий', () => {
      const { result } = renderHook(() => useAppState());

      const scenario: Scenario = {
        id: 'test-scenario',
        name: 'Тестовый сценарий',
        description: 'Описание',
        input: mockInput,
        results: mockResults,
        marketplace: 'wildberries',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Сначала сохраняем сценарий
      act(() => {
        result.current.saveScenario(scenario);
      });

      // Создаем новый сценарий для проверки смены
      act(() => {
        result.current.newScenario();
      });

      // Загружаем сохраненный сценарий - используем реальный ID из сохраненного сценария
      const savedScenarioId = result.current.scenarios[0]?.id;
      act(() => {
        result.current.loadScenario(savedScenarioId);
      });

      expect(result.current.currentScenario).toBe(savedScenarioId);
      expect(result.current.input).toEqual(mockInput);
      expect(result.current.results).toEqual(mockResults);
    });

    it('должен удалять сценарий', () => {
      const { result } = renderHook(() => useAppState());

      const scenario: Scenario = {
        id: 'test-scenario',
        name: 'Тестовый сценарий',
        description: 'Описание',
        input: mockInput,
        results: mockResults,
        marketplace: 'wildberries',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Сохраняем сценарий
      act(() => {
        result.current.saveScenario(scenario);
      });

      expect(result.current.scenarios).toHaveLength(1);

      // Удаляем сценарий - используем реальный ID
      const savedScenarioId = result.current.scenarios[0]?.id;
      act(() => {
        result.current.deleteScenario(savedScenarioId);
      });

      expect(result.current.scenarios).toHaveLength(0);
      expect(result.current.currentScenario).toBeNull();
    });

    it('должен создавать новый сценарий с начальными значениями для Wildberries', () => {
      const { result } = renderHook(() => useAppState());

      // Устанавливаем Wildberries
      act(() => {
        result.current.setMarketplace('wildberries');
      });

      act(() => {
        result.current.newScenario();
      });

      expect(result.current.currentScenario).toBeNull();
      expect(result.current.input.commission).toBe(17); // Комиссия WB
      expect(result.current.input.pickupRate).toBe(70); // Выкуп WB
      expect(result.current.input.returnRate).toBe(15); // Возвраты WB
      expect(result.current.results).toBeNull();
      expect(result.current.errors).toEqual({});
    });

    it('должен создавать новый сценарий с начальными значениями для Ozon', () => {
      const { result } = renderHook(() => useAppState());

      // Устанавливаем Ozon
      act(() => {
        result.current.setMarketplace('ozon');
      });

      act(() => {
        result.current.newScenario();
      });

      expect(result.current.input.commission).toBe(15); // Комиссия Ozon
      expect(result.current.input.logistics).toBe(35); // Логистика Ozon
      expect(result.current.input.pickupRate).toBe(65); // Выкуп Ozon
      expect(result.current.input.returnRate).toBe(20); // Возвраты Ozon
    });
  });

  describe('Управление состоянием расчетов', () => {
    it('должен устанавливать состояние расчета', () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setCalculating(true);
      });

      expect(result.current.isCalculating).toBe(true);

      act(() => {
        result.current.setCalculating(false);
      });

      expect(result.current.isCalculating).toBe(false);
    });
  });

  describe('Управление ошибками', () => {
    it('должен устанавливать ошибки', () => {
      const { result } = renderHook(() => useAppState());

      const errors = {
        price: 'Цена должна быть больше 0',
        commission: 'Некорректная комиссия'
      };

      act(() => {
        result.current.setErrors(errors);
      });

      expect(result.current.errors).toEqual(errors);
    });

    it('должен очищать ошибки', () => {
      const { result } = renderHook(() => useAppState());

      // Сначала устанавливаем ошибки
      act(() => {
        result.current.setErrors({ price: 'Ошибка цены' });
      });

      expect(result.current.errors).toEqual({ price: 'Ошибка цены' });

      // Очищаем ошибки
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('Утилиты', () => {
    it('должен возвращать текущий сценарий', () => {
      const { result } = renderHook(() => useAppState());

      const scenario: Scenario = {
        id: 'test-scenario',
        name: 'Тестовый сценарий',
        description: 'Описание',
        input: mockInput,
        results: mockResults,
        marketplace: 'wildberries',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Сохраняем и загружаем сценарий
      act(() => {
        result.current.saveScenario(scenario);
      });
      
      const savedScenario = result.current.scenarios[0];
      act(() => {
        result.current.loadScenario(savedScenario.id);
      });

      expect(result.current.getCurrentScenario).toEqual(savedScenario);
    });

    it('должен определять наличие несохраненных изменений', () => {
      const { result } = renderHook(() => useAppState());

      // Изначально есть несохраненные изменения (новый сценарий)
      expect(result.current.hasUnsavedChanges).toBe(true);

      const scenario: Scenario = {
        id: 'test-scenario',
        name: 'Тестовый сценарий',
        description: 'Описание',
        input: result.current.input, // Используем текущий input
        results: mockResults,
        marketplace: 'wildberries',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Сохраняем текущее состояние
      act(() => {
        result.current.saveScenario(scenario);
        result.current.loadScenario('test-scenario');
      });

      // Теперь изменений нет
      expect(result.current.hasUnsavedChanges).toBe(false);

      // Изменяем данные
      act(() => {
        result.current.updateInput({ retailPrice: 1500 });
      });

      // Появились несохраненные изменения
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Обновление сценариев', () => {
    it('должен обновлять существующий сценарий', () => {
      const { result } = renderHook(() => useAppState());

      const originalScenario: Scenario = {
        id: 'test-scenario',
        name: 'Оригинальный сценарий',
        description: 'Описание',
        input: mockInput,
        results: mockResults,
        marketplace: 'wildberries',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Сохраняем сценарий
      act(() => {
        result.current.saveScenario(originalScenario);
      });

      const savedScenario = result.current.scenarios[0];
      expect(savedScenario.name).toBe('Оригинальный сценарий');

      // Обновляем сценарий - используем ID из сохраненного
      const updatedScenario: Scenario = {
        ...savedScenario,
        name: 'Обновленный сценарий',
        updatedAt: new Date()
      };

      act(() => {
        result.current.saveScenario(updatedScenario);
      });

      expect(result.current.scenarios).toHaveLength(1); // Количество не изменилось
      expect(result.current.scenarios[0].name).toBe('Обновленный сценарий');
    });
  });
});
