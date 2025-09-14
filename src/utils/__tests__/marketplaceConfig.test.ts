/**
 * Unit тесты для утилит конфигурации маркетплейсов
 */

import { describe, it, expect } from 'vitest';
import {
  loadMarketplaces,
  getMarketplaceById,
  applyMarketplacePresets,
  validateMarketplaceValues,
  getCommissionRangeForCategory,
  createInitialInput,
  marketplaceSupports,
  formatMarketplaceDisplayName
} from '../marketplaceConfig';
import type { CalculationInput, MarketplaceId } from '../../types';

describe('marketplaceConfig', () => {
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

  describe('loadMarketplaces', () => {
    it('должен загружать конфигурации маркетплейсов', () => {
      const marketplaces = loadMarketplaces();

      expect(marketplaces).toHaveLength(2);
      expect(marketplaces.map(mp => mp.id)).toEqual(['wildberries', 'ozon']);
    });

    it('должен возвращать корректную структуру для Wildberries', () => {
      const marketplaces = loadMarketplaces();
      const wb = marketplaces.find(mp => mp.id === 'wildberries');

      expect(wb).toBeDefined();
      expect(wb?.name).toBe('Wildberries');
      expect(wb?.defaultValues.commission).toBe(17);
      expect(wb?.defaultValues.logistics).toBe(0);
      expect(wb?.defaultValues.pickupRate).toBe(70);
      expect(wb?.defaultValues.returnRate).toBe(15);
      expect(wb?.config.defaultCommission).toBe(17);
    });

    it('должен возвращать корректную структуру для Ozon', () => {
      const marketplaces = loadMarketplaces();
      const ozon = marketplaces.find(mp => mp.id === 'ozon');

      expect(ozon).toBeDefined();
      expect(ozon?.name).toBe('Ozon');
      expect(ozon?.defaultValues.commission).toBe(15);
      expect(ozon?.defaultValues.logistics).toBe(35);
      expect(ozon?.defaultValues.pickupRate).toBe(65);
      expect(ozon?.defaultValues.returnRate).toBe(20);
      expect(ozon?.config.defaultCommission).toBe(15);
    });

    it('должен включать специфичные поля для маркетплейсов', () => {
      const marketplaces = loadMarketplaces();
      const wb = marketplaces.find(mp => mp.id === 'wildberries');
      const ozon = marketplaces.find(mp => mp.id === 'ozon');

      expect(wb?.config.specificFields).toContainEqual({
        id: 'spp',
        name: 'СПП (бонусы)',
        type: 'percentage',
        tooltip: 'Система персональных предложений - дополнительная скидка за счет маркетплейса'
      });

      expect(ozon?.config.specificFields).toContainEqual({
        id: 'lastMile',
        name: 'Последняя миля',
        type: 'currency',
        tooltip: 'Стоимость доставки до клиента'
      });
    });

    it('должен включать диапазоны комиссий по категориям', () => {
      const marketplaces = loadMarketplaces();
      const wb = marketplaces.find(mp => mp.id === 'wildberries');

      expect(wb?.config.commissionRanges?.fashion).toEqual({ min: 15, max: 20 });
      expect(wb?.config.commissionRanges?.electronics).toEqual({ min: 12, max: 18 });
    });
  });

  describe('getMarketplaceById', () => {
    it('должен возвращать маркетплейс по ID', () => {
      const wb = getMarketplaceById('wildberries');
      const ozon = getMarketplaceById('ozon');

      expect(wb?.id).toBe('wildberries');
      expect(ozon?.id).toBe('ozon');
    });

    it('должен возвращать null для несуществующего ID', () => {
      const nonExistent = getMarketplaceById('nonexistent' as MarketplaceId);

      expect(nonExistent).toBeNull();
    });
  });

  describe('applyMarketplacePresets', () => {
    it('должен применять предустановки Wildberries', () => {
      const wb = getMarketplaceById('wildberries')!;
      const result = applyMarketplacePresets(mockInput, wb);

      expect(result.commission).toBe(17);
      expect(result.logistics).toBe(0);
      expect(result.pickupRate).toBe(70);
      expect(result.returnRate).toBe(15);
      expect(result.specificData?.marketplace).toBe('wildberries');
    });

    it('должен применять предустановки Ozon', () => {
      const ozon = getMarketplaceById('ozon')!;
      const result = applyMarketplacePresets(mockInput, ozon);

      expect(result.commission).toBe(15);
      expect(result.logistics).toBe(35);
      expect(result.pickupRate).toBe(65);
      expect(result.returnRate).toBe(20);
      expect(result.specificData?.marketplace).toBe('ozon');
    });

    it('должен сохранять существующие специфичные данные', () => {
      const inputWithSpecificData = {
        ...mockInput,
        specificData: { spp: 10, customField: 'value' }
      };

      const wb = getMarketplaceById('wildberries')!;
      const result = applyMarketplacePresets(inputWithSpecificData, wb);

      expect(result.specificData?.spp).toBe(10);
      expect(result.specificData?.customField).toBe('value');
      expect(result.specificData?.marketplace).toBe('wildberries');
    });
  });

  describe('validateMarketplaceValues', () => {
    const wb = getMarketplaceById('wildberries')!;

    it('должен возвращать пустой объект для корректных данных', () => {
      const errors = validateMarketplaceValues(mockInput, wb);

      expect(errors).toEqual({});
    });

    it('должен валидировать комиссию', () => {
      const invalidInput = { ...mockInput, commission: -5 };
      const errors = validateMarketplaceValues(invalidInput, wb);

      expect(errors.commission).toBe('Комиссия должна быть от 0% до 100%');
    });

    it('должен валидировать комиссию (превышение)', () => {
      const invalidInput = { ...mockInput, commission: 150 };
      const errors = validateMarketplaceValues(invalidInput, wb);

      expect(errors.commission).toBe('Комиссия должна быть от 0% до 100%');
    });

    it('должен валидировать процент выкупа', () => {
      const invalidInput = { ...mockInput, pickupRate: -10 };
      const errors = validateMarketplaceValues(invalidInput, wb);

      expect(errors.pickupRate).toBe('Процент выкупа должен быть от 0% до 100%');
    });

    it('должен валидировать процент возвратов', () => {
      const invalidInput = { ...mockInput, returnRate: 120 };
      const errors = validateMarketplaceValues(invalidInput, wb);

      expect(errors.returnRate).toBe('Процент возвратов должен быть от 0% до 100%');
    });

    it('должен валидировать сумму выкупа и возвратов', () => {
      const invalidInput = { ...mockInput, pickupRate: 60, returnRate: 50 };
      const errors = validateMarketplaceValues(invalidInput, wb);

      expect(errors.general).toBe('Сумма процента выкупа и возвратов не может превышать 100%');
    });

    it('должен валидировать специфичные поля (обязательные)', () => {
      // Создаем маркетплейс с обязательным полем для тестирования
      const testMarketplace = {
        ...wb,
        config: {
          ...wb.config,
          specificFields: [
            {
              id: 'requiredField',
              name: 'Обязательное поле',
              type: 'number' as const,
              required: true,
              tooltip: 'Тест'
            }
          ]
        }
      };

      const errors = validateMarketplaceValues(mockInput, testMarketplace);

      expect(errors.requiredField).toBe('Поле "Обязательное поле" обязательно для заполнения');
    });

    it('должен валидировать минимальные значения специфичных полей', () => {
      const testMarketplace = {
        ...wb,
        config: {
          ...wb.config,
          specificFields: [
            {
              id: 'testField',
              name: 'Тестовое поле',
              type: 'number' as const,
              min: 10,
              tooltip: 'Тест'
            }
          ]
        }
      };

      const inputWithField = {
        ...mockInput,
        specificData: { testField: 5 }
      };

      const errors = validateMarketplaceValues(inputWithField, testMarketplace);

      expect(errors.testField).toBe('Значение должно быть не менее 10');
    });

    it('должен валидировать максимальные значения специфичных полей', () => {
      const testMarketplace = {
        ...wb,
        config: {
          ...wb.config,
          specificFields: [
            {
              id: 'testField',
              name: 'Тестовое поле',
              type: 'percentage' as const,
              max: 50,
              tooltip: 'Тест'
            }
          ]
        }
      };

      const inputWithField = {
        ...mockInput,
        specificData: { testField: 60 }
      };

      const errors = validateMarketplaceValues(inputWithField, testMarketplace);

      expect(errors.testField).toBe('Значение должно быть не более 50');
    });
  });

  describe('getCommissionRangeForCategory', () => {
    it('должен возвращать диапазон комиссий для существующей категории', () => {
      const wb = getMarketplaceById('wildberries')!;
      const range = getCommissionRangeForCategory(wb, 'fashion');

      expect(range).toEqual({ min: 15, max: 20 });
    });

    it('должен возвращать null для несуществующей категории', () => {
      const wb = getMarketplaceById('wildberries')!;
      const range = getCommissionRangeForCategory(wb, 'nonexistent');

      expect(range).toBeNull();
    });

    it('должен корректно работать для разных маркетплейсов', () => {
      const wb = getMarketplaceById('wildberries')!;
      const ozon = getMarketplaceById('ozon')!;

      const wbElectronics = getCommissionRangeForCategory(wb, 'electronics');
      const ozonElectronics = getCommissionRangeForCategory(ozon, 'electronics');

      expect(wbElectronics).toEqual({ min: 12, max: 18 });
      expect(ozonElectronics).toEqual({ min: 8, max: 15 });
    });
  });

  describe('createInitialInput', () => {
    it('должен создавать начальные данные для Wildberries', () => {
      const wb = getMarketplaceById('wildberries')!;
      const initialInput = createInitialInput(wb);

      expect(initialInput.commission).toBe(17);
      expect(initialInput.logistics).toBe(0);
      expect(initialInput.pickupRate).toBe(70);
      expect(initialInput.returnRate).toBe(15);
      expect(initialInput.taxRegime).toBe('USN_6');
      expect(initialInput.retailPrice).toBe(1000);
      expect(initialInput.expectedSalesPerMonth).toBe(100);
      expect(initialInput.specificData?.marketplace).toBe('wildberries');
    });

    it('должен создавать начальные данные для Ozon', () => {
      const ozon = getMarketplaceById('ozon')!;
      const initialInput = createInitialInput(ozon);

      expect(initialInput.commission).toBe(15);
      expect(initialInput.logistics).toBe(35);
      expect(initialInput.pickupRate).toBe(65);
      expect(initialInput.returnRate).toBe(20);
      expect(initialInput.specificData?.marketplace).toBe('ozon');
    });

    it('должен включать все необходимые поля', () => {
      const wb = getMarketplaceById('wildberries')!;
      const initialInput = createInitialInput(wb);

      // Проверяем наличие всех блоков данных
      expect(initialInput.purchasePrice).toBeDefined();
      expect(initialInput.deliveryToWarehouse).toBeDefined();
      expect(initialInput.packaging).toBeDefined();
      expect(initialInput.otherCOGS).toBeDefined();
      expect(initialInput.advertising).toBeDefined();
      expect(initialInput.fixedCostsPerMonth).toBeDefined();
      expect(initialInput.sellerDiscount).toBeDefined();
      expect(initialInput.additionalPromo).toBeDefined();
    });
  });

  describe('marketplaceSupports', () => {
    it('должен определять поддержку СПП для Wildberries', () => {
      const wb = getMarketplaceById('wildberries')!;

      expect(marketplaceSupports(wb, 'spp')).toBe(true);
      expect(marketplaceSupports(wb, 'lastMile')).toBe(false);
      expect(marketplaceSupports(wb, 'fulfillmentOptions')).toBe(false);
    });

    it('должен определять поддержку функций для Ozon', () => {
      const ozon = getMarketplaceById('ozon')!;

      expect(marketplaceSupports(ozon, 'spp')).toBe(false);
      expect(marketplaceSupports(ozon, 'lastMile')).toBe(true);
      expect(marketplaceSupports(ozon, 'fulfillmentOptions')).toBe(true);
    });

    it('должен возвращать false для неизвестных функций', () => {
      const wb = getMarketplaceById('wildberries')!;

      expect(marketplaceSupports(wb, 'unknownFeature')).toBe(false);
    });
  });

  describe('formatMarketplaceDisplayName', () => {
    it('должен форматировать имя для существующих маркетплейсов', () => {
      expect(formatMarketplaceDisplayName('wildberries')).toBe('Wildberries');
      expect(formatMarketplaceDisplayName('ozon')).toBe('Ozon');
    });

    it('должен возвращать оригинальный ID для несуществующих маркетплейсов', () => {
      expect(formatMarketplaceDisplayName('nonexistent' as MarketplaceId)).toBe('nonexistent');
    });
  });

  describe('Конфигурация специфичных полей', () => {
    it('должен включать корректные поля для Wildberries', () => {
      const wb = getMarketplaceById('wildberries')!;
      const specificFields = wb.config.specificFields;

      expect(specificFields).toContainEqual({
        id: 'spp',
        name: 'СПП (бонусы)',
        type: 'percentage',
        tooltip: 'Система персональных предложений - дополнительная скидка за счет маркетплейса'
      });

      expect(specificFields).toContainEqual({
        id: 'brandDiscount',
        name: 'Скидка бренда',
        type: 'percentage',
        tooltip: 'Дополнительная скидка от бренда'
      });
    });

    it('должен включать корректные поля для Ozon', () => {
      const ozon = getMarketplaceById('ozon')!;
      const specificFields = ozon.config.specificFields;

      expect(specificFields).toContainEqual({
        id: 'lastMile',
        name: 'Последняя миля',
        type: 'currency',
        tooltip: 'Стоимость доставки до клиента'
      });

      const fulfillmentField = specificFields.find(f => f.id === 'fulfillment');
      expect(fulfillmentField).toBeDefined();
      expect(fulfillmentField?.type).toBe('select');
      expect(fulfillmentField?.options).toHaveLength(2);
    });
  });

  describe('Логистические опции', () => {
    it('должен включать корректные опции для Wildberries', () => {
      const wb = getMarketplaceById('wildberries')!;
      const logisticOptions = wb.config.logisticOptions;

      expect(logisticOptions).toHaveLength(1);
      expect(logisticOptions[0]).toEqual({
        id: 'standard',
        name: 'Стандартная доставка',
        cost: 0,
        description: 'Бесплатная доставка WB'
      });
    });

    it('должен включать корректные опции для Ozon', () => {
      const ozon = getMarketplaceById('ozon')!;
      const logisticOptions = ozon.config.logisticOptions;

      expect(logisticOptions).toHaveLength(2);
      expect(logisticOptions).toContainEqual({
        id: 'standard',
        name: 'Стандартная доставка',
        cost: 35,
        description: 'Доставка силами Ozon'
      });
      expect(logisticOptions).toContainEqual({
        id: 'express',
        name: 'Экспресс доставка',
        cost: 50,
        description: 'Ускоренная доставка'
      });
    });
  });
});
