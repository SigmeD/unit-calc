/**
 * Тесты для проверки детализации расходов
 */

import { calculateMetrics } from '../calculator';
import type { CalculationInput } from '../../types';

describe('Детализация расходов', () => {
  const testInput: CalculationInput = {
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

  test('должен правильно рассчитывать все блоки расходов', () => {
    const results = calculateMetrics(testInput);
    const { breakdown } = results;

    // Проверяем Блок 1: Себестоимость
    expect(breakdown.totalCOGS).toBe(600); // 500 + 50 + 30 + 20

    // Проверяем Блок 2: Расходы маркетплейса
    expect(breakdown.marketplaceFees.commission).toBeGreaterThan(0);
    expect(breakdown.marketplaceFees.logistics).toBe(100);
    expect(breakdown.marketplaceFees.storage).toBe(50);
    expect(breakdown.marketplaceFees.returns).toBeGreaterThan(0);
    expect(breakdown.marketplaceFees.total).toBeGreaterThan(0);

    // Проверяем Блок 3: Дополнительные расходы
    expect(breakdown.additionalCosts.advertising).toBe(150);
    expect(breakdown.additionalCosts.otherVariable).toBe(25);
    expect(breakdown.additionalCosts.fixedPerUnit).toBe(500); // 50000 / 100
    expect(breakdown.additionalCosts.total).toBe(675); // 150 + 25 + 500

    // Проверяем Блок 4: Налоги
    expect(breakdown.taxes.rate).toBe(0.06); // УСН 6%
    expect(breakdown.taxes.base).toBeGreaterThan(0);
    expect(breakdown.taxes.amount).toBeGreaterThan(0);

    // Проверяем общую сумму расходов
    expect(breakdown.totalCosts).toBeGreaterThan(0);
    expect(breakdown.totalCosts).toBe(
      breakdown.totalCOGS + 
      breakdown.marketplaceFees.total + 
      breakdown.additionalCosts.total + 
      breakdown.taxes.amount
    );
  });

  test('должен правильно рассчитывать точку безубыточности', () => {
    const results = calculateMetrics(testInput);

    // Точка безубыточности должна быть больше текущей цены при убытке
    expect(results.breakEvenPrice).toBeGreaterThan(testInput.retailPrice);
    expect(Number.isFinite(results.breakEvenPrice)).toBe(true);
  });

  test('должен правильно рассчитывать объем безубыточности', () => {
    const results = calculateMetrics(testInput);

    // Объем безубыточности должен быть конечным числом или Infinity
    expect(
      Number.isFinite(results.breakEvenVolume) || results.breakEvenVolume === Infinity
    ).toBe(true);
  });
});
