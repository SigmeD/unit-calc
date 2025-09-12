/**
 * Хук для автоматических расчетов юнит-экономики
 * Реализует мгновенный пересчет при изменении данных
 */

import { useEffect, useCallback, useMemo } from 'react';
import { calculateMetrics, validateCalculationInput, hasCalculationErrors } from '../calculations';
import type { CalculationInput, CalculationResults } from '../types';

interface UseCalculationsOptions {
  input: CalculationInput;
  onResults: (results: CalculationResults) => void;
  onErrors: (errors: Record<string, string>) => void;
  onCalculating: (isCalculating: boolean) => void;
  debounceMs?: number;
}

/**
 * Хук для автоматических расчетов с валидацией
 */
export const useCalculations = ({
  input,
  onResults,
  onErrors,
  onCalculating,
  debounceMs = 300
}: UseCalculationsOptions) => {

  // Мемоизируем валидацию входных данных
  const validationErrors = useMemo(() => {
    const errors = validateCalculationInput(input);
    return errors.reduce((acc, error, index) => {
      acc[`validation_${index}`] = error;
      return acc;
    }, {} as Record<string, string>);
  }, [input]);

  // Проверяем, можно ли выполнять расчеты
  const canCalculate = useMemo(() => {
    return !hasCalculationErrors(input) && Object.keys(validationErrors).length === 0;
  }, [input, validationErrors]);

  // Функция выполнения расчетов
  const performCalculation = useCallback(async () => {
    if (!canCalculate) {
      onErrors(validationErrors);
      return;
    }

    onCalculating(true);
    onErrors({}); // Очищаем предыдущие ошибки

    try {
      // Имитируем небольшую задержку для показа состояния загрузки
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const results = calculateMetrics(input);
      onResults(results);
    } catch (error) {
      console.error('Ошибка при выполнении расчетов:', error);
      onErrors({
        calculation: error instanceof Error ? error.message : 'Ошибка при выполнении расчетов'
      });
    } finally {
      onCalculating(false);
    }
  }, [input, canCalculate, validationErrors, onResults, onErrors, onCalculating]);

  // Дебаунс для автоматических расчетов
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performCalculation();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [performCalculation, debounceMs]);

  // Функция для принудительного пересчета (например, по кнопке)
  const forceCalculate = useCallback(() => {
    performCalculation();
  }, [performCalculation]);

  return {
    canCalculate,
    validationErrors,
    forceCalculate
  };
};

/**
 * Хук для получения объяснений формул
 */
export const useFormulaExplanations = () => {
  const explanations = useMemo(() => ({
    revenue: {
      title: 'Выручка',
      formula: 'Эффективная цена × Эффективный % выкупа',
      description: 'Фактическая выручка с учетом скидок и процента выкупа'
    },
    cm1: {
      title: 'CM1 (Contribution Margin 1)',
      formula: 'Выручка - Себестоимость - Расходы маркетплейса',
      description: 'Маржинальная прибыль после покрытия прямых расходов'
    },
    cm2: {
      title: 'CM2 (Contribution Margin 2)', 
      formula: 'CM1 - Реклама',
      description: 'Маржинальная прибыль после рекламных расходов'
    },
    netProfit: {
      title: 'Чистая прибыль',
      formula: 'CM2 - Прочие переменные - Доля фиксированных - Налоги',
      description: 'Итоговая прибыль с единицы товара'
    },
    marginPercent: {
      title: 'Маржинальность',
      formula: '(Чистая прибыль / Выручка) × 100%',
      description: 'Процент прибыли от выручки'
    },
    roi: {
      title: 'ROI (Return on Investment)',
      formula: '(Чистая прибыль / Себестоимость) × 100%',
      description: 'Возврат на инвестиции в товар'
    },
    adRoi: {
      title: 'ROI на рекламу',
      formula: '(Прибыль от рекламы / Затраты на рекламу) × 100%',
      description: 'Эффективность рекламных расходов'
    },
    acos: {
      title: 'ACoS (Advertising Cost of Sales)',
      formula: '(Затраты на рекламу / Выручка) × 100%',
      description: 'Доля рекламных расходов в выручке'
    },
    breakEvenPrice: {
      title: 'Точка безубыточности по цене',
      formula: 'Цена, при которой чистая прибыль = 0',
      description: 'Минимальная розничная цена для безубыточности'
    },
    breakEvenVolume: {
      title: 'Точка безубыточности по объему',
      formula: 'Фиксированные расходы / Маржа с единицы',
      description: 'Необходимое количество продаж в месяц для покрытия фиксированных расходов'
    }
  }), []);

  const getExplanation = useCallback((metric: string) => {
    return explanations[metric as keyof typeof explanations] || null;
  }, [explanations]);

  return {
    explanations,
    getExplanation
  };
};

/**
 * Хук для анализа прибыльности
 */
export const useProfitabilityAnalysis = (results: CalculationResults | null) => {
  const analysis = useMemo(() => {
    if (!results) return null;

    const { netProfit, marginPercent, roi, acos, status } = results;

    // Анализ статуса
    const statusAnalysis = {
      profit: {
        color: 'green',
        message: 'Товар прибыльный! 💰',
        recommendation: 'Можно увеличивать объемы продаж'
      },
      loss: {
        color: 'red', 
        message: 'Товар убыточный ⚠️',
        recommendation: 'Необходимо снижать расходы или повышать цену'
      },
      breakeven: {
        color: 'yellow',
        message: 'Товар в точке безубыточности',
        recommendation: 'Небольшие изменения могут существенно повлиять на прибыльность'
      }
    };

    // Анализ маржинальности
    const marginAnalysis = (() => {
      if (marginPercent >= 30) return { level: 'excellent', text: 'Отличная маржинальность' };
      if (marginPercent >= 20) return { level: 'good', text: 'Хорошая маржинальность' };
      if (marginPercent >= 10) return { level: 'acceptable', text: 'Приемлемая маржинальность' };
      if (marginPercent >= 0) return { level: 'low', text: 'Низкая маржинальность' };
      return { level: 'negative', text: 'Отрицательная маржинальность' };
    })();

    // Анализ ROI
    const roiAnalysis = (() => {
      if (roi >= 100) return { level: 'excellent', text: 'Превосходный ROI' };
      if (roi >= 50) return { level: 'good', text: 'Хороший ROI' };
      if (roi >= 20) return { level: 'acceptable', text: 'Приемлемый ROI' };
      if (roi >= 0) return { level: 'low', text: 'Низкий ROI' };
      return { level: 'negative', text: 'Отрицательный ROI' };
    })();

    // Анализ ACoS
    const acosAnalysis = (() => {
      if (acos <= 10) return { level: 'excellent', text: 'Отличная эффективность рекламы' };
      if (acos <= 20) return { level: 'good', text: 'Хорошая эффективность рекламы' };
      if (acos <= 30) return { level: 'acceptable', text: 'Приемлемая эффективность рекламы' };
      if (acos <= 50) return { level: 'high', text: 'Высокие рекламные расходы' };
      return { level: 'excessive', text: 'Чрезмерные рекламные расходы' };
    })();

    return {
      status: statusAnalysis[status],
      margin: marginAnalysis,
      roi: roiAnalysis,
      acos: acosAnalysis,
      netProfit
    };
  }, [results]);

  return analysis;
};

export default useCalculations;
