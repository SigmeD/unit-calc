import { useMemo } from 'react';
import type { CalculationInput, MarketplaceId } from '../types';

// Средние значения для разных категорий товаров
const DEFAULT_VALUES = {
  wildberries: {
    low_price: { // до 500₽
      purchasePrice: 150,
      deliveryToWarehouse: 25,
      packaging: 15,
      otherCOGS: 10,
      logistics: 0, // WB бесплатная логистика для покупателя
      storage: 10,
      returnProcessing: 15,
      advertising: 50,
      otherVariableCosts: 5,
      fixedCostsPerMonth: 10000,
      expectedSalesPerMonth: 100,
      retailPrice: 450,
      sellerDiscount: 10,
      additionalPromo: 5
    },
    mid_price: { // 500-2000₽
      purchasePrice: 500,
      deliveryToWarehouse: 75,
      packaging: 35,
      otherCOGS: 40,
      logistics: 0,
      storage: 25,
      returnProcessing: 35,
      advertising: 150,
      otherVariableCosts: 20,
      fixedCostsPerMonth: 15000,
      expectedSalesPerMonth: 50,
      retailPrice: 1200,
      sellerDiscount: 15,
      additionalPromo: 10
    },
    high_price: { // от 2000₽
      purchasePrice: 1200,
      deliveryToWarehouse: 200,
      packaging: 80,
      otherCOGS: 120,
      logistics: 0,
      storage: 60,
      returnProcessing: 80,
      advertising: 400,
      otherVariableCosts: 50,
      fixedCostsPerMonth: 25000,
      expectedSalesPerMonth: 20,
      retailPrice: 3500,
      sellerDiscount: 20,
      additionalPromo: 15
    }
  },
  ozon: {
    low_price: {
      purchasePrice: 150,
      deliveryToWarehouse: 25,
      packaging: 15,
      otherCOGS: 10,
      logistics: 35, // Ozon берет за логистику
      storage: 15,
      returnProcessing: 20,
      advertising: 60,
      otherVariableCosts: 10,
      fixedCostsPerMonth: 12000,
      expectedSalesPerMonth: 80,
      retailPrice: 450,
      sellerDiscount: 8,
      additionalPromo: 3
    },
    mid_price: {
      purchasePrice: 500,
      deliveryToWarehouse: 75,
      packaging: 35,
      otherCOGS: 40,
      logistics: 85,
      storage: 35,
      returnProcessing: 45,
      advertising: 180,
      otherVariableCosts: 25,
      fixedCostsPerMonth: 18000,
      expectedSalesPerMonth: 40,
      retailPrice: 1200,
      sellerDiscount: 12,
      additionalPromo: 8
    },
    high_price: {
      purchasePrice: 1200,
      deliveryToWarehouse: 200,
      packaging: 80,
      otherCOGS: 120,
      logistics: 150,
      storage: 80,
      returnProcessing: 100,
      advertising: 500,
      otherVariableCosts: 60,
      fixedCostsPerMonth: 30000,
      expectedSalesPerMonth: 15,
      retailPrice: 3500,
      sellerDiscount: 18,
      additionalPromo: 12
    }
  }
};

interface AutoFillOptions {
  marketplace: MarketplaceId;
  priceCategory?: 'low_price' | 'mid_price' | 'high_price';
  currentInput: CalculationInput;
}

interface AutoFillResult {
  suggestions: Partial<CalculationInput>;
  applySuggestions: () => Partial<CalculationInput>;
  getSuggestionForField: (field: keyof CalculationInput) => number | string | undefined;
  categories: Array<{
    key: 'low_price' | 'mid_price' | 'high_price';
    name: string;
    description: string;
    priceRange: string;
  }>;
}

export const useAutoFill = ({ 
  marketplace, 
  priceCategory = 'mid_price', 
  currentInput 
}: AutoFillOptions): AutoFillResult => {
  
  return useMemo(() => {
    const marketplaceDefaults = DEFAULT_VALUES[marketplace];
    const categoryDefaults = marketplaceDefaults[priceCategory];

    const categories = [
      {
        key: 'low_price' as const,
        name: 'Бюджетный товар',
        description: 'Товары массового потребления',
        priceRange: 'до 500₽'
      },
      {
        key: 'mid_price' as const,
        name: 'Средний ценовой сегмент',
        description: 'Популярная категория товаров',
        priceRange: '500-2000₽'
      },
      {
        key: 'high_price' as const,
        name: 'Премиум товары',
        description: 'Товары высокого качества',
        priceRange: 'от 2000₽'
      }
    ];

    const suggestions: Partial<CalculationInput> = {
      ...categoryDefaults,
      // Сохраняем некоторые поля, которые пользователь уже мог заполнить
      commission: currentInput.commission || categoryDefaults.commission,
      pickupRate: currentInput.pickupRate || (marketplace === 'wildberries' ? 70 : 65),
      returnRate: currentInput.returnRate || (marketplace === 'wildberries' ? 15 : 20),
      taxRegime: currentInput.taxRegime || 'USN_6'
    };

    const applySuggestions = (): Partial<CalculationInput> => {
      return suggestions;
    };

    const getSuggestionForField = (field: keyof CalculationInput): number | string | undefined => {
      return suggestions[field];
    };

    return {
      suggestions,
      applySuggestions,
      getSuggestionForField,
      categories
    };
  }, [marketplace, priceCategory, currentInput]);
};

export default useAutoFill;
