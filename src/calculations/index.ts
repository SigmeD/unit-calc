/**
 * Модуль расчетов юнит-экономики
 * Этап 4: Движок расчетов
 */

export { 
  calculateMetrics, 
  validateCalculationInput, 
  hasCalculationErrors,
  UnitEconomicsCalculator
} from './calculator';

// Реэкспорт типов для удобства
export type { 
  CalculationInput, 
  CalculationResults, 
  CostBreakdown 
} from '../types';
