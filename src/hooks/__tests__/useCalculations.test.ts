/**
 * Unit тесты для хука useCalculations
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCalculations, useFormulaExplanations, useProfitabilityAnalysis } from '../useCalculations';
import type { CalculationInput, CalculationResults } from '../../types';

// Мокаем модуль расчетов
vi.mock('../../calculations', () => ({
  calculateMetrics: vi.fn(),
  validateCalculationInput: vi.fn(),
  hasCalculationErrors: vi.fn()
}));

// Импортируем мокнутые функции
import { calculateMetrics, validateCalculationInput, hasCalculationErrors } from '../../calculations';

describe('useCalculations', () => {
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

  const mockOnResults = vi.fn();
  const mockOnErrors = vi.fn();
  const mockOnCalculating = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateCalculationInput).mockReturnValue([]);
    vi.mocked(hasCalculationErrors).mockReturnValue(false);
    vi.mocked(calculateMetrics).mockReturnValue(mockResults);
  });

  describe('Базовая функциональность', () => {
    it('должен инициализироваться с корректными начальными значениями', () => {
      const { result } = renderHook(() => useCalculations({
        input: mockInput,
        onResults: mockOnResults,
        onErrors: mockOnErrors,
        onCalculating: mockOnCalculating
      }));

      expect(result.current.canCalculate).toBe(true);
      expect(result.current.validationErrors).toEqual({});
      expect(typeof result.current.forceCalculate).toBe('function');
    });

    it('должен выполнять автоматический расчет при изменении входных данных', async () => {
      const { rerender } = renderHook(
        ({ input }) => useCalculations({
          input,
          onResults: mockOnResults,
          onErrors: mockOnErrors,
          onCalculating: mockOnCalculating,
          debounceMs: 50
        }),
        { initialProps: { input: mockInput } }
      );

      // Ждем завершения дебаунса
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledWith(mockResults);
      }, { timeout: 200 });

      expect(mockOnCalculating).toHaveBeenCalledWith(true);
      expect(mockOnCalculating).toHaveBeenCalledWith(false);
    });

    it('должен обрабатывать принудительный пересчет', async () => {
      const { result } = renderHook(() => useCalculations({
        input: mockInput,
        onResults: mockOnResults,
        onErrors: mockOnErrors,
        onCalculating: mockOnCalculating,
        debounceMs: 1000 // Большой дебаунс для тестирования принудительного расчета
      }));

      act(() => {
        result.current.forceCalculate();
      });

      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledWith(mockResults);
      });
    });
  });

  describe('Валидация данных', () => {
    it('должен обрабатывать ошибки валидации', async () => {
      const validationErrors = ['Цена должна быть больше 0'];
      vi.mocked(validateCalculationInput).mockReturnValue(validationErrors);
      vi.mocked(hasCalculationErrors).mockReturnValue(true);

      const { result } = renderHook(() => useCalculations({
        input: mockInput,
        onResults: mockOnResults,
        onErrors: mockOnErrors,
        onCalculating: mockOnCalculating,
        debounceMs: 50
      }));

      expect(result.current.canCalculate).toBe(false);
      expect(result.current.validationErrors).toEqual({
        'validation_0': 'Цена должна быть больше 0'
      });

      await waitFor(() => {
        expect(mockOnErrors).toHaveBeenCalledWith({
          'validation_0': 'Цена должна быть больше 0'
        });
      });
    });

    it('должен блокировать расчеты при наличии ошибок', () => {
      vi.mocked(hasCalculationErrors).mockReturnValue(true);

      const { result } = renderHook(() => useCalculations({
        input: mockInput,
        onResults: mockOnResults,
        onErrors: mockOnErrors,
        onCalculating: mockOnCalculating
      }));

      expect(result.current.canCalculate).toBe(false);
    });
  });

  describe('Обработка ошибок', () => {
    it('должен обрабатывать ошибки при расчетах', async () => {
      const error = new Error('Ошибка расчета');
      vi.mocked(calculateMetrics).mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useCalculations({
        input: mockInput,
        onResults: mockOnResults,
        onErrors: mockOnErrors,
        onCalculating: mockOnCalculating,
        debounceMs: 50
      }));

      await waitFor(() => {
        expect(mockOnErrors).toHaveBeenCalledWith({
          calculation: 'Ошибка расчета'
        });
      });

      expect(mockOnCalculating).toHaveBeenCalledWith(false);
    });
  });

  describe('Дебаунс', () => {
    it('должен применять дебаунс к автоматическим расчетам', async () => {
      // Сбрасываем моки перед тестом
      vi.clearAllMocks();
      
      const { rerender } = renderHook(
        ({ input }) => useCalculations({
          input,
          onResults: mockOnResults,
          onErrors: mockOnErrors,
          onCalculating: mockOnCalculating,
          debounceMs: 100
        }),
        { initialProps: { input: mockInput } }
      );

      // Ждем первый вызов после инициализации
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledTimes(1);
      }, { timeout: 200 });

      // Сбрасываем счетчик вызовов
      vi.clearAllMocks();

      // Быстро меняем входные данные
      rerender({ input: { ...mockInput, retailPrice: 1500 } });
      rerender({ input: { ...mockInput, retailPrice: 1800 } });
      rerender({ input: { ...mockInput, retailPrice: 2200 } });

      // Должен быть вызван только один раз после дебаунса
      await waitFor(() => {
        expect(mockOnResults).toHaveBeenCalledTimes(1);
      }, { timeout: 300 });
    });
  });
});

describe('useFormulaExplanations', () => {
  it('должен возвращать объяснения для всех метрик', () => {
    const { result } = renderHook(() => useFormulaExplanations());

    expect(result.current.explanations).toBeDefined();
    expect(result.current.explanations.revenue).toBeDefined();
    expect(result.current.explanations.cm1).toBeDefined();
    expect(result.current.explanations.netProfit).toBeDefined();
    expect(result.current.explanations.roi).toBeDefined();
  });

  it('должен возвращать объяснение для конкретной метрики', () => {
    const { result } = renderHook(() => useFormulaExplanations());

    const revenueExplanation = result.current.getExplanation('revenue');
    expect(revenueExplanation).toBeDefined();
    expect(revenueExplanation?.title).toBe('Выручка');
    expect(revenueExplanation?.formula).toContain('Эффективная цена');
  });

  it('должен возвращать null для неизвестной метрики', () => {
    const { result } = renderHook(() => useFormulaExplanations());

    const unknownExplanation = result.current.getExplanation('unknown');
    expect(unknownExplanation).toBeNull();
  });
});

describe('useProfitabilityAnalysis', () => {
  const baseMockResults: CalculationResults = {
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

  it('должен возвращать null для пустых результатов', () => {
    const { result } = renderHook(() => useProfitabilityAnalysis(null));

    expect(result.current).toBeNull();
  });

  it('должен анализировать прибыльный товар', () => {
    const profitableResults: CalculationResults = {
      ...baseMockResults,
      netProfit: 500,
      marginPercent: 25,
      roi: 80,
      acos: 15,
      status: 'profit'
    };

    const { result } = renderHook(() => useProfitabilityAnalysis(profitableResults));

    expect(result.current).toBeDefined();
    expect(result.current?.status.color).toBe('green');
    expect(result.current?.status.message).toContain('прибыльный');
    expect(result.current?.margin.level).toBe('good');
    expect(result.current?.roi.level).toBe('good');
  });

  it('должен анализировать убыточный товар', () => {
    const lossResults: CalculationResults = {
      ...baseMockResults,
      netProfit: -200,
      marginPercent: -15,
      roi: -40,
      acos: 45,
      status: 'loss'
    };

    const { result } = renderHook(() => useProfitabilityAnalysis(lossResults));

    expect(result.current).toBeDefined();
    expect(result.current?.status.color).toBe('red');
    expect(result.current?.status.message).toContain('убыточный');
    expect(result.current?.margin.level).toBe('negative');
    expect(result.current?.roi.level).toBe('negative');
  });

  it('должен анализировать товар в точке безубыточности', () => {
    const breakevenResults: CalculationResults = {
      ...baseMockResults,
      netProfit: 0,
      marginPercent: 0,
      roi: 0,
      acos: 25,
      status: 'breakeven'
    };

    const { result } = renderHook(() => useProfitabilityAnalysis(breakevenResults));

    expect(result.current).toBeDefined();
    expect(result.current?.status.color).toBe('yellow');
    expect(result.current?.status.message).toContain('безубыточности');
  });

  it('должен правильно классифицировать уровни метрик', () => {
    // Отличная маржинальность
    const excellentResults: CalculationResults = {
      ...baseMockResults,
      marginPercent: 35,
      roi: 150,
      acos: 8
    };

    const { result } = renderHook(() => useProfitabilityAnalysis(excellentResults));

    expect(result.current?.margin.level).toBe('excellent');
    expect(result.current?.roi.level).toBe('excellent');
    expect(result.current?.acos.level).toBe('excellent');
  });
});
