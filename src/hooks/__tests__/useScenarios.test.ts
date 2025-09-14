/**
 * Unit тесты для хука useScenarios
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScenarios } from '../useScenarios';
import type { Scenario, CalculationInput, CalculationResults } from '../../types';

// Мокаем localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useScenarios', () => {
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
    breakEvenVolume: 1000, // Заменяем Infinity на число для JSON сериализации
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

  const createMockScenario = (overrides: Partial<Scenario> = {}): Scenario => ({
    id: 'test-scenario-1',
    name: 'Тестовый сценарий',
    description: 'Описание тестового сценария',
    input: mockInput,
    results: mockResults,
    marketplace: 'wildberries',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Инициализация', () => {
    it('должен возвращать корректную структуру функций', () => {
      const { result } = renderHook(() => useScenarios());

      expect(result.current.loadScenariosFromStorage).toBeInstanceOf(Function);
      expect(result.current.saveScenario).toBeInstanceOf(Function);
      expect(result.current.updateScenario).toBeInstanceOf(Function);
      expect(result.current.deleteScenario).toBeInstanceOf(Function);
      expect(result.current.getScenario).toBeInstanceOf(Function);
      expect(result.current.isNameUnique).toBeInstanceOf(Function);
      expect(result.current.generateUniqueName).toBeInstanceOf(Function);
      expect(result.current.copyScenario).toBeInstanceOf(Function);
      expect(result.current.clearAllScenarios).toBeInstanceOf(Function);
      expect(result.current.maxScenarios).toBe(3);
    });
  });

  describe('Загрузка сценариев', () => {
    it('должен загружать пустой массив при отсутствии данных', () => {
      const { result } = renderHook(() => useScenarios());

      const scenarios = result.current.loadScenariosFromStorage();

      expect(scenarios).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('unit-calc-scenarios');
    });

    it('должен загружать сценарии из localStorage', () => {
      const mockScenario = createMockScenario();
      const storedData = JSON.stringify([mockScenario]);
      localStorageMock.setItem('unit-calc-scenarios', storedData);

      const { result } = renderHook(() => useScenarios());

      const scenarios = result.current.loadScenariosFromStorage();

      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].name).toBe('Тестовый сценарий');
      expect(scenarios[0].createdAt).toBeInstanceOf(Date);
      expect(scenarios[0].updatedAt).toBeInstanceOf(Date);
    });

    it('должен обрабатывать ошибки при загрузке некорректных данных', () => {
      localStorageMock.setItem('unit-calc-scenarios', 'invalid json');

      const { result } = renderHook(() => useScenarios());

      const scenarios = result.current.loadScenariosFromStorage();

      expect(scenarios).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Ошибка загрузки сценариев из LocalStorage:', expect.any(SyntaxError));
    });
  });

  describe('Сохранение сценариев', () => {
    it('должен сохранять новый сценарий', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();

      const savedScenario = result.current.saveScenario(mockScenario);

      expect(savedScenario).toEqual(mockScenario);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'unit-calc-scenarios',
        JSON.stringify([mockScenario])
      );
    });

    it('должен удалять самый старый сценарий при превышении лимита', () => {
      const { result } = renderHook(() => useScenarios());
      
      // Создаем 3 сценария
      const scenario1 = createMockScenario({ 
        id: 'scenario-1', 
        name: 'Сценарий 1',
        createdAt: new Date('2023-01-01')
      });
      const scenario2 = createMockScenario({ 
        id: 'scenario-2', 
        name: 'Сценарий 2',
        createdAt: new Date('2023-01-02')
      });
      const scenario3 = createMockScenario({ 
        id: 'scenario-3', 
        name: 'Сценарий 3',
        createdAt: new Date('2023-01-03')
      });

      // Сохраняем первые 3 сценария
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([scenario1, scenario2, scenario3]));

      // Добавляем 4-й сценарий
      const scenario4 = createMockScenario({ 
        id: 'scenario-4', 
        name: 'Сценарий 4',
        createdAt: new Date('2023-01-04')
      });

      result.current.saveScenario(scenario4);

      // Проверяем, что остались только 3 сценария и удален самый старый
      const lastCall = localStorageMock.setItem.mock.calls.at(-1);
      const savedData = JSON.parse(lastCall?.[1] || '[]');
      
      expect(savedData).toHaveLength(3);
      expect(savedData.find((s: Scenario) => s.id === 'scenario-1')).toBeUndefined(); // Самый старый удален
      expect(savedData.find((s: Scenario) => s.id === 'scenario-4')).toBeDefined(); // Новый добавлен
    });

    it('должен обрабатывать ошибки при сохранении', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();

      // Не должно вызывать исключение
      expect(() => result.current.saveScenario(mockScenario)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('Ошибка сохранения сценариев в LocalStorage:', expect.any(Error));
    });
  });

  describe('Обновление сценариев', () => {
    it('должен обновлять существующий сценарий', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();
      
      // Сохраняем начальный сценарий
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const updates = { name: 'Обновленное название' };
      const updatedScenario = result.current.updateScenario('test-scenario-1', updates);

      expect(updatedScenario).toBeDefined();
      expect(updatedScenario?.name).toBe('Обновленное название');
      expect(updatedScenario?.updatedAt).toBeInstanceOf(Date);
      
      // Проверяем, что данные сохранены
      const lastCall = localStorageMock.setItem.mock.calls.at(-1);
      const savedData = JSON.parse(lastCall?.[1] || '[]');
      expect(savedData[0].name).toBe('Обновленное название');
    });

    it('должен возвращать null для несуществующего сценария', () => {
      const { result } = renderHook(() => useScenarios());

      const updatedScenario = result.current.updateScenario('non-existent', { name: 'Test' });

      expect(updatedScenario).toBeNull();
    });
  });

  describe('Удаление сценариев', () => {
    it('должен удалять сценарий по ID', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario1 = createMockScenario({ id: 'scenario-1' });
      const mockScenario2 = createMockScenario({ id: 'scenario-2' });
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario1, mockScenario2]));

      const remainingScenarios = result.current.deleteScenario('scenario-1');

      expect(remainingScenarios).toHaveLength(1);
      expect(remainingScenarios[0].id).toBe('scenario-2');
      
      const lastCall = localStorageMock.setItem.mock.calls.at(-1);
      const savedData = JSON.parse(lastCall?.[1] || '[]');
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('scenario-2');
    });

    it('должен возвращать неизмененный массив при удалении несуществующего сценария', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const remainingScenarios = result.current.deleteScenario('non-existent');

      expect(remainingScenarios).toHaveLength(1);
      expect(remainingScenarios[0].id).toBe('test-scenario-1');
    });
  });

  describe('Получение сценария', () => {
    it('должен возвращать сценарий по ID', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const scenario = result.current.getScenario('test-scenario-1');

      expect(scenario).toBeDefined();
      expect(scenario?.name).toBe('Тестовый сценарий');
    });

    it('должен возвращать null для несуществующего сценария', () => {
      const { result } = renderHook(() => useScenarios());

      const scenario = result.current.getScenario('non-existent');

      expect(scenario).toBeNull();
    });
  });

  describe('Проверка уникальности имени', () => {
    it('должен возвращать true для уникального имени', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario({ name: 'Существующий сценарий' });
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const isUnique = result.current.isNameUnique('Новый сценарий');

      expect(isUnique).toBe(true);
    });

    it('должен возвращать false для существующего имени', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario({ name: 'Существующий сценарий' });
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const isUnique = result.current.isNameUnique('Существующий сценарий');

      expect(isUnique).toBe(false);
    });

    it('должен исключать указанный ID при проверке', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario({ 
        id: 'test-id',
        name: 'Существующий сценарий' 
      });
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const isUnique = result.current.isNameUnique('Существующий сценарий', 'test-id');

      expect(isUnique).toBe(true);
    });
  });

  describe('Генерация уникального имени', () => {
    it('должен возвращать базовое имя если оно уникально', () => {
      const { result } = renderHook(() => useScenarios());

      const uniqueName = result.current.generateUniqueName('Новый сценарий');

      expect(uniqueName).toBe('Новый сценарий');
    });

    it('должен добавлять счетчик к неуникальному имени', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario({ name: 'Сценарий' });
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const uniqueName = result.current.generateUniqueName('Сценарий');

      expect(uniqueName).toBe('Сценарий (1)');
    });

    it('должен инкрементировать счетчик для множественных дубликатов', () => {
      const { result } = renderHook(() => useScenarios());
      const scenarios = [
        createMockScenario({ id: 'id1', name: 'Сценарий' }),
        createMockScenario({ id: 'id2', name: 'Сценарий (1)' }),
        createMockScenario({ id: 'id3', name: 'Сценарий (2)' })
      ];
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify(scenarios));

      const uniqueName = result.current.generateUniqueName('Сценарий');

      expect(uniqueName).toBe('Сценарий (3)');
    });
  });

  describe('Копирование сценария', () => {
    it('должен копировать существующий сценарий', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const copiedScenario = result.current.copyScenario('test-scenario-1');

      expect(copiedScenario).toBeDefined();
      expect(copiedScenario?.name).toBe('Копия Тестовый сценарий');
      expect(copiedScenario?.id).not.toBe('test-scenario-1');
      expect(copiedScenario?.input).toEqual(mockInput);
      expect(copiedScenario?.results).toEqual(mockResults);
    });

    it('должен использовать переданное имя для копии', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const copiedScenario = result.current.copyScenario('test-scenario-1', 'Пользовательское имя');

      expect(copiedScenario?.name).toBe('Пользовательское имя');
    });

    it('должен возвращать null для несуществующего сценария', () => {
      const { result } = renderHook(() => useScenarios());

      const copiedScenario = result.current.copyScenario('non-existent');

      expect(copiedScenario).toBeNull();
    });

    it('должен генерировать уникальный ID для копии', () => {
      const { result } = renderHook(() => useScenarios());
      const mockScenario = createMockScenario();
      
      localStorageMock.setItem('unit-calc-scenarios', JSON.stringify([mockScenario]));

      const copy1 = result.current.copyScenario('test-scenario-1');
      const copy2 = result.current.copyScenario('test-scenario-1');

      expect(copy1?.id).toBeDefined();
      expect(copy2?.id).toBeDefined();
      expect(copy1?.id).not.toBe(copy2?.id);
      expect(copy1?.id).not.toBe('test-scenario-1');
      expect(copy2?.id).not.toBe('test-scenario-1');
    });
  });

  describe('Очистка всех сценариев', () => {
    it('должен очищать localStorage', () => {
      const { result } = renderHook(() => useScenarios());

      result.current.clearAllScenarios();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('unit-calc-scenarios');
    });
  });

  describe('Константы', () => {
    it('должен экспортировать максимальное количество сценариев', () => {
      const { result } = renderHook(() => useScenarios());

      expect(result.current.maxScenarios).toBe(3);
    });
  });
});
