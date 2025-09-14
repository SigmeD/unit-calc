/**
 * Тесты для проверки точки безубыточности
 */

import { calculateMetrics } from '../calculator';
import type { CalculationInput } from '../../types';

describe('Точка безубыточности', () => {
  test('должен показывать текущую цену как точку безубыточности при нулевой прибыли', () => {
    // Создаем сценарий, где прибыль должна быть близка к нулю
    // Сначала рассчитываем точку безубыточности, затем используем её как retailPrice
    const baseInput: CalculationInput = {
      // Блок 1: Себестоимость
      purchasePrice: 1000,
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
      advertising: 50,
      otherVariableCosts: 25,
      fixedCostsPerMonth: 0, // Убираем фиксированные расходы
      expectedSalesPerMonth: 100,
      
      // Блок 4: Налоги
      taxRegime: 'USN_6',
      
      // Блок 5: Ценообразование
      retailPrice: 2000,
      sellerDiscount: 0,
      additionalPromo: 0,
      
      specificData: {}
    };

    // Получаем точку безубыточности
    const baseResults = calculateMetrics(baseInput);
    const breakEvenPrice = baseResults.breakEvenPrice;
    
    // Создаем новый input с ценой, равной точке безубыточности
    const input: CalculationInput = {
      ...baseInput,
      retailPrice: breakEvenPrice
    };

    const results = calculateMetrics(input);
    
    console.log('Точка безубыточности:', breakEvenPrice);
    console.log('Текущая цена:', input.retailPrice);
    console.log('Чистая прибыль:', results.netProfit);
    console.log('Статус:', results.status);
    
    // При цене равной точке безубыточности прибыль должна быть близка к нулю
    expect(Math.abs(results.netProfit)).toBeLessThan(1);
    expect(results.status).toBe('breakeven');
  });

  test('должен правильно рассчитывать точку безубыточности с учетом скидок', () => {
    const input: CalculationInput = {
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
      advertising: 100,
      otherVariableCosts: 25,
      fixedCostsPerMonth: 0,
      expectedSalesPerMonth: 100,
      
      // Блок 4: Налоги
      taxRegime: 'USN_6',
      
      // Блок 5: Ценообразование с скидками
      retailPrice: 2000,
      sellerDiscount: 10, // 10% скидка
      additionalPromo: 5, // 5% промо
      
      specificData: {}
    };

    const results = calculateMetrics(input);
    
    console.log('Розничная цена:', input.retailPrice);
    console.log('Эффективная цена:', results.effectivePrice);
    console.log('Точка безубыточности:', results.breakEvenPrice);
    console.log('Чистая прибыль:', results.netProfit);
    
    // Эффективная цена должна быть меньше розничной из-за скидок
    expect(results.effectivePrice).toBeLessThan(input.retailPrice);
    
    // Точка безубыточности должна быть конечным числом
    expect(Number.isFinite(results.breakEvenPrice)).toBe(true);
    expect(results.breakEvenPrice).toBeGreaterThan(0);
  });
});
