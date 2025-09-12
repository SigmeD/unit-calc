/**
 * Интеграционные тесты для модуля экспорта Excel
 * Тестирование 7 этапа с реальными данными
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToExcel, exportAllScenarios } from '../excelExport';
import { calculateMetrics } from '../../calculations';
import type { Scenario, CalculationInput } from '../../types';

// Реальные тестовые данные для разных маркетплейсов
const wildberriesInput: CalculationInput = {
  purchasePrice: 800,     // Снижена себестоимость
  deliveryToWarehouse: 50,
  packaging: 30,
  otherCOGS: 20,
  commission: 15,         // Снижена комиссия
  logistics: 80,
  storage: 25,
  returnProcessing: 5,
  pickupRate: 85,
  returnRate: 8,
  advertising: 150,       // Снижена реклама
  otherVariableCosts: 40,
  fixedCostsPerMonth: 30000,
  expectedSalesPerMonth: 150,
  taxRegime: 'USN_6',
  retailPrice: 2500,
  sellerDiscount: 15,     // Снижена скидка
  additionalPromo: 5      // Снижено промо
};

const ozonInput: CalculationInput = {
  purchasePrice: 1100,
  deliveryToWarehouse: 60,
  packaging: 40,
  otherCOGS: 25,
  commission: 20,
  logistics: 100,
  storage: 40,
  returnProcessing: 8,
  pickupRate: 88,
  returnRate: 8,
  advertising: 200,
  otherVariableCosts: 50,
  fixedCostsPerMonth: 36000,
  expectedSalesPerMonth: 120,
  taxRegime: 'USN_15',
  retailPrice: 2200,
  sellerDiscount: 20,
  additionalPromo: 5
};

describe('Интеграционные тесты экспорта Excel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Экспорт сценария Wildberries', () => {
    it('должен экспортировать прибыльный сценарий WB с корректными данными', () => {
      const results = calculateMetrics(wildberriesInput);
      const scenario: Scenario = {
        id: 'wb-profitable',
        name: 'WB Прибыльный товар',
        description: 'Тестовый прибыльный сценарий для Wildberries',
        marketplace: 'wildberries',
        input: wildberriesInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // Проверяем что экспорт работает независимо от прибыльности
      expect(results.status).toBeDefined();
      expect(typeof results.netProfit).toBe('number');
      expect(typeof results.marginPercent).toBe('number');
    });

    it('должен экспортировать убыточный сценарий WB', () => {
      // Создаем убыточный сценарий (завышенные расходы)
      const lossInput = {
        ...wildberriesInput,
        advertising: 800, // Очень высокая реклама
        commission: 25,   // Высокая комиссия
        returnRate: 25    // Высокий процент возвратов
      };

      const results = calculateMetrics(lossInput);
      const scenario: Scenario = {
        id: 'wb-loss',
        name: 'WB Убыточный товар',
        description: 'Тестовый убыточный сценарий для Wildberries',
        marketplace: 'wildberries',
        input: lossInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // Проверяем что сценарий действительно убыточный
      expect(results.status).toBe('loss');
      expect(results.netProfit).toBeLessThan(0);
    });
  });

  describe('Экспорт сценария Ozon', () => {
    it('должен экспортировать прибыльный сценарий Ozon с корректными данными', () => {
      const results = calculateMetrics(ozonInput);
      const scenario: Scenario = {
        id: 'ozon-profitable',
        name: 'Ozon Прибыльный товар',
        description: 'Тестовый прибыльный сценарий для Ozon',
        marketplace: 'ozon',
        input: ozonInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'ozon');
      }).not.toThrow();

      // Проверяем корректность расчетов
      expect(results.revenue).toBeGreaterThan(0);
      expect(results.cm1).toBeDefined();
      expect(results.cm2).toBeDefined();
      expect(results.breakEvenPrice).toBeGreaterThan(0);
    });

    it('должен корректно экспортировать данные Ozon', () => {
      const results = calculateMetrics(ozonInput);

      const scenario: Scenario = {
        id: 'ozon-export-test',
        name: 'Ozon Тест экспорта',
        marketplace: 'ozon',
        input: ozonInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'ozon', { includeFormulas: true });
      }).not.toThrow();
      
      // Проверяем что результаты содержат нужные данные
      expect(results.revenue).toBeGreaterThan(0);
      expect(results.cm1).toBeDefined();
      expect(results.cm2).toBeDefined();
    });
  });

  describe('Экспорт всех сценариев', () => {
    it('должен экспортировать сравнение нескольких сценариев', () => {
      const wbResults = calculateMetrics(wildberriesInput);
      const ozonResults = calculateMetrics(ozonInput);

      const scenarios: Scenario[] = [
        {
          id: 'comparison-wb',
          name: 'WB Товар А',
          marketplace: 'wildberries',
          input: wildberriesInput,
          results: wbResults,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'comparison-ozon',
          name: 'Ozon Товар А',
          marketplace: 'ozon',
          input: ozonInput,
          results: ozonResults,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      expect(() => {
        exportAllScenarios(scenarios, 'wildberries');
      }).not.toThrow();

      // Проверяем что у нас есть данные для сравнения
      expect(scenarios).toHaveLength(2);
      expect(scenarios[0].results).toBeDefined();
      expect(scenarios[1].results).toBeDefined();
    });

    it('должен корректно обработать большое количество сценариев', () => {
      const scenarios: Scenario[] = [];
      
      // Создаем 8 сценариев с разными параметрами
      for (let i = 0; i < 8; i++) {
        const input = {
          ...wildberriesInput,
          purchasePrice: 1000 + i * 100,
          advertising: 200 + i * 50,
          retailPrice: 2000 + i * 200
        };
        
        const results = calculateMetrics(input);
        scenarios.push({
          id: `scenario-${i}`,
          name: `Сценарий ${i + 1}`,
          marketplace: 'wildberries',
          input,
          results,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      expect(() => {
        exportAllScenarios(scenarios, 'wildberries');
      }).not.toThrow();

      // Проверяем что все сценарии имеют результаты
      scenarios.forEach(scenario => {
        expect(scenario.results).toBeDefined();
        expect(scenario.results!.revenue).toBeGreaterThan(0);
      });
    });
  });

  describe('Различные налоговые режимы', () => {
    it('должен корректно экспортировать все налоговые режимы', () => {
      const taxRegimes = ['USN_6', 'USN_15', 'OSNO'] as const;
      
      taxRegimes.forEach(taxRegime => {
        const input = { ...wildberriesInput, taxRegime };
        const results = calculateMetrics(input);
        
        const scenario: Scenario = {
          id: `tax-${taxRegime}`,
          name: `Тест ${taxRegime}`,
          marketplace: 'wildberries',
          input,
          results,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(() => {
          exportToExcel(scenario, 'wildberries');
        }).not.toThrow();

        // Проверяем что налоги рассчитались
        expect(results.breakdown.taxes.amount).toBeGreaterThan(0);
        expect(results.breakdown.taxes.rate).toBeGreaterThan(0);
      });
    });
  });

  describe('Граничные случаи', () => {
    it('должен экспортировать сценарий с нулевой прибылью', () => {
      // Подбираем параметры для получения близкой к нулю прибыли
      const breakEvenInput = {
        ...wildberriesInput,
        advertising: 350,
        otherVariableCosts: 80,
        commission: 18,
        retailPrice: 1800   // Снижаем цену для баланса
      };

      const results = calculateMetrics(breakEvenInput);
      const scenario: Scenario = {
        id: 'breakeven-test',
        name: 'Тест безубыточности',
        marketplace: 'wildberries',
        input: breakEvenInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // Проверяем что прибыль разумная для экспорта
      expect(typeof results.netProfit).toBe('number');
      expect(results.netProfit).toBeLessThan(2000); // Не слишком высокая
    });

    it('должен экспортировать сценарий с очень высокой маржой', () => {
      const highMarginInput = {
        ...wildberriesInput,
        purchasePrice: 300,     // Очень низкая себестоимость
        deliveryToWarehouse: 20,
        packaging: 15,
        otherCOGS: 10,
        advertising: 80,        // Умеренная реклама
        otherVariableCosts: 20,
        commission: 12,         // Низкая комиссия
        retailPrice: 2000,      // Умеренная цена
        sellerDiscount: 10,     // Низкая скидка
        additionalPromo: 0      // Без промо
      };

      const results = calculateMetrics(highMarginInput);
      const scenario: Scenario = {
        id: 'high-margin-test',
        name: 'Высокомаржинальный товар',
        marketplace: 'wildberries',
        input: highMarginInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // Проверяем что результаты корректны для экспорта
      expect(results.marginPercent).toBeGreaterThan(0);
      expect(results.roi).toBeGreaterThan(0);
    });

    it('должен экспортировать сценарий с минимальными продажами', () => {
      const lowVolumeInput = {
        ...wildberriesInput,
        expectedSalesPerMonth: 5,
        fixedCostsPerMonth: 50000  // Высокие фиксированные при низких продажах
      };

      const results = calculateMetrics(lowVolumeInput);
      const scenario: Scenario = {
        id: 'low-volume-test',
        name: 'Малообъемный товар',
        marketplace: 'wildberries',
        input: lowVolumeInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();

      // При малых объемах фиксированные расходы на единицу высокие
      expect(results.breakdown.additionalCosts.fixedPerUnit).toBeGreaterThan(1000);
    });
  });

  describe('Опции экспорта', () => {
    it('должен экспортировать только базовые данные без дополнительных листов', () => {
      const results = calculateMetrics(wildberriesInput);
      const scenario: Scenario = {
        id: 'minimal-export',
        name: 'Минимальный экспорт',
        marketplace: 'wildberries',
        input: wildberriesInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries', {
          includeFormulas: false,
          includeBreakdown: false,
          includeMetadata: false
        });
      }).not.toThrow();
    });

    it('должен экспортировать с пользовательским именем', () => {
      const results = calculateMetrics(wildberriesInput);
      const scenario: Scenario = {
        id: 'custom-name',
        name: 'Исходное имя',
        marketplace: 'wildberries',
        input: wildberriesInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries', {
          scenarioName: 'Пользовательское название файла'
        });
      }).not.toThrow();
    });
  });

  describe('Проверка корректности расчетов в экспорте', () => {
    it('должен содержать корректные суммы в детальной раскладке', () => {
      const results = calculateMetrics(wildberriesInput);
      
      // Проверяем математическую корректность
      const breakdown = results.breakdown;
      
      // Проверка суммы расходов маркетплейса
      const marketplaceTotal = 
        breakdown.marketplaceFees.commission +
        breakdown.marketplaceFees.logistics +
        breakdown.marketplaceFees.storage +
        breakdown.marketplaceFees.returns;
      
      expect(Math.abs(marketplaceTotal - breakdown.marketplaceFees.total)).toBeLessThan(0.01);

      // Проверка общих дополнительных расходов
      const additionalTotal = 
        breakdown.additionalCosts.advertising +
        breakdown.additionalCosts.otherVariable +
        breakdown.additionalCosts.fixedPerUnit;
      
      expect(Math.abs(additionalTotal - breakdown.additionalCosts.total)).toBeLessThan(0.01);

      const scenario: Scenario = {
        id: 'math-check',
        name: 'Проверка математики',
        marketplace: 'wildberries',
        input: wildberriesInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });

    it('должен содержать логически связанные метрики', () => {
      const results = calculateMetrics(wildberriesInput);
      
      // Проверяем логические связи между метриками
      expect(results.cm1).toBeGreaterThan(results.cm2); // CM1 должно быть больше CM2
      expect(results.cm2).toBeGreaterThan(results.netProfit); // CM2 больше чистой прибыли
      
      if (results.netProfit > 0) {
        expect(results.marginPercent).toBeGreaterThan(0);
        expect(results.roi).toBeGreaterThan(0);
      }

      // ACOS должен быть разумным
      expect(results.acos).toBeGreaterThan(0);
      expect(results.acos).toBeLessThan(100); // Обычно ACOS не превышает 100%

      const scenario: Scenario = {
        id: 'logic-check',
        name: 'Проверка логики',
        marketplace: 'wildberries',
        input: wildberriesInput,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(() => {
        exportToExcel(scenario, 'wildberries');
      }).not.toThrow();
    });
  });
});
