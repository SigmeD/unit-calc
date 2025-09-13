/**
 * Unit тесты для хука useExport
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExport } from '../useExport';
import type { Scenario, CalculationResults, CalculationInput, MarketplaceId } from '../../types';

// Мокаем модуль экспорта
vi.mock('../../utils/excelExport', () => ({
  exportToExcel: vi.fn(),
  exportAllScenarios: vi.fn()
}));

import { exportToExcel, exportAllScenarios } from '../../utils/excelExport';

describe('useExport', () => {
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

  const mockScenario: Scenario = {
    id: 'test-scenario-1',
    name: 'Тестовый сценарий',
    description: 'Описание тестового сценария',
    input: mockInput,
    results: mockResults,
    marketplace: 'wildberries',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  };

  const mockScenarioWithoutResults: Scenario = {
    ...mockScenario,
    results: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Устанавливаем успешное выполнение по умолчанию
    vi.mocked(exportToExcel).mockImplementation(() => {});
    vi.mocked(exportAllScenarios).mockImplementation(() => {});
  });

  describe('Инициализация', () => {
    it('должен возвращать корректную структуру функций', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.exportScenario).toBeInstanceOf(Function);
      expect(result.current.exportMultipleScenarios).toBeInstanceOf(Function);
      expect(result.current.exportCurrentScenario).toBeInstanceOf(Function);
      expect(result.current.exportDataOnly).toBeInstanceOf(Function);
      expect(result.current.canExport).toBeInstanceOf(Function);
      expect(result.current.getExportInfo).toBeInstanceOf(Function);
    });
  });

  describe('exportScenario', () => {
    it('должен успешно экспортировать сценарий', () => {
      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportScenario(mockScenario, 'wildberries');

      expect(exportToExcel).toHaveBeenCalledWith(mockScenario, 'wildberries', undefined);
      expect(exportResult.success).toBe(true);
      expect(exportResult.error).toBeNull();
    });

    it('должен экспортировать сценарий с опциями', () => {
      const { result } = renderHook(() => useExport());
      const options = { includeFormulas: false, scenarioName: 'Тест' };

      result.current.exportScenario(mockScenario, 'ozon', options);

      expect(exportToExcel).toHaveBeenCalledWith(mockScenario, 'ozon', options);
    });

    it('должен обрабатывать ошибки экспорта', () => {
      vi.mocked(exportToExcel).mockImplementation(() => {
        throw new Error('Ошибка экспорта');
      });

      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportScenario(mockScenario, 'wildberries');

      expect(exportResult.success).toBe(false);
      expect(exportResult.error).toBe('Ошибка экспорта');
    });

    it('должен обрабатывать неизвестные ошибки', () => {
      vi.mocked(exportToExcel).mockImplementation(() => {
        throw 'Неизвестная ошибка';
      });

      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportScenario(mockScenario, 'wildberries');

      expect(exportResult.success).toBe(false);
      expect(exportResult.error).toBe('Неизвестная ошибка экспорта');
    });
  });

  describe('exportMultipleScenarios', () => {
    const scenarios = [mockScenario, { ...mockScenario, id: 'test-scenario-2' }];

    it('должен успешно экспортировать несколько сценариев', () => {
      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportMultipleScenarios(scenarios, 'wildberries');

      expect(exportAllScenarios).toHaveBeenCalledWith(scenarios, 'wildberries');
      expect(exportResult.success).toBe(true);
      expect(exportResult.error).toBeNull();
    });

    it('должен обрабатывать пустой массив сценариев', () => {
      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportMultipleScenarios([], 'wildberries');

      expect(exportAllScenarios).not.toHaveBeenCalled();
      expect(exportResult.success).toBe(false);
      expect(exportResult.error).toBe('Нет сценариев для экспорта');
    });

    it('должен обрабатывать ошибки при экспорте нескольких сценариев', () => {
      vi.mocked(exportAllScenarios).mockImplementation(() => {
        throw new Error('Ошибка множественного экспорта');
      });

      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportMultipleScenarios(scenarios, 'wildberries');

      expect(exportResult.success).toBe(false);
      expect(exportResult.error).toBe('Ошибка множественного экспорта');
    });
  });

  describe('exportCurrentScenario', () => {
    it('должен успешно экспортировать текущий сценарий с формулами', () => {
      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportCurrentScenario(mockScenario, 'wildberries', true);

      expect(exportToExcel).toHaveBeenCalledWith(mockScenario, 'wildberries', {
        includeFormulas: true,
        includeBreakdown: true,
        includeMetadata: true,
        scenarioName: 'Тестовый сценарий'
      });
      expect(exportResult.success).toBe(true);
    });

    it('должен экспортировать без формул', () => {
      const { result } = renderHook(() => useExport());

      result.current.exportCurrentScenario(mockScenario, 'wildberries', false);

      expect(exportToExcel).toHaveBeenCalledWith(mockScenario, 'wildberries', {
        includeFormulas: false,
        includeBreakdown: true,
        includeMetadata: true,
        scenarioName: 'Тестовый сценарий'
      });
    });

    it('должен отклонять экспорт сценария без результатов', () => {
      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportCurrentScenario(mockScenarioWithoutResults, 'wildberries');

      expect(exportToExcel).not.toHaveBeenCalled();
      expect(exportResult.success).toBe(false);
      expect(exportResult.error).toBe('Невозможно экспортировать сценарий без результатов расчета');
    });
  });

  describe('exportDataOnly', () => {
    it('должен экспортировать только данные без формул', () => {
      const { result } = renderHook(() => useExport());

      const exportResult = result.current.exportDataOnly(mockScenario, 'wildberries');

      expect(exportToExcel).toHaveBeenCalledWith(mockScenario, 'wildberries', {
        includeFormulas: false,
        includeBreakdown: true,
        includeMetadata: false,
        scenarioName: 'Тестовый сценарий'
      });
      expect(exportResult.success).toBe(true);
    });
  });

  describe('canExport', () => {
    it('должен возвращать true для сценария с данными и результатами', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.canExport(mockScenario)).toBe(true);
    });

    it('должен возвращать false для сценария без результатов', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.canExport(mockScenarioWithoutResults)).toBe(false);
    });

    it('должен возвращать false для сценария без входных данных', () => {
      const { result } = renderHook(() => useExport());
      const scenarioWithoutInput = { ...mockScenario, input: null as any };

      expect(result.current.canExport(scenarioWithoutInput)).toBe(false);
    });

    it('должен возвращать false для null сценария', () => {
      const { result } = renderHook(() => useExport());

      expect(result.current.canExport(null as any)).toBe(false);
    });
  });

  describe('getExportInfo', () => {
    it('должен возвращать полную информацию для полного сценария', () => {
      const { result } = renderHook(() => useExport());

      const info = result.current.getExportInfo(mockScenario);

      expect(info.canExportData).toBe(true);
      expect(info.canExportResults).toBe(true);
      expect(info.canExportFull).toBe(true);
      expect(info.scenarioName).toBe('Тестовый сценарий');
      expect(info.lastUpdated).toEqual(new Date('2023-01-02'));
    });

    it('должен корректно обрабатывать сценарий без результатов', () => {
      const { result } = renderHook(() => useExport());

      const info = result.current.getExportInfo(mockScenarioWithoutResults);

      expect(info.canExportData).toBe(true);
      expect(info.canExportResults).toBe(false);
      expect(info.canExportFull).toBe(false);
    });

    it('должен корректно обрабатывать сценарий без имени', () => {
      const { result } = renderHook(() => useExport());
      const scenarioWithoutName = { ...mockScenario, name: '' };

      const info = result.current.getExportInfo(scenarioWithoutName);

      expect(info.scenarioName).toBe('Без названия');
    });

    it('должен корректно обрабатывать сценарий без входных данных', () => {
      const { result } = renderHook(() => useExport());
      const scenarioWithoutInput = { ...mockScenario, input: null as any };

      const info = result.current.getExportInfo(scenarioWithoutInput);

      expect(info.canExportData).toBe(false);
      expect(info.canExportFull).toBe(false);
    });
  });

  describe('Интеграция функций', () => {
    it('должен правильно работать весь цикл проверки и экспорта', () => {
      const { result } = renderHook(() => useExport());

      // Проверяем возможность экспорта
      const canExport = result.current.canExport(mockScenario);
      expect(canExport).toBe(true);

      // Получаем информацию об экспорте
      const info = result.current.getExportInfo(mockScenario);
      expect(info.canExportFull).toBe(true);

      // Экспортируем
      const exportResult = result.current.exportCurrentScenario(mockScenario, 'wildberries');
      expect(exportResult.success).toBe(true);
    });
  });
});
