import type { Marketplace, MarketplaceId, CalculationInput } from '../types';

// Встроенные конфигурации маркетплейсов
const wildberriesConfig = {
  id: "wildberries",
  name: "Wildberries",
  defaultValues: {
    commission: 17,
    logistics: 0,
    storage: 0,
    pickupRate: 70,
    returnRate: 15,
    advertising: 50
  },
  specificFields: [
    {
      id: "spp",
      name: "СПП (бонусы)",
      type: "percentage",
      tooltip: "Система персональных предложений - дополнительная скидка за счет маркетплейса"
    },
    {
      id: "brandDiscount",
      name: "Скидка бренда",
      type: "percentage", 
      tooltip: "Дополнительная скидка от бренда"
    }
  ],
  commissionRanges: {
    fashion: { min: 15, max: 20 },
    electronics: { min: 12, max: 18 },
    beauty: { min: 15, max: 25 },
    home: { min: 10, max: 15 },
    kids: { min: 15, max: 20 },
    books: { min: 8, max: 12 }
  },
  logisticOptions: [
    {
      id: "standard",
      name: "Стандартная доставка",
      cost: 0,
      description: "Бесплатная доставка WB"
    }
  ]
};

const ozonConfig = {
  id: "ozon",
  name: "Ozon",
  defaultValues: {
    commission: 15,
    logistics: 35,
    storage: 0,
    pickupRate: 65,
    returnRate: 20,
    advertising: 60
  },
  specificFields: [
    {
      id: "lastMile",
      name: "Последняя миля",
      type: "currency",
      tooltip: "Стоимость доставки до клиента"
    },
    {
      id: "fulfillment",
      name: "Размещение FBO/FBS",
      type: "select",
      tooltip: "Тип размещения товара",
      options: [
        { value: "fbo", label: "FBO (со склада Ozon)" },
        { value: "fbs", label: "FBS (со своего склада)" }
      ]
    }
  ],
  commissionRanges: {
    fashion: { min: 12, max: 18 },
    electronics: { min: 8, max: 15 },
    beauty: { min: 15, max: 22 },
    home: { min: 8, max: 12 },
    kids: { min: 12, max: 18 },
    books: { min: 5, max: 10 }
  },
  logisticOptions: [
    {
      id: "standard",
      name: "Стандартная доставка",
      cost: 35,
      description: "Доставка силами Ozon"
    },
    {
      id: "express",
      name: "Экспресс доставка",
      cost: 50,
      description: "Ускоренная доставка"
    }
  ]
};

/**
 * Загружает конфигурации всех маркетплейсов
 */
export const loadMarketplaces = (): Marketplace[] => {
  return [
    {
      ...wildberriesConfig,
      config: {
        defaultCommission: wildberriesConfig.defaultValues.commission,
        logisticOptions: wildberriesConfig.logisticOptions,
        specificFields: wildberriesConfig.specificFields,
        taxRegimes: ['USN_6', 'USN_15', 'OSNO'],
        commissionRanges: wildberriesConfig.commissionRanges
      }
    } as Marketplace,
    {
      ...ozonConfig,
      config: {
        defaultCommission: ozonConfig.defaultValues.commission,
        logisticOptions: ozonConfig.logisticOptions,
        specificFields: ozonConfig.specificFields,
        taxRegimes: ['USN_6', 'USN_15', 'OSNO'],
        commissionRanges: ozonConfig.commissionRanges
      }
    } as Marketplace
  ];
};

/**
 * Получает конфигурацию маркетплейса по ID
 */
export const getMarketplaceById = (id: MarketplaceId): Marketplace | null => {
  const marketplaces = loadMarketplaces();
  return marketplaces.find(mp => mp.id === id) || null;
};

/**
 * Применяет предустановки маркетплейса к входным данным
 */
export const applyMarketplacePresets = (
  input: Partial<CalculationInput>,
  marketplace: Marketplace
): Partial<CalculationInput> => {
  return {
    ...input,
    ...marketplace.defaultValues,
    // Сохраняем специфичные данные если они есть
    specificData: {
      ...input.specificData,
      marketplace: marketplace.id
    }
  };
};

/**
 * Валидирует значения для конкретного маркетплейса
 */
export const validateMarketplaceValues = (
  input: CalculationInput,
  marketplace: Marketplace
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Проверяем комиссию
  if (input.commission < 0 || input.commission > 100) {
    errors.commission = 'Комиссия должна быть от 0% до 100%';
  }

  // Проверяем процент выкупа
  if (input.pickupRate < 0 || input.pickupRate > 100) {
    errors.pickupRate = 'Процент выкупа должен быть от 0% до 100%';
  }

  // Проверяем процент возвратов
  if (input.returnRate < 0 || input.returnRate > 100) {
    errors.returnRate = 'Процент возвратов должен быть от 0% до 100%';
  }

  // Проверяем логику выкупа и возвратов
  if (input.pickupRate + input.returnRate > 100) {
    errors.general = 'Сумма процента выкупа и возвратов не может превышать 100%';
  }

  // Проверяем специфичные поля маркетплейса
  marketplace.config.specificFields.forEach(field => {
    const value = input.specificData?.[field.id];
    
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.id] = `Поле "${field.name}" обязательно для заполнения`;
    }

    if (field.min !== undefined && typeof value === 'number' && value < field.min) {
      errors[field.id] = `Значение должно быть не менее ${field.min}`;
    }

    if (field.max !== undefined && typeof value === 'number' && value > field.max) {
      errors[field.id] = `Значение должно быть не более ${field.max}`;
    }
  });

  return errors;
};

/**
 * Получает рекомендуемые значения комиссий для категории
 */
export const getCommissionRangeForCategory = (
  marketplace: Marketplace,
  category: string
): { min: number; max: number } | null => {
  return marketplace.config.commissionRanges?.[category] || null;
};

/**
 * Создает начальные данные для нового сценария
 */
export const createInitialInput = (marketplace: Marketplace): Partial<CalculationInput> => {
  return {
    // Блок 1: Себестоимость
    purchasePrice: 0,
    deliveryToWarehouse: 0,
    packaging: 0,
    otherCOGS: 0,
    
    // Блок 2: Расходы маркетплейса (используем предустановки)
    commission: marketplace.defaultValues.commission || 15,
    logistics: marketplace.defaultValues.logistics || 0,
    storage: marketplace.defaultValues.storage || 0,
    returnProcessing: 10,
    pickupRate: marketplace.defaultValues.pickupRate || 70,
    returnRate: marketplace.defaultValues.returnRate || 15,
    
    // Блок 3: Дополнительные расходы
    advertising: marketplace.defaultValues.advertising || 50,
    otherVariableCosts: 0,
    fixedCostsPerMonth: 0,
    expectedSalesPerMonth: 100,
    
    // Блок 4: Налоги
    taxRegime: 'USN_6',
    
    // Блок 5: Ценообразование
    retailPrice: 1000,
    sellerDiscount: 0,
    additionalPromo: 0,
    
    // Специфичные данные
    specificData: {
      marketplace: marketplace.id
    }
  };
};

/**
 * Проверяет, поддерживает ли маркетплейс определенную функцию
 */
export const marketplaceSupports = (
  marketplace: Marketplace,
  feature: string
): boolean => {
  switch (feature) {
    case 'spp':
      return marketplace.id === 'wildberries';
    case 'lastMile':
      return marketplace.id === 'ozon';
    case 'fulfillmentOptions':
      return marketplace.id === 'ozon';
    default:
      return false;
  }
};

/**
 * Форматирует название маркетплейса для отображения
 */
export const formatMarketplaceDisplayName = (id: MarketplaceId): string => {
  const marketplace = getMarketplaceById(id);
  return marketplace?.name || id;
};
