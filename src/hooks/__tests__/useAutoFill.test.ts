/**
 * Unit тесты для хука useAutoFill
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAutoFill } from '../useAutoFill';
import type { CalculationInput, MarketplaceId } from '../../types';

describe('useAutoFill', () => {
  const baseInput: CalculationInput = {
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

  describe('Инициализация для Wildberries', () => {
    it('должен возвращать корректную структуру данных', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: baseInput
      }));

      expect(result.current.suggestions).toBeDefined();
      expect(result.current.applySuggestions).toBeInstanceOf(Function);
      expect(result.current.getSuggestionForField).toBeInstanceOf(Function);
      expect(result.current.categories).toBeInstanceOf(Array);
      expect(result.current.categories).toHaveLength(3);
    });

    it('должен предоставлять предложения для низкой ценовой категории', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'low_price',
        currentInput: baseInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.purchasePrice).toBe(150);
      expect(suggestions.retailPrice).toBe(450);
      expect(suggestions.deliveryToWarehouse).toBe(25);
      expect(suggestions.logistics).toBe(0); // WB бесплатная логистика
      expect(suggestions.pickupRate).toBe(70); // Сохраняем из currentInput
    });

    it('должен предоставлять предложения для средней ценовой категории', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: baseInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.purchasePrice).toBe(500);
      expect(suggestions.retailPrice).toBe(1200);
      expect(suggestions.deliveryToWarehouse).toBe(75);
      expect(suggestions.advertising).toBe(150);
    });

    it('должен предоставлять предложения для высокой ценовой категории', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'high_price',
        currentInput: baseInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.purchasePrice).toBe(1200);
      expect(suggestions.retailPrice).toBe(3500);
      expect(suggestions.deliveryToWarehouse).toBe(200);
      expect(suggestions.advertising).toBe(400);
      expect(suggestions.expectedSalesPerMonth).toBe(20);
    });
  });

  describe('Инициализация для Ozon', () => {
    it('должен предоставлять корректные предложения для Ozon', () => {
      // Используем пустой input, чтобы взялись дефолтные значения Ozon
      const emptyInput = { ...baseInput, pickupRate: 0, returnRate: 0 };
      
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'ozon',
        priceCategory: 'mid_price',
        currentInput: emptyInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.purchasePrice).toBe(500);
      expect(suggestions.logistics).toBe(85); // Ozon платная логистика
      expect(suggestions.pickupRate).toBe(65); // Дефолтное значение Ozon
      expect(suggestions.returnRate).toBe(20); // Дефолтное значение Ozon
    });

    it('должен учитывать различия в логистике для Ozon', () => {
      // Используем пустой input, чтобы взялись дефолтные значения Ozon
      const emptyInput = { ...baseInput, pickupRate: 0, returnRate: 0 };
      
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'ozon',
        priceCategory: 'low_price',
        currentInput: emptyInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.logistics).toBe(35);
      expect(suggestions.pickupRate).toBe(65);
      expect(suggestions.returnRate).toBe(20);
    });
  });

  describe('Сохранение пользовательских данных', () => {
    it('должен сохранять заполненные пользователем значения', () => {
      const customInput: CalculationInput = {
        ...baseInput,
        commission: 20,
        pickupRate: 85,
        returnRate: 10
      };

      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: customInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.commission).toBe(20); // Сохранен пользовательский
      expect(suggestions.pickupRate).toBe(85); // Сохранен пользовательский
      expect(suggestions.returnRate).toBe(10); // Сохранен пользовательский
    });

    it('должен использовать дефолтные значения если пользователь не задал', () => {
      const emptyInput: CalculationInput = {
        ...baseInput,
        commission: 0,
        pickupRate: 0,
        returnRate: 0
      };

      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: emptyInput
      }));

      const suggestions = result.current.suggestions;

      expect(suggestions.pickupRate).toBe(70); // Дефолт WB
      expect(suggestions.returnRate).toBe(15); // Дефолт WB
    });
  });

  describe('Работа с категориями', () => {
    it('должен возвращать корректную информацию о категориях', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: baseInput
      }));

      const categories = result.current.categories;

      expect(categories).toHaveLength(3);
      
      const lowPrice = categories.find(c => c.key === 'low_price');
      expect(lowPrice).toBeDefined();
      expect(lowPrice?.name).toBe('Бюджетный товар');
      expect(lowPrice?.priceRange).toBe('до 500₽');

      const midPrice = categories.find(c => c.key === 'mid_price');
      expect(midPrice).toBeDefined();
      expect(midPrice?.name).toBe('Средний ценовой сегмент');
      expect(midPrice?.priceRange).toBe('500-2000₽');

      const highPrice = categories.find(c => c.key === 'high_price');
      expect(highPrice).toBeDefined();
      expect(highPrice?.name).toBe('Премиум товары');
      expect(highPrice?.priceRange).toBe('от 2000₽');
    });
  });

  describe('Утилитарные функции', () => {
    it('applySuggestions должен возвращать все предложения', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: baseInput
      }));

      const applied = result.current.applySuggestions();
      const suggestions = result.current.suggestions;

      expect(applied).toEqual(suggestions);
    });

    it('getSuggestionForField должен возвращать значение для конкретного поля', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: baseInput
      }));

      expect(result.current.getSuggestionForField('purchasePrice')).toBe(500);
      expect(result.current.getSuggestionForField('retailPrice')).toBe(1200);
      expect(result.current.getSuggestionForField('advertising')).toBe(150);
    });

    it('getSuggestionForField должен возвращать undefined для несуществующих полей', () => {
      const { result } = renderHook(() => useAutoFill({
        marketplace: 'wildberries',
        priceCategory: 'mid_price',
        currentInput: baseInput
      }));

      expect(result.current.getSuggestionForField('nonExistentField' as any)).toBeUndefined();
    });
  });

  describe('Реактивность', () => {
    it('должен обновляться при изменении маркетплейса', () => {
      const { result, rerender } = renderHook(
        ({ marketplace }) => useAutoFill({
          marketplace,
          priceCategory: 'mid_price',
          currentInput: baseInput
        }),
        { initialProps: { marketplace: 'wildberries' as MarketplaceId } }
      );

      const wbLogistics = result.current.suggestions.logistics;
      expect(wbLogistics).toBe(0);

      rerender({ marketplace: 'ozon' });

      const ozonLogistics = result.current.suggestions.logistics;
      expect(ozonLogistics).toBe(85);
    });

    it('должен обновляться при изменении ценовой категории', () => {
      const { result, rerender } = renderHook(
        ({ priceCategory }) => useAutoFill({
          marketplace: 'wildberries',
          priceCategory,
          currentInput: baseInput
        }),
        { initialProps: { priceCategory: 'low_price' as const } }
      );

      expect(result.current.suggestions.purchasePrice).toBe(150);

      rerender({ priceCategory: 'low_price' });

      expect(result.current.suggestions.purchasePrice).toBe(150);
    });

    it('должен обновляться при изменении текущих данных', () => {
      const { result, rerender } = renderHook(
        ({ currentInput }) => useAutoFill({
          marketplace: 'wildberries',
          priceCategory: 'mid_price',
          currentInput
        }),
        { initialProps: { currentInput: baseInput } }
      );

      expect(result.current.suggestions.commission).toBe(15);

      const updatedInput = { ...baseInput, commission: 25 };
      rerender({ currentInput: updatedInput });

      expect(result.current.suggestions.commission).toBe(25);
    });
  });
});
