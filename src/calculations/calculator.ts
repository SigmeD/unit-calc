/**
 * Движок расчетов юнит-экономики для селлеров
 * Этап 4: Core расчеты
 */

import type { CalculationInput, CalculationResults, CostBreakdown, TaxRegime } from '../types';

/**
 * Налоговые ставки для разных режимов
 */
const TAX_RATES: Record<TaxRegime, number> = {
  USN_6: 0.06,    // УСН 6% с доходов
  USN_15: 0.15,   // УСН 15% с доходов минус расходы
  OSNO: 0.20      // ОСНО упрощенно (НДС + налог на прибыль)
};

/**
 * Класс для выполнения всех расчетов юнит-экономики
 */
export class UnitEconomicsCalculator {
  private input: CalculationInput;

  constructor(input: CalculationInput) {
    this.input = input;
  }

  /**
   * Основная функция расчета всех метрик
   */
  calculate(): CalculationResults {
    // Базовые расчеты
    const effectivePrice = this.calculateEffectivePrice();
    const effectivePickupRate = this.calculateEffectivePickupRate();
    const revenue = effectivePrice * (effectivePickupRate / 100);
    
    // Детализация расходов
    const breakdown = this.calculateCostBreakdown(effectivePrice);
    
    // Основные метрики
    const cm1 = this.calculateCM1(revenue, breakdown);
    const cm2 = this.calculateCM2(cm1, breakdown);
    const netProfit = this.calculateNetProfit(cm2, breakdown);
    const marginPercent = this.calculateMarginPercent(netProfit, revenue);
    
    // ROI метрики
    const roi = this.calculateROI(netProfit, breakdown.totalCOGS);
    const adRoi = this.calculateAdROI(netProfit, breakdown.additionalCosts.advertising);
    const acos = this.calculateACOS(breakdown.additionalCosts.advertising, revenue);
    
    // Статус прибыльности
    const status = this.determineStatus(netProfit);
    
    // Точка безубыточности
    const breakEvenPrice = this.calculateBreakEvenPrice();
    const breakEvenVolume = this.calculateBreakEvenVolume();

    return {
      revenue,
      cm1,
      cm2,
      netProfit,
      marginPercent,
      roi,
      adRoi,
      acos,
      status,
      breakEvenPrice,
      breakEvenVolume,
      breakdown,
      effectivePrice,
      effectivePickupRate
    };
  }

  /**
   * Рассчитывает эффективную цену после всех скидок
   */
  private calculateEffectivePrice(): number {
    const { retailPrice, sellerDiscount, additionalPromo } = this.input;
    
    // Применяем скидку продавца
    const priceAfterSellerDiscount = retailPrice * (1 - sellerDiscount / 100);
    
    // Применяем дополнительные промо
    const finalPrice = priceAfterSellerDiscount * (1 - additionalPromo / 100);
    
    return Math.max(0, finalPrice);
  }

  /**
   * Рассчитывает эффективный процент выкупа
   */
  private calculateEffectivePickupRate(): number {
    const { pickupRate, returnRate } = this.input;
    
    // Эффективный выкуп = выкуп - возвраты
    // Учитываем, что возвраты уменьшают фактический выкуп
    return Math.max(0, pickupRate - returnRate);
  }

  /**
   * Детализация всех расходов
   */
  private calculateCostBreakdown(effectivePrice: number): CostBreakdown {
    const { 
      purchasePrice, deliveryToWarehouse, packaging, otherCOGS,
      commission, logistics, storage, returnProcessing,
      advertising, otherVariableCosts, fixedCostsPerMonth, expectedSalesPerMonth
    } = this.input;

    // Блок 1: Общая себестоимость (COGS)
    const totalCOGS = purchasePrice + deliveryToWarehouse + packaging + otherCOGS;

    // Блок 2: Расходы маркетплейса
    const commissionAmount = effectivePrice * (commission / 100);
    const returnsAmount = effectivePrice * (this.input.returnRate / 100) * (returnProcessing / 100);
    
    const marketplaceFees = {
      commission: commissionAmount,
      logistics,
      storage,
      returns: returnsAmount,
      total: commissionAmount + logistics + storage + returnsAmount
    };

    // Блок 3: Дополнительные расходы
    const fixedPerUnit = expectedSalesPerMonth && expectedSalesPerMonth > 0 
      ? fixedCostsPerMonth / expectedSalesPerMonth 
      : 0;
    
    const additionalCosts = {
      advertising,
      otherVariable: otherVariableCosts,
      fixedPerUnit,
      total: advertising + otherVariableCosts + fixedPerUnit
    };

    // Блок 4: Налоги
    const taxBase = this.calculateTaxBase(effectivePrice, totalCOGS, marketplaceFees.total, additionalCosts.total);
    const taxRate = TAX_RATES[this.input.taxRegime];
    const taxAmount = Math.max(0, taxBase * taxRate);
    
    const taxes = {
      amount: taxAmount,
      rate: taxRate,
      base: taxBase
    };

    const totalCosts = totalCOGS + marketplaceFees.total + additionalCosts.total + taxes.amount;

    return {
      totalCOGS,
      marketplaceFees,
      additionalCosts,
      taxes,
      totalCosts
    };
  }

  /**
   * Рассчитывает налоговую базу в зависимости от режима
   */
  private calculateTaxBase(effectivePrice: number, cogs: number, marketplaceFees: number, additionalCosts: number): number {
    const { taxRegime } = this.input;
    
    switch (taxRegime) {
      case 'USN_6':
        // УСН 6%: налоговая база = доходы
        return effectivePrice;
      
      case 'USN_15':
        // УСН 15%: налоговая база = доходы - расходы
        return effectivePrice - cogs - marketplaceFees - additionalCosts;
      
      case 'OSNO':
        // ОСНО упрощенно: налоговая база = прибыль
        return effectivePrice - cogs - marketplaceFees - additionalCosts;
      
      default:
        return 0;
    }
  }

  /**
   * CM1 = Выручка - COGS - Расходы маркетплейса
   */
  private calculateCM1(revenue: number, breakdown: CostBreakdown): number {
    return revenue - breakdown.totalCOGS - breakdown.marketplaceFees.total;
  }

  /**
   * CM2 = CM1 - Реклама
   */
  private calculateCM2(cm1: number, breakdown: CostBreakdown): number {
    return cm1 - breakdown.additionalCosts.advertising;
  }

  /**
   * Чистая прибыль = CM2 - Прочие переменные - Доля фиксированных - Налоги
   */
  private calculateNetProfit(cm2: number, breakdown: CostBreakdown): number {
    return cm2 - breakdown.additionalCosts.otherVariable - breakdown.additionalCosts.fixedPerUnit - breakdown.taxes.amount;
  }

  /**
   * Маржинальность = (Чистая прибыль / Выручка) * 100%
   */
  private calculateMarginPercent(netProfit: number, revenue: number): number {
    if (revenue <= 0) return 0;
    return (netProfit / revenue) * 100;
  }

  /**
   * Общий ROI = (Чистая прибыль / Себестоимость) * 100%
   */
  private calculateROI(netProfit: number, totalCOGS: number): number {
    if (totalCOGS <= 0) return 0;
    return (netProfit / totalCOGS) * 100;
  }

  /**
   * ROI на рекламу = (Прибыль от рекламы / Затраты на рекламу) * 100%
   */
  private calculateAdROI(netProfit: number, adSpend: number): number {
    if (adSpend <= 0) return 0;
    // Упрощенно считаем, что вся прибыль связана с рекламой
    return (netProfit / adSpend) * 100;
  }

  /**
   * ACOS = (Затраты на рекламу / Выручка) * 100%
   */
  private calculateACOS(adSpend: number, revenue: number): number {
    if (revenue <= 0) return 0;
    return (adSpend / revenue) * 100;
  }

  /**
   * Определяет статус прибыльности
   */
  private determineStatus(netProfit: number): 'profit' | 'loss' | 'breakeven' {
    if (netProfit > 0.01) return 'profit';
    if (netProfit < -0.01) return 'loss';
    return 'breakeven';
  }

  /**
   * Рассчитывает минимальную цену для безубыточности
   */
  private calculateBreakEvenPrice(): number {
    const { 
      purchasePrice, deliveryToWarehouse, packaging, otherCOGS,
      commission, logistics, storage, returnProcessing,
      advertising, otherVariableCosts, fixedCostsPerMonth, expectedSalesPerMonth,
      pickupRate, returnRate, sellerDiscount, additionalPromo
    } = this.input;

    const totalCOGS = purchasePrice + deliveryToWarehouse + packaging + otherCOGS;
    const fixedPerUnit = expectedSalesPerMonth && expectedSalesPerMonth > 0 
      ? fixedCostsPerMonth / expectedSalesPerMonth 
      : 0;
    
    const effectivePickupRate = Math.max(0.01, (pickupRate - returnRate) / 100);
    const discountMultiplier = (1 - sellerDiscount / 100) * (1 - additionalPromo / 100);
    
    // Итеративный расчет, так как цена влияет на комиссию и налоги
    let price = 1000; // Начальная точка
    let iterations = 0;
    const maxIterations = 100;
    
    while (iterations < maxIterations) {
      const effectivePrice = price * discountMultiplier;
      const revenue = effectivePrice * effectivePickupRate;
      
      const commissionAmount = effectivePrice * (commission / 100);
      const returnsAmount = effectivePrice * (returnRate / 100) * (returnProcessing / 100);
      const marketplaceCosts = commissionAmount + logistics + storage + returnsAmount;
      
      const taxBase = this.calculateTaxBase(effectivePrice, totalCOGS, marketplaceCosts, advertising + otherVariableCosts + fixedPerUnit);
      const taxAmount = Math.max(0, taxBase * TAX_RATES[this.input.taxRegime]);
      
      const totalCosts = totalCOGS + marketplaceCosts + advertising + otherVariableCosts + fixedPerUnit + taxAmount;
      
      const profit = revenue - totalCosts;
      
      if (Math.abs(profit) < 0.01) break;
      
      // Корректируем цену
      const adjustment = profit < 0 ? 50 : -50;
      price += adjustment;
      iterations++;
    }
    
    return Math.max(0, price);
  }

  /**
   * Рассчитывает необходимый объем продаж для безубыточности (при текущей цене)
   */
  private calculateBreakEvenVolume(): number {
    const effectivePrice = this.calculateEffectivePrice();
    const effectivePickupRate = this.calculateEffectivePickupRate() / 100;
    
    if (effectivePrice <= 0 || effectivePickupRate <= 0) return 0;
    
    const revenuePerUnit = effectivePrice * effectivePickupRate;
    const breakdown = this.calculateCostBreakdown(effectivePrice);
    
    // Переменные расходы на единицу (без фиксированных и налогов)
    const variableCostsPerUnit = breakdown.totalCOGS + breakdown.marketplaceFees.total + 
                                breakdown.additionalCosts.advertising + breakdown.additionalCosts.otherVariable;
    
    const contributionMarginPerUnit = revenuePerUnit - variableCostsPerUnit;
    
    // Если маржа отрицательная или нулевая, безубыточность невозможна
    if (contributionMarginPerUnit <= 0) return Infinity;
    
    // Если нет фиксированных расходов, безубыточность достигается при 0 единиц
    if (this.input.fixedCostsPerMonth <= 0) return 0;
    
    // Объем = Фиксированные расходы / Маржа с единицы
    return this.input.fixedCostsPerMonth / contributionMarginPerUnit;
  }
}

/**
 * Основная функция для выполнения расчетов
 */
export function calculateMetrics(input: CalculationInput): CalculationResults {
  const calculator = new UnitEconomicsCalculator(input);
  return calculator.calculate();
}

/**
 * Валидация входных данных для расчетов
 */
export function validateCalculationInput(input: CalculationInput): string[] {
  const errors: string[] = [];

  // Базовые проверки
  if (input.retailPrice <= 0) {
    errors.push('Розничная цена должна быть больше 0');
  }

  if (input.purchasePrice < 0) {
    errors.push('Закупочная цена не может быть отрицательной');
  }

  if (input.pickupRate < 0 || input.pickupRate > 100) {
    errors.push('Процент выкупа должен быть от 0 до 100%');
  }

  if (input.returnRate < 0 || input.returnRate > 100) {
    errors.push('Процент возвратов должен быть от 0 до 100%');
  }

  if (input.pickupRate - input.returnRate <= 0) {
    errors.push('Эффективный процент выкупа должен быть больше 0');
  }

  if (input.sellerDiscount < 0 || input.sellerDiscount > 100) {
    errors.push('Скидка продавца должна быть от 0 до 100%');
  }

  if (input.additionalPromo < 0 || input.additionalPromo > 100) {
    errors.push('Дополнительные промо должны быть от 0 до 100%');
  }

  const totalDiscount = input.sellerDiscount + input.additionalPromo;
  if (totalDiscount >= 100) {
    errors.push('Общая сумма скидок не может быть 100% или больше');
  }

  return errors;
}

/**
 * Проверка критических ошибок, которые делают расчет невозможным
 */
export function hasCalculationErrors(input: CalculationInput): boolean {
  return validateCalculationInput(input).length > 0;
}
