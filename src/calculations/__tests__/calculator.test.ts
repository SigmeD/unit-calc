/**
 * Unit тесты для движка расчетов юнит-экономики
 */

import { calculateMetrics, validateCalculationInput, hasCalculationErrors, UnitEconomicsCalculator } from '../calculator';
import type { CalculationInput } from '../../types';

describe('UnitEconomicsCalculator', () => {
  // Базовые тестовые данные
  const baseInput: CalculationInput = {
    // Блок 1: Себестоимость
    purchasePrice: 500,
    deliveryToWarehouse: 50,
    packaging: 30,
    otherCOGS: 20,
    
    // Блок 2: Расходы маркетплейса
    commission: 15,
    logistics: 100,
    storage: 50,
    returnProcessing: 10,
    pickupRate: 80,
    returnRate: 10,
    
    // Блок 3: Дополнительные расходы
    advertising: 150,
    otherVariableCosts: 25,
    fixedCostsPerMonth: 50000,
    expectedSalesPerMonth: 100,
    
    // Блок 4: Налоги
    taxRegime: 'USN_6',
    
    // Блок 5: Ценообразование
    retailPrice: 2000,
    sellerDiscount: 10,
    additionalPromo: 5,
    
    specificData: {}
  };

  describe('Базовые расчеты', () => {
    test('должен правильно рассчитывать эффективную цену', () => {
      const calculator = new UnitEconomicsCalculator(baseInput);
      const results = calculator.calculate();
      
      // 2000 * 0.9 * 0.95 = 1710
      expect(results.effectivePrice).toBe(1710);
    });

    test('должен правильно рассчитывать эффективный процент выкупа', () => {
      const calculator = new UnitEconomicsCalculator(baseInput);
      const results = calculator.calculate();
      
      // 80% - 10% = 70%
      expect(results.effectivePickupRate).toBe(70);
    });

    test('должен правильно рассчитывать выручку', () => {
      const calculator = new UnitEconomicsCalculator(baseInput);
      const results = calculator.calculate();
      
      // 1710 * 0.7 = 1197
      expect(results.revenue).toBe(1197);
    });
  });

  describe('Детализация расходов', () => {
    test('должен правильно рассчитывать общую себестоимость', () => {
      const results = calculateMetrics(baseInput);
      
      // 500 + 50 + 30 + 20 = 600
      expect(results.breakdown.totalCOGS).toBe(600);
    });

    test('должен правильно рассчитывать расходы маркетплейса', () => {
      const results = calculateMetrics(baseInput);
      const { marketplaceFees } = results.breakdown;
      
      // Комиссия: 1710 * 0.15 = 256.5
      expect(marketplaceFees.commission).toBe(256.5);
      
      // Логистика: 100
      expect(marketplaceFees.logistics).toBe(100);
      
      // Хранение: 50
      expect(marketplaceFees.storage).toBe(50);
      
      // Возвраты: 1710 * 0.1 * 0.1 = 17.1
      expect(marketplaceFees.returns).toBe(17.1);
      
      // Итого: 256.5 + 100 + 50 + 17.1 = 423.6
      expect(marketplaceFees.total).toBe(423.6);
    });

    test('должен правильно рассчитывать дополнительные расходы', () => {
      const results = calculateMetrics(baseInput);
      const { additionalCosts } = results.breakdown;
      
      // Реклама: 150
      expect(additionalCosts.advertising).toBe(150);
      
      // Прочие переменные: 25
      expect(additionalCosts.otherVariable).toBe(25);
      
      // Доля фиксированных: 50000 / 100 = 500
      expect(additionalCosts.fixedPerUnit).toBe(500);
      
      // Итого: 150 + 25 + 500 = 675
      expect(additionalCosts.total).toBe(675);
    });

    test('должен правильно рассчитывать налоги для УСН 6%', () => {
      const results = calculateMetrics(baseInput);
      const { taxes } = results.breakdown;
      
      // Налоговая база для УСН 6% = доходы = 1710
      expect(taxes.base).toBe(1710);
      expect(taxes.rate).toBe(0.06);
      // Налог: 1710 * 0.06 = 102.6
      expect(taxes.amount).toBe(102.6);
    });

    test('должен правильно рассчитывать налоги для УСН 15%', () => {
      const inputUSN15: CalculationInput = { ...baseInput, taxRegime: 'USN_15' };
      const results = calculateMetrics(inputUSN15);
      const { taxes } = results.breakdown;
      
      // Налоговая база для УСН 15% = доходы - расходы
      // 1710 - 600 - 423.6 - 675 = 11.4
      expect(taxes.base).toBeCloseTo(11.4, 1);
      expect(taxes.rate).toBe(0.15);
      // Налог: 11.4 * 0.15 = 1.71
      expect(taxes.amount).toBeCloseTo(1.71, 2);
    });
  });

  describe('Основные метрики', () => {
    test('должен правильно рассчитывать CM1', () => {
      const results = calculateMetrics(baseInput);
      
      // CM1 = Выручка - COGS - Расходы маркетплейса
      // 1197 - 600 - 423.6 = 173.4
      expect(results.cm1).toBeCloseTo(173.4, 1);
    });

    test('должен правильно рассчитывать CM2', () => {
      const results = calculateMetrics(baseInput);
      
      // CM2 = CM1 - Реклама = 173.4 - 150 = 23.4
      expect(results.cm2).toBeCloseTo(23.4, 1);
    });

    test('должен правильно рассчитывать чистую прибыль', () => {
      const results = calculateMetrics(baseInput);
      
      // Чистая прибыль = CM2 - прочие переменные - доля фиксированных - налоги
      // 23.4 - 25 - 500 - 102.6 = -604.2
      expect(results.netProfit).toBeCloseTo(-604.2, 1);
    });

    test('должен правильно рассчитывать маржинальность', () => {
      const results = calculateMetrics(baseInput);
      
      // Маржинальность = (Чистая прибыль / Выручка) * 100%
      // (-604.2 / 1197) * 100% ≈ -50.48%
      expect(results.marginPercent).toBeCloseTo(-50.48, 1);
    });

    test('должен правильно определять статус убыточности', () => {
      const results = calculateMetrics(baseInput);
      expect(results.status).toBe('loss');
    });
  });

  describe('ROI метрики', () => {
    test('должен правильно рассчитывать общий ROI', () => {
      const results = calculateMetrics(baseInput);
      
      // ROI = (Чистая прибыль / Себестоимость) * 100%
      // (-604.2 / 600) * 100% ≈ -100.7%
      expect(results.roi).toBeCloseTo(-100.7, 1);
    });

    test('должен правильно рассчитывать ACOS', () => {
      const results = calculateMetrics(baseInput);
      
      // ACOS = (Затраты на рекламу / Выручка) * 100%
      // (150 / 1197) * 100% ≈ 12.53%
      expect(results.acos).toBeCloseTo(12.53, 1);
    });
  });

  describe('Точка безубыточности', () => {
    test('должен рассчитывать точку безубыточности по цене', () => {
      const results = calculateMetrics(baseInput);
      
      // Точка безубыточности должна быть больше текущей цены при убытке
      expect(results.breakEvenPrice).toBeGreaterThan(baseInput.retailPrice);
    });

    test('должен рассчитывать объем для безубыточности', () => {
      const results = calculateMetrics(baseInput);
      
      // При убыточном сценарии с отрицательной маржой может быть Infinity
      expect(results.breakEvenVolume).toBeGreaterThanOrEqual(0);
      
      // Проверяем, что это либо конечное число, либо Infinity
      expect(
        Number.isFinite(results.breakEvenVolume) || results.breakEvenVolume === Infinity
      ).toBe(true);
    });

    test('должен рассчитывать конечный объем для прибыльного сценария', () => {
      const profitableInput: CalculationInput = {
        ...baseInput,
        retailPrice: 3000, // Увеличиваем цену для прибыльности
        fixedCostsPerMonth: 10000 // Уменьшаем фиксированные расходы
      };
      
      const results = calculateMetrics(profitableInput);
      
      // При прибыльном сценарии объем должен быть конечным
      expect(results.breakEvenVolume).toBeGreaterThan(0);
      expect(Number.isFinite(results.breakEvenVolume)).toBe(true);
    });
  });

  describe('Прибыльный сценарий', () => {
    test('должен показывать прибыль при высокой цене', () => {
      const profitableInput: CalculationInput = {
        ...baseInput,
        retailPrice: 5000, // Увеличиваем цену
        fixedCostsPerMonth: 10000, // Уменьшаем фиксированные расходы
        advertising: 50 // Уменьшаем рекламу
      };
      
      const results = calculateMetrics(profitableInput);
      
      expect(results.netProfit).toBeGreaterThan(0);
      expect(results.status).toBe('profit');
      expect(results.marginPercent).toBeGreaterThan(0);
      expect(results.roi).toBeGreaterThan(0);
    });
  });

  describe('Валидация входных данных', () => {
    test('должен выявлять некорректную розничную цену', () => {
      const invalidInput = { ...baseInput, retailPrice: 0 };
      const errors = validateCalculationInput(invalidInput);
      
      expect(errors).toContain('Розничная цена должна быть больше 0');
    });

    test('должен выявлять некорректные проценты', () => {
      const invalidInput = { ...baseInput, pickupRate: 150 };
      const errors = validateCalculationInput(invalidInput);
      
      expect(errors).toContain('Процент выкупа должен быть от 0 до 100%');
    });

    test('должен выявлять несовместимые выкуп и возвраты', () => {
      const invalidInput = { ...baseInput, pickupRate: 50, returnRate: 60 };
      const errors = validateCalculationInput(invalidInput);
      
      expect(errors).toContain('Эффективный процент выкупа должен быть больше 0');
    });

    test('должен выявлять чрезмерные скидки', () => {
      const invalidInput = { ...baseInput, sellerDiscount: 70, additionalPromo: 50 };
      const errors = validateCalculationInput(invalidInput);
      
      expect(errors).toContain('Общая сумма скидок не может быть 100% или больше');
    });

    test('hasCalculationErrors должен возвращать true при ошибках', () => {
      const invalidInput = { ...baseInput, retailPrice: 0 };
      
      expect(hasCalculationErrors(invalidInput)).toBe(true);
    });

    test('hasCalculationErrors должен возвращать false при корректных данных', () => {
      expect(hasCalculationErrors(baseInput)).toBe(false);
    });
  });

  describe('Граничные случаи', () => {
    test('должен обрабатывать нулевые значения', () => {
      const zeroInput: CalculationInput = {
        ...baseInput,
        purchasePrice: 0,
        deliveryToWarehouse: 0,
        packaging: 0,
        otherCOGS: 0,
        advertising: 0,
        fixedCostsPerMonth: 0
      };
      
      const results = calculateMetrics(zeroInput);
      
      expect(results.breakdown.totalCOGS).toBe(0);
      expect(results.breakdown.additionalCosts.advertising).toBe(0);
      expect(results.breakdown.additionalCosts.fixedPerUnit).toBe(0);
    });

    test('должен обрабатывать максимальные скидки', () => {
      const maxDiscountInput: CalculationInput = {
        ...baseInput,
        sellerDiscount: 50,
        additionalPromo: 49
      };
      
      const results = calculateMetrics(maxDiscountInput);
      
      // Эффективная цена должна быть минимальной, но больше 0
      expect(results.effectivePrice).toBeGreaterThan(0);
      expect(results.effectivePrice).toBeLessThan(baseInput.retailPrice);
    });

    test('должен обрабатывать 100% выкуп без возвратов', () => {
      const perfectPickupInput: CalculationInput = {
        ...baseInput,
        pickupRate: 100,
        returnRate: 0
      };
      
      const results = calculateMetrics(perfectPickupInput);
      
      expect(results.effectivePickupRate).toBe(100);
      expect(results.breakdown.marketplaceFees.returns).toBe(0);
    });
  });
});

describe('Интеграционные тесты расчетов', () => {
  test('результаты должны быть согласованными между собой', () => {
    const input: CalculationInput = {
      purchasePrice: 300,
      deliveryToWarehouse: 30,
      packaging: 20,
      otherCOGS: 10,
      commission: 12,
      logistics: 80,
      storage: 40,
      returnProcessing: 8,
      pickupRate: 85,
      returnRate: 5,
      advertising: 100,
      otherVariableCosts: 15,
      fixedCostsPerMonth: 30000,
      expectedSalesPerMonth: 150,
      taxRegime: 'USN_15',
      retailPrice: 1500,
      sellerDiscount: 5,
      additionalPromo: 10,
      specificData: {}
    };
    
    const results = calculateMetrics(input);
    
    // Проверяем логическую связность результатов
    expect(results.cm2).toBeLessThanOrEqual(results.cm1);
    expect(results.netProfit).toBeLessThanOrEqual(results.cm2);
    
    if (results.status === 'profit') {
      expect(results.netProfit).toBeGreaterThan(0);
      expect(results.marginPercent).toBeGreaterThan(0);
    } else if (results.status === 'loss') {
      expect(results.netProfit).toBeLessThan(0);
      expect(results.marginPercent).toBeLessThan(0);
    }
    
    // ACOS должен быть разумным
    expect(results.acos).toBeGreaterThanOrEqual(0);
    expect(results.acos).toBeLessThan(1000); // Не больше 1000%
    
    // Эффективная цена должна быть меньше розничной
    expect(results.effectivePrice).toBeLessThanOrEqual(input.retailPrice);
    
    // Выручка = эффективная цена * эффективный выкуп
    const expectedRevenue = results.effectivePrice * (results.effectivePickupRate / 100);
    expect(results.revenue).toBeCloseTo(expectedRevenue, 2);
  });
});
