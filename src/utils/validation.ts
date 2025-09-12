import type { CalculationInput, Marketplace, ValidationRule, ValidationSchema } from '../types';

/**
 * Валидация базовых правил для поля
 */
export const validateField = (value: string | number | undefined | null, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    // Проверка обязательности
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message;
    }

    // Пропускаем остальные проверки если значение пустое и не обязательное
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Проверка минимального значения
    if (rule.min !== undefined && Number(value) < rule.min) {
      return rule.message;
    }

    // Проверка максимального значения
    if (rule.max !== undefined && Number(value) > rule.max) {
      return rule.message;
    }

    // Проверка регулярного выражения
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message;
    }

    // Пользовательская валидация
    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return null;
};

/**
 * Схема валидации для основных полей калькулятора
 */
export const getValidationSchema = (): ValidationSchema => {
  return {
    // Блок 1: Себестоимость
    purchasePrice: [
      { required: true, message: 'Закупочная цена обязательна' },
      { min: 0, message: 'Цена не может быть отрицательной' },
      { max: 1000000, message: 'Цена слишком велика' }
    ],
    
    deliveryToWarehouse: [
      { min: 0, message: 'Стоимость доставки не может быть отрицательной' }
    ],
    
    packaging: [
      { min: 0, message: 'Стоимость упаковки не может быть отрицательной' }
    ],
    
    otherCOGS: [
      { min: 0, message: 'Прочие расходы не могут быть отрицательными' }
    ],

    // Блок 2: Расходы маркетплейса
    commission: [
      { required: true, message: 'Комиссия маркетплейса обязательна' },
      { min: 0, message: 'Комиссия не может быть отрицательной' },
      { max: 100, message: 'Комиссия не может превышать 100%' }
    ],
    
    logistics: [
      { min: 0, message: 'Стоимость логистики не может быть отрицательной' }
    ],
    
    storage: [
      { min: 0, message: 'Стоимость хранения не может быть отрицательной' }
    ],
    
    returnProcessing: [
      { min: 0, message: 'Стоимость обработки возвратов не может быть отрицательной' }
    ],
    
    pickupRate: [
      { required: true, message: 'Процент выкупа обязателен' },
      { min: 0, message: 'Процент выкупа не может быть отрицательным' },
      { max: 100, message: 'Процент выкупа не может превышать 100%' }
    ],
    
    returnRate: [
      { required: true, message: 'Процент возвратов обязателен' },
      { min: 0, message: 'Процент возвратов не может быть отрицательным' },
      { max: 100, message: 'Процент возвратов не может превышать 100%' }
    ],

    // Блок 3: Дополнительные расходы
    advertising: [
      { min: 0, message: 'Расходы на рекламу не могут быть отрицательными' }
    ],
    
    otherVariableCosts: [
      { min: 0, message: 'Прочие переменные расходы не могут быть отрицательными' }
    ],
    
    fixedCostsPerMonth: [
      { min: 0, message: 'Фиксированные расходы не могут быть отрицательными' }
    ],
    
    expectedSalesPerMonth: [
      { min: 1, message: 'Ожидаемое количество продаж должно быть больше 0' },
      { max: 1000000, message: 'Слишком большое количество продаж' }
    ],

    // Блок 5: Ценообразование
    retailPrice: [
      { required: true, message: 'Розничная цена обязательна' },
      { min: 1, message: 'Розничная цена должна быть больше 0' },
      { max: 1000000, message: 'Розничная цена слишком велика' }
    ],
    
    sellerDiscount: [
      { min: 0, message: 'Скидка не может быть отрицательной' },
      { max: 100, message: 'Скидка не может превышать 100%' }
    ],
    
    additionalPromo: [
      { min: 0, message: 'Дополнительное промо не может быть отрицательным' },
      { max: 100, message: 'Дополнительное промо не может превышать 100%' }
    ]
  };
};

/**
 * Валидация логических связей между полями
 */
export const validateBusinessLogic = (input: CalculationInput): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Проверка суммы выкупа и возвратов
  if ((input.pickupRate || 0) + (input.returnRate || 0) > 100) {
    errors.businessLogic = 'Сумма процента выкупа и возвратов не может превышать 100%';
  }

  // Проверка суммы скидок
  const totalDiscount = (input.sellerDiscount || 0) + (input.additionalPromo || 0);
  if (totalDiscount > 100) {
    errors.discountLogic = 'Общая сумма скидок не может превышать 100%';
  }

  // Проверка эффективной цены
  const effectivePrice = (input.retailPrice || 0) * (1 - totalDiscount / 100);
  if (effectivePrice <= 0) {
    errors.priceLogic = 'Эффективная цена после скидок должна быть больше 0';
  }

  // Проверка минимальной маржинальности
  const totalCosts = (input.purchasePrice || 0) + (input.deliveryToWarehouse || 0) + 
                    (input.packaging || 0) + (input.otherCOGS || 0);
  
  if (effectivePrice <= totalCosts) {
    errors.marginLogic = 'Цена должна покрывать себестоимость товара';
  }

  return errors;
};

/**
 * Валидация специфичных полей маркетплейса
 */
export const validateMarketplaceSpecific = (
  input: CalculationInput, 
  marketplace: Marketplace
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!marketplace.config.specificFields) {
    return errors;
  }

  marketplace.config.specificFields.forEach(field => {
    const value = input.specificData?.[field.id];

    // Создаем правила для каждого поля
    const rules: ValidationRule[] = [];

    if (field.required) {
      rules.push({ required: true, message: `Поле "${field.name}" обязательно` });
    }

    if (field.min !== undefined) {
      rules.push({ min: field.min, message: `Минимальное значение: ${field.min}` });
    }

    if (field.max !== undefined) {
      rules.push({ max: field.max, message: `Максимальное значение: ${field.max}` });
    }

    // Проверяем поле
    const error = validateField(value, rules);
    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
};

/**
 * Полная валидация входных данных
 */
export const validateCalculationInput = (
  input: CalculationInput, 
  marketplace?: Marketplace
): { isValid: boolean; errors: Record<string, string> } => {
  const schema = getValidationSchema(marketplace);
  const errors: Record<string, string> = {};

  // Валидация по схеме
  Object.entries(schema).forEach(([fieldName, rules]) => {
    const value = input[fieldName as keyof CalculationInput];
    const error = validateField(value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  // Валидация бизнес-логики
  const businessErrors = validateBusinessLogic(input);
  Object.assign(errors, businessErrors);

  // Валидация специфичных полей маркетплейса
  if (marketplace) {
    const marketplaceErrors = validateMarketplaceSpecific(input, marketplace);
    Object.assign(errors, marketplaceErrors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Валидация отдельного поля в реальном времени
 */
export const validateSingleField = (
  fieldName: keyof CalculationInput,
  value: string | number,
  allInput: CalculationInput
): string | null => {
  const schema = getValidationSchema();
  const rules = schema[fieldName];

  if (!rules) return null;

  // Базовая валидация поля
  const fieldError = validateField(value, rules);
  if (fieldError) return fieldError;

  // Дополнительная проверка бизнес-логики для связанных полей
  const tempInput = { ...allInput, [fieldName]: value };
  
  if (fieldName === 'pickupRate' || fieldName === 'returnRate') {
    if ((tempInput.pickupRate || 0) + (tempInput.returnRate || 0) > 100) {
      return 'Сумма выкупа и возвратов не может превышать 100%';
    }
  }

  if (fieldName === 'sellerDiscount' || fieldName === 'additionalPromo') {
    if ((tempInput.sellerDiscount || 0) + (tempInput.additionalPromo || 0) > 100) {
      return 'Общая сумма скидок не может превышать 100%';
    }
  }

  return null;
};

/**
 * Создание сообщений подсказок для полей
 */
export const getFieldHints = (fieldName: keyof CalculationInput, marketplace?: Marketplace): string[] => {
  const hints: string[] = [];

  switch (fieldName) {
    case 'commission':
      if (marketplace?.config.commissionRanges) {
        const ranges = Object.entries(marketplace.config.commissionRanges)
          .map(([cat, range]) => `${cat}: ${range.min}-${range.max}%`)
          .join(', ');
        hints.push(`Типичные комиссии: ${ranges}`);
      }
      break;
      
    case 'pickupRate':
      hints.push('Обычно 60-80% для большинства категорий');
      hints.push('Зависит от цены, сезонности и качества товара');
      break;
      
    case 'returnRate':
      hints.push('Обычно 10-25% в зависимости от категории');
      hints.push('Одежда и обувь: 20-30%, электроника: 5-15%');
      break;
      
    case 'advertising':
      hints.push('Рекомендуется 5-15% от цены товара');
      hints.push('Новые товары требуют больше рекламных затрат');
      break;
  }

  return hints;
};
