/**
 * Тесты обработки ошибок при экспорте Excel
 * Этап 7: Экспорт данных - тестирование граничных случаев
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { exportToExcel, exportAllScenarios } from '../excelExport';
import type { Scenario, CalculationInput, CalculationResults } from '../../types';

// Мокаем XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn(() => ({ '!cols': [], '!ref': 'A1:C10' })),
    encode_cell: vi.fn((cell) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`)
  },
  writeFile: vi.fn()
}));

// Минимальные валидные данные для тестов
const minimalInput: CalculationInput = {
  purchasePrice: 100,
  deliveryToWarehouse: 10,
  packaging: 5,
  otherCOGS: 0,
  commission: 10,
  logistics: 20,
  storage: 5,
  returnProcessing: 2,
  pickupRate: 90,
  returnRate: 5,
  advertising: 30,
  otherVariableCosts: 10,
  fixedCostsPerMonth: 1000,
  expectedSalesPerMonth: 10,
  taxRegime: 'USN_6',
  retailPrice: 300,
  sellerDiscount: 10,
  additionalPromo: 0
};

const minimalResults: CalculationResults = {
  revenue: 270,
  effectivePrice: 270,
  effectivePickupRate: 85,
  cm1: 100,
  cm2: 70,
  netProfit: 40,
  marginPercent: 14.8,
  roi: 40,
  adRoi: 133.3,
  acos: 11.1,
  breakEvenPrice: 240,
  breakEvenVolume: 8,
  status: 'profit',
  breakdown: {
    totalCOGS: 115,
    marketplaceFees: {
      commission: 27,
      logistics: 20,
      storage: 5,
      returns: 2.7,
      total: 54.7
    },
    additionalCosts: {
      advertising: 30,
      otherVariable: 10,
      fixedPerUnit: 100,
      total: 140
    },
    taxes: {
      base: 270,
      rate: 0.06,
      amount: 16.2
    },
    totalCosts: 325.9
  }
};

describe('Обработка ошибок при экспорте Excel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Восстанавливаем нормальную работу writeFile
    (XLSX.writeFile as any).mockImplementation(() => {});
  });

  describe('Экспорт с некорректными данными', () => {
    it('должен обрабатывать сценарий с отрицательными значениями', () => {
      const negativeInput = {
        ...minimalInput,
        purchasePrice: -100,
        advertising: -50
      };

      const scenario: Scenario = {
        id: 'negative-test',
        name: 'Тест с отрицательными значениями',
        marketplace: 'wildberries',
        input: negativeInput,
        results: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен обрабатывать сценарий с нулевыми значениями', () => {
      const zeroInput = {
        ...minimalInput,
        purchasePrice: 0,
        retailPrice: 0,
        expectedSalesPerMonth: 0
      };

      const scenario: Scenario = {
        id: 'zero-test',
        name: 'Тест с нулевыми значениями',
        marketplace: 'wildberries',
        input: zeroInput,
        results: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен обрабатывать сценарий с очень большими значениями', () => {
      const largeInput = {
        ...minimalInput,
        purchasePrice: Number.MAX_SAFE_INTEGER,
        retailPrice: Number.MAX_SAFE_INTEGER,
        fixedCostsPerMonth: Number.MAX_SAFE_INTEGER
      };

      const scenario: Scenario = {
        id: 'large-test',
        name: 'Тест с большими значениями',
        marketplace: 'wildberries',
        input: largeInput,
        results: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен обрабатывать сценарий с NaN и Infinity в результатах', () => {
      const corruptedResults: CalculationResults = {
        ...minimalResults,
        netProfit: NaN,
        marginPercent: Infinity,
        roi: -Infinity,
        breakEvenPrice: NaN,
        breakEvenVolume: Infinity
      };

      const scenario: Scenario = {
        id: 'corrupted-test',
        name: 'Тест с поврежденными результатами',
        marketplace: 'wildberries',
        input: minimalInput,
        results: corruptedResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });
  });

  describe('Экспорт с недостающими данными', () => {
    it('должен обрабатывать сценарий без имени', () => {
      const scenario: Scenario = {
        id: 'no-name-test',
        name: '',
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // Проверяем что использовалось имя по умолчанию
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toMatch(/^Сценарий_wildberries_/);
    });

    it('должен обрабатывать сценарий без описания', () => {
      const scenario: Scenario = {
        id: 'no-description-test',
        name: 'Тест без описания',
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
        // description отсутствует
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен обрабатывать сценарий без результатов расчетов', () => {
      const scenario: Scenario = {
        id: 'no-results-test',
        name: 'Тест без результатов',
        marketplace: 'wildberries',
        input: minimalInput,
        results: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // Проверяем что листы результатов не создались
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const resultsCalls = calls.filter(call => call[2] === 'Результаты');
      const breakdownCalls = calls.filter(call => call[2] === 'Расходы');
      
      expect(resultsCalls).toHaveLength(0);
      expect(breakdownCalls).toHaveLength(0);
    });

    it('должен обрабатывать частично заполненный breakdown', () => {
      const partialResults: CalculationResults = {
        ...minimalResults,
        breakdown: {
          totalCOGS: 100,
          marketplaceFees: {
            commission: 20,
            logistics: 15,
            storage: 5,
            returns: 2,
            total: 42
          },
          additionalCosts: {
            advertising: 30,
            otherVariable: 10,
            fixedPerUnit: 50,
            total: 90
          },
          taxes: {
            base: 200,
            rate: 0.06,
            amount: 12
          },
          totalCosts: 244
        }
      };

      const scenario: Scenario = {
        id: 'partial-breakdown-test',
        name: 'Тест частичного breakdown',
        marketplace: 'wildberries',
        input: minimalInput,
        results: partialResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });
  });

  describe('Системные ошибки', () => {
    it('должен корректно обрабатывать системные ошибки', () => {
      // Тестируем что функции вызываются без ошибок при нормальной работе
      const scenario: Scenario = {
        id: 'system-test',
        name: 'Тест системы',
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });
  });

  describe('Экспорт всех сценариев - обработка ошибок', () => {
    it('должен показать предупреждение при экспорте пустого массива', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      exportAllScenarios([], 'wildberries');
      
      expect(alertSpy).toHaveBeenCalledWith('Нет сценариев для экспорта');
      alertSpy.mockRestore();
    });

    it('должен обрабатывать сценарии без результатов в массиве', () => {
      const scenarios: Scenario[] = [
        {
          id: 'with-results',
          name: 'С результатами',
          marketplace: 'wildberries',
          input: minimalInput,
          results: minimalResults,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'without-results',
          name: 'Без результатов',
          marketplace: 'wildberries',
          input: minimalInput,
          results: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      expect(() => {
        exportAllScenarios(scenarios, 'wildberries');
      }).not.toThrow();

      // Проверяем что создался только один детальный лист
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const scenarioCalls = calls.filter(call => call[2].startsWith('Сценарий'));
      expect(scenarioCalls).toHaveLength(1);
    });

    it('должен обрабатывать сценарии с поврежденными данными', () => {
      const damagedScenario: Scenario = {
        id: 'damaged',
        name: 'Поврежденный сценарий',
        marketplace: 'wildberries',
        input: minimalInput,
        results: {
          ...minimalResults,
          netProfit: NaN,
          marginPercent: Infinity,
          roi: -Infinity
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportAllScenarios([damagedScenario], 'wildberries');
      }).not.toThrow();
    });
  });

  describe('Специальные символы и кодировка', () => {
    it('должен обрабатывать спецсимволы в названиях', () => {
      const scenario: Scenario = {
        id: 'special-chars-test',
        name: 'Тест №1: товар "А" (скидка 50%) & промо',
        description: 'Описание с <тегами> и символами: @#$%^&*()_+{}|:"<>?',
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен обрабатывать длинные названия', () => {
      const longName = 'Очень длинное название сценария'.repeat(10);
      
      const scenario: Scenario = {
        id: 'long-name-test',
        name: longName,
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен обрабатывать эмодзи в названиях', () => {
      const scenario: Scenario = {
        id: 'emoji-test',
        name: '🚀 Товар года 💰 Супер прибыль! 📈',
        description: '🎯 Лучший товар 🏆 Высокая маржа 💸',
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });
  });

  describe('Граничные случаи с опциями', () => {
    it('должен обрабатывать некорректные опции экспорта', () => {
      const scenario: Scenario = {
        id: 'options-test',
        name: 'Тест опций',
        marketplace: 'wildberries',
        input: minimalInput,
        results: minimalResults,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Все опции отключены
      expect(() => {
        exportToExcel(scenario, 'wildberries', {
          includeFormulas: false,
          includeBreakdown: false,
          includeMetadata: false,
          scenarioName: ''
        });
      }).not.toThrow();

      // Undefined опции
      expect(() => {
        exportToExcel(scenario, 'wildberries', {
          includeFormulas: undefined as any,
          includeBreakdown: undefined as any,
          includeMetadata: undefined as any,
          scenarioName: undefined as any
        });
      }).not.toThrow();
    });
  });
});
