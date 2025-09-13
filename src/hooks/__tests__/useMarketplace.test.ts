/**
 * Unit тесты для хука useMarketplace
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMarketplace } from '../useMarketplace';
import type { CalculationInput, MarketplaceId } from '../../types';

// Мокаем модуль конфигурации маркетплейсов
vi.mock('../../utils/marketplaceConfig', () => ({
  loadMarketplaces: vi.fn(),
  getMarketplaceById: vi.fn(),
  applyMarketplacePresets: vi.fn(),
  validateMarketplaceValues: vi.fn(),
  createInitialInput: vi.fn()
}));

import { 
  loadMarketplaces, 
  getMarketplaceById, 
  applyMarketplacePresets,
  validateMarketplaceValues,
  createInitialInput
} from '../../utils/marketplaceConfig';

describe('useMarketplace', () => {
  const mockMarketplaces = [
    {
      id: 'wildberries',
      name: 'Wildberries',
      defaultValues: {
        commission: 17,
        logistics: 0,
        pickupRate: 70,
        returnRate: 15
      },
      config: {
        defaultCommission: 17,
        logisticOptions: [],
        specificFields: [],
        taxRegimes: ['USN_6', 'USN_15', 'OSNO'],
        commissionRanges: {}
      }
    },
    {
      id: 'ozon',
      name: 'Ozon',
      defaultValues: {
        commission: 15,
        logistics: 35,
        pickupRate: 65,
        returnRate: 20
      },
      config: {
        defaultCommission: 15,
        logisticOptions: [],
        specificFields: [],
        taxRegimes: ['USN_6', 'USN_15', 'OSNO'],
        commissionRanges: {}
      }
    }
  ];

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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadMarketplaces).mockReturnValue(mockMarketplaces as any);
    vi.mocked(getMarketplaceById).mockImplementation((id) => 
      mockMarketplaces.find(mp => mp.id === id) as any || null
    );
    vi.mocked(applyMarketplacePresets).mockImplementation((input, marketplace) => ({
      ...input,
      ...marketplace.defaultValues
    }));
    vi.mocked(validateMarketplaceValues).mockReturnValue({});
    vi.mocked(createInitialInput).mockReturnValue({
      commission: 17,
      pickupRate: 70,
      returnRate: 15
    });
  });

  describe('Инициализация', () => {
    it('должен инициализироваться без выбранного маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace());

      expect(result.current.marketplaces).toEqual(mockMarketplaces);
      expect(result.current.selectedMarketplace).toBeNull();
      expect(result.current.marketplaceData).toBeNull();
      expect(result.current.isMarketplaceSelected).toBe(false);
      expect(result.current.errors).toEqual({});
    });

    it('должен инициализироваться с предвыбранным маркетплейсом', () => {
      const { result } = renderHook(() => useMarketplace('wildberries'));

      expect(result.current.selectedMarketplace).toBe('wildberries');
      expect(result.current.marketplaceData).toEqual(mockMarketplaces[0]);
      expect(result.current.isMarketplaceSelected).toBe(true);
    });

    it('должен загружать список маркетплейсов при инициализации', () => {
      renderHook(() => useMarketplace());

      expect(loadMarketplaces).toHaveBeenCalledOnce();
    });
  });

  describe('Выбор маркетплейса', () => {
    it('должен выбирать маркетплейс', () => {
      const { result } = renderHook(() => useMarketplace());

      act(() => {
        result.current.selectMarketplace('wildberries');
      });

      expect(result.current.selectedMarketplace).toBe('wildberries');
      expect(result.current.marketplaceData).toEqual(mockMarketplaces[0]);
      expect(result.current.isMarketplaceSelected).toBe(true);
    });

    it('должен сбрасывать ошибки при смене маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace());

      // Устанавливаем ошибки
      act(() => {
        result.current.selectMarketplace('wildberries');
      });

      // Симулируем ошибки валидации
      vi.mocked(validateMarketplaceValues).mockReturnValue({
        commission: 'Неверная комиссия'
      });

      act(() => {
        result.current.validateInput(mockInput);
      });

      expect(result.current.errors).toEqual({ commission: 'Неверная комиссия' });

      // Меняем маркетплейс - ошибки должны сброситься
      act(() => {
        result.current.selectMarketplace('ozon');
      });

      expect(result.current.errors).toEqual({});
    });

    it('должен обновлять данные маркетплейса при смене', () => {
      const { result } = renderHook(() => useMarketplace('wildberries'));

      expect(result.current.marketplaceData).toEqual(mockMarketplaces[0]);

      act(() => {
        result.current.selectMarketplace('ozon');
      });

      expect(result.current.marketplaceData).toEqual(mockMarketplaces[1]);
    });
  });

  describe('Применение предустановок', () => {
    it('должен применять предустановки маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace('wildberries'));

      const inputWithPresets = result.current.applyPresets(mockInput);

      expect(applyMarketplacePresets).toHaveBeenCalledWith(mockInput, mockMarketplaces[0]);
      expect(inputWithPresets).toEqual({
        ...mockInput,
        ...mockMarketplaces[0].defaultValues
      });
    });

    it('должен возвращать оригинальные данные если маркетплейс не выбран', () => {
      const { result } = renderHook(() => useMarketplace());

      const inputWithPresets = result.current.applyPresets(mockInput);

      expect(applyMarketplacePresets).not.toHaveBeenCalled();
      expect(inputWithPresets).toEqual(mockInput);
    });
  });

  describe('Валидация входных данных', () => {
    it('должен валидировать данные для выбранного маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace('wildberries'));

      act(() => {
        const isValid = result.current.validateInput(mockInput);
        expect(isValid).toBe(true);
      });

      expect(validateMarketplaceValues).toHaveBeenCalledWith(mockInput, mockMarketplaces[0]);
      expect(result.current.errors).toEqual({});
    });

    it('должен обрабатывать ошибки валидации', () => {
      const { result } = renderHook(() => useMarketplace('wildberries'));
      
      const validationErrors = {
        commission: 'Комиссия слишком высокая',
        pickupRate: 'Неверный процент выкупа'
      };
      
      vi.mocked(validateMarketplaceValues).mockReturnValue(validationErrors);

      act(() => {
        const isValid = result.current.validateInput(mockInput);
        expect(isValid).toBe(false);
      });

      expect(result.current.errors).toEqual(validationErrors);
    });

    it('должен возвращать ошибку если маркетплейс не выбран', () => {
      const { result } = renderHook(() => useMarketplace());

      act(() => {
        const isValid = result.current.validateInput(mockInput);
        expect(isValid).toBe(false);
      });

      expect(validateMarketplaceValues).not.toHaveBeenCalled();
      expect(result.current.errors).toEqual({ general: 'Маркетплейс не выбран' });
    });
  });

  describe('Создание новых данных', () => {
    it('должен создавать новые входные данные для выбранного маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace('wildberries'));

      const newInput = result.current.createNewInput();

      expect(createInitialInput).toHaveBeenCalledWith(mockMarketplaces[0]);
      expect(newInput).toEqual({
        commission: 17,
        pickupRate: 70,
        returnRate: 15
      });
    });

    it('должен возвращать пустой объект если маркетплейс не выбран', () => {
      const { result } = renderHook(() => useMarketplace());

      const newInput = result.current.createNewInput();

      expect(createInitialInput).not.toHaveBeenCalled();
      expect(newInput).toEqual({});
    });
  });

  describe('Работа со специфичными полями', () => {
    it('должен получать значение специфичного поля', () => {
      const { result } = renderHook(() => useMarketplace());

      const specificData = { spp: 10, lastMile: 50 };
      const value = result.current.getSpecificFieldValue('spp', specificData);

      expect(value).toBe(10);
    });

    it('должен возвращать пустую строку для несуществующего поля', () => {
      const { result } = renderHook(() => useMarketplace());

      const value = result.current.getSpecificFieldValue('nonExistent', {});

      expect(value).toBe('');
    });

    it('должен возвращать пустую строку если данные не переданы', () => {
      const { result } = renderHook(() => useMarketplace());

      const value = result.current.getSpecificFieldValue('spp');

      expect(value).toBe('');
    });

    it('должен обновлять специфичное поле', () => {
      const { result } = renderHook(() => useMarketplace());

      const originalData = { spp: 5, lastMile: 30 };
      const updatedData = result.current.updateSpecificField('spp', 15, originalData);

      expect(updatedData).toEqual({
        spp: 15,
        lastMile: 30
      });
    });

    it('должен добавлять новое специфичное поле', () => {
      const { result } = renderHook(() => useMarketplace());

      const originalData = { spp: 5 };
      const updatedData = result.current.updateSpecificField('lastMile', 40, originalData);

      expect(updatedData).toEqual({
        spp: 5,
        lastMile: 40
      });
    });
  });

  describe('Реактивность', () => {
    it('должен обновляться при изменении выбранного маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace());

      expect(result.current.marketplaceData).toBeNull();

      act(() => {
        result.current.selectMarketplace('wildberries');
      });

      expect(result.current.marketplaceData).toEqual(mockMarketplaces[0]);

      act(() => {
        result.current.selectMarketplace('ozon');
      });

      expect(result.current.marketplaceData).toEqual(mockMarketplaces[1]);
    });

    it('должен обновлять функции при изменении маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace());

      // Без маркетплейса
      expect(result.current.createNewInput()).toEqual({});

      act(() => {
        result.current.selectMarketplace('wildberries');
      });

      // С маркетплейсом
      expect(result.current.createNewInput()).toEqual({
        commission: 17,
        pickupRate: 70,
        returnRate: 15
      });
    });
  });

  describe('Утилитарные функции', () => {
    it('должен корректно определять наличие выбранного маркетплейса', () => {
      const { result } = renderHook(() => useMarketplace());

      expect(result.current.isMarketplaceSelected).toBe(false);

      act(() => {
        result.current.selectMarketplace('wildberries');
      });

      expect(result.current.isMarketplaceSelected).toBe(true);
    });
  });

  describe('Типы данных', () => {
    it('должен корректно работать с типами MarketplaceId', () => {
      const { result } = renderHook(() => useMarketplace());

      act(() => {
        result.current.selectMarketplace('wildberries' as MarketplaceId);
      });

      expect(result.current.selectedMarketplace).toBe('wildberries');

      act(() => {
        result.current.selectMarketplace('ozon' as MarketplaceId);
      });

      expect(result.current.selectedMarketplace).toBe('ozon');
    });
  });
});
