/**
 * Unit тесты для хука useFormProgress
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormProgress } from '../useFormProgress';
import type { CalculationInput } from '../../types';

describe('useFormProgress', () => {
  const emptyInput: CalculationInput = {
    purchasePrice: 0,
    deliveryToWarehouse: 0,
    packaging: 0,
    otherCOGS: 0,
    commission: 15,
    logistics: 0,
    storage: 0,
    returnProcessing: 0,
    pickupRate: 70,
    returnRate: 15,
    advertising: 0,
    otherVariableCosts: 0,
    fixedCostsPerMonth: 0,
    expectedSalesPerMonth: 100,
    taxRegime: 'USN_6',
    retailPrice: 1000,
    sellerDiscount: 0,
    additionalPromo: 0,
    specificData: {}
  };

  const fullInput: CalculationInput = {
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

  describe('Расчет прогресса', () => {
    it('должен рассчитывать прогресс для данных с дефолтными значениями', () => {
      const { result } = renderHook(() => useFormProgress(emptyInput));

      // emptyInput содержит некоторые дефолтные значения (commission: 15, pickupRate: 70, etc.)
      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.filledFields).toBeGreaterThan(0);
      expect(result.current.totalFields).toBeGreaterThan(0);
    });

    it('должен возвращать 100% для полностью заполненных данных', () => {
      const { result } = renderHook(() => useFormProgress(fullInput));

      expect(result.current.progress).toBe(100);
      expect(result.current.filledFields).toBe(result.current.totalFields);
    });

    it('должен правильно считать частично заполненные данные', () => {
      const partialInput: CalculationInput = {
        ...emptyInput,
        purchasePrice: 500,
        retailPrice: 1500,
        advertising: 100
      };

      const { result } = renderHook(() => useFormProgress(partialInput));

      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.progress).toBeLessThan(100);
      expect(result.current.filledFields).toBeGreaterThan(0);
      expect(result.current.filledFields).toBeLessThan(result.current.totalFields);
    });
  });

  describe('Анализ секций', () => {
    it('должен определять завершенные секции', () => {
      const { result } = renderHook(() => useFormProgress(fullInput));

      expect(result.current.completedSections).toBeInstanceOf(Array);
      expect(result.current.completedSections.length).toBeGreaterThan(0);
    });

    it('должен определять незавершенные секции', () => {
      const { result } = renderHook(() => useFormProgress(emptyInput));

      expect(result.current.missingSections).toBeInstanceOf(Array);
      expect(result.current.missingSections.length).toBeGreaterThan(0);
    });

    it('должен определять секции по категориям', () => {
      const partialInput: CalculationInput = {
        ...emptyInput,
        purchasePrice: 500,
        deliveryToWarehouse: 50,
        packaging: 30
      };

      const { result } = renderHook(() => useFormProgress(partialInput));

      const sections = [...result.current.completedSections, ...result.current.missingSections];
      expect(sections).toContain('Себестоимость');
      expect(sections).toContain('Ценообразование');
      expect(sections).toContain('Расходы маркетплейса');
    });
  });

  describe('Реактивность', () => {
    it('должен обновляться при изменении входных данных', () => {
      const { result, rerender } = renderHook(
        ({ input }) => useFormProgress(input),
        { initialProps: { input: emptyInput } }
      );

      const initialProgress = result.current.progress;

      // Обновляем данные
      rerender({ input: { ...emptyInput, purchasePrice: 500 } });

      expect(result.current.progress).toBeGreaterThan(initialProgress);
    });

    it('должен корректно обрабатывать изменения обязательных полей', () => {
      const { result, rerender } = renderHook(
        ({ input }) => useFormProgress(input),
        { initialProps: { input: emptyInput } }
      );

      // Заполняем обязательные поля
      const inputWithRequired = {
        ...emptyInput,
        purchasePrice: 500,
        retailPrice: 1500
      };

      rerender({ input: inputWithRequired });

      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.filledFields).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Валидация данных', () => {
    it('должен игнорировать нулевые значения как незаполненные', () => {
      const zeroInput: CalculationInput = {
        ...emptyInput,
        purchasePrice: 0,
        advertising: 0,
        // Убираем дефолтные значения
        commission: 0,
        pickupRate: 0,
        returnRate: 0,
        expectedSalesPerMonth: 0,
        retailPrice: 0
      };

      const { result } = renderHook(() => useFormProgress(zeroInput));

      // Прогресс должен быть близок к 0, но не обязательно точно 0 из-за taxRegime
      expect(result.current.progress).toBeLessThan(20);
    });

    it('должен учитывать отрицательные значения как заполненные', () => {
      const negativeInput: CalculationInput = {
        ...emptyInput,
        purchasePrice: -100
      };

      const { result } = renderHook(() => useFormProgress(negativeInput));

      expect(result.current.progress).toBeGreaterThan(0);
    });

    it('должен корректно обрабатывать дробные значения', () => {
      const decimalInput: CalculationInput = {
        ...emptyInput,
        purchasePrice: 499.99,
        commission: 12.5
      };

      const { result } = renderHook(() => useFormProgress(decimalInput));

      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.filledFields).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Специальные поля', () => {
    it('должен учитывать обязательные поля с дефолтными значениями', () => {
      // Поля как pickupRate, commission имеют дефолтные значения
      const { result } = renderHook(() => useFormProgress(emptyInput));

      // Даже в "пустом" input есть поля с дефолтными значениями
      expect(result.current.filledFields).toBeGreaterThan(0);
    });

    it('должен правильно обрабатывать enum поля', () => {
      const withEnumInput: CalculationInput = {
        ...emptyInput,
        taxRegime: 'USN_15'
      };

      const { result } = renderHook(() => useFormProgress(withEnumInput));

      expect(result.current.filledFields).toBeGreaterThan(0);
    });
  });
});
