// Основные типы для калькулятора юнит-экономики

export type MarketplaceId = 'wildberries' | 'ozon';

export type TaxRegime = 'USN_6' | 'USN_15' | 'OSNO';

export type FieldType = 'number' | 'percentage' | 'currency' | 'select';

export interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
  tooltip?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
}

export interface LogisticOption {
  id: string;
  name: string;
  cost: number;
  description?: string;
}

export interface MarketplaceConfig {
  defaultCommission: number;
  logisticOptions: LogisticOption[];
  specificFields: FieldConfig[];
  taxRegimes: TaxRegime[];
  commissionRanges?: Record<string, { min: number; max: number }>;
}

export interface Marketplace {
  id: MarketplaceId;
  name: string;
  config: MarketplaceConfig;
  defaultValues: Partial<CalculationInput>;
}

export interface SimpleMarketplace {
  id: MarketplaceId;
  name: string;
  config: MarketplaceConfig;
  defaultValues: {
    commission: number;
    logistics: number;
    pickupRate: number;
    returnRate: number;
  };
}

// Входные данные для расчетов
export interface CalculationInput {
  // Блок 1: Себестоимость (COGS)
  purchasePrice: number;
  deliveryToWarehouse: number;
  packaging: number;
  otherCOGS: number;
  
  // Блок 2: Расходы маркетплейса
  commission: number;
  logistics: number;
  storage: number;
  returnProcessing: number;
  pickupRate: number; // Процент выкупа
  returnRate: number; // Процент возвратов
  
  // Блок 3: Дополнительные расходы
  advertising: number;
  otherVariableCosts: number;
  fixedCostsPerMonth: number;
  expectedSalesPerMonth?: number; // Для расчета доли фиксированных расходов
  
  // Блок 4: Налоги
  taxRegime: TaxRegime;
  
  // Блок 5: Ценообразование и скидки
  retailPrice: number;
  sellerDiscount: number; // Скидка продавца в %
  additionalPromo: number; // Дополнительные промо в %
  
  // Специфичные поля маркетплейсов
  specificData?: Record<string, string | number>;
}

// Детализация расходов
export interface CostBreakdown {
  totalCOGS: number;
  marketplaceFees: {
    commission: number;
    logistics: number;
    storage: number;
    returns: number;
    total: number;
  };
  additionalCosts: {
    advertising: number;
    otherVariable: number;
    fixedPerUnit: number;
    total: number;
  };
  taxes: {
    amount: number;
    rate: number;
    base: number;
  };
  totalCosts: number;
}

// Результаты расчетов
export interface CalculationResults {
  // Основные метрики
  revenue: number; // Выручка с учетом скидок
  cm1: number; // Contribution Margin 1
  cm2: number; // Contribution Margin 2
  netProfit: number; // Чистая прибыль
  marginPercent: number; // Маржинальность в %
  
  // ROI метрики
  roi: number; // Общий ROI в %
  adRoi: number; // ROI на рекламу в %
  acos: number; // ACOS/ДРР в %
  
  // Статус прибыльности
  status: 'profit' | 'loss' | 'breakeven';
  
  // Точка безубыточности
  breakEvenPrice: number; // Минимальная цена для безубыточности
  breakEvenVolume: number; // Необходимый объем продаж в месяц
  
  // Детализация
  breakdown: CostBreakdown;
  
  // Эффективные показатели
  effectivePrice: number; // Цена к оплате с учетом всех скидок
  effectivePickupRate: number; // Эффективный процент выкупа
}

// Сценарий расчета
export interface Scenario {
  id: string;
  name: string;
  description?: string;
  marketplace: MarketplaceId;
  input: CalculationInput;
  results?: CalculationResults;
  createdAt: Date;
  updatedAt: Date;
}

// Состояние приложения
export interface AppState {
  selectedMarketplace: MarketplaceId;
  currentScenario: string | null;
  scenarios: Scenario[];
  input: CalculationInput;
  results: CalculationResults | null;
  isCalculating: boolean;
  errors: Record<string, string>;
}

// Действия для редьюсера
export type AppAction = 
  | { type: 'SET_MARKETPLACE'; payload: MarketplaceId }
  | { type: 'UPDATE_INPUT'; payload: Partial<CalculationInput> }
  | { type: 'SET_RESULTS'; payload: CalculationResults }
  | { type: 'SAVE_SCENARIO'; payload: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'LOAD_SCENARIO'; payload: string }
  | { type: 'DELETE_SCENARIO'; payload: string }
  | { type: 'LOAD_SCENARIOS'; payload: Scenario[] }
  | { type: 'UPDATE_SCENARIO'; payload: Scenario }
  | { type: 'NEW_SCENARIO' }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' };

// Валидация
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string | number) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

// Экспорт данных
export interface ExportData {
  scenario: Scenario;
  marketplace: Marketplace;
  timestamp: Date;
  version: string;
}

// Пресеты значений
export interface PresetValues {
  category: string;
  name: string;
  description: string;
  averageValues: Partial<CalculationInput>;
  marketplace?: MarketplaceId;
}

// Формулы и объяснения
export interface FormulaExplanation {
  metric: string;
  formula: string;
  description: string;
  variables: Record<string, string>;
}

// UI компоненты
export interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type?: 'number' | 'percentage' | 'currency';
  placeholder?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

// Generic типы для лучшей типизации
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Утилитарные типы для валидации
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export type FieldValidationResult = {
  isValid: boolean;
  error?: string;
};

// Типы для экспорта
export type ExportFormat = 'excel' | 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeFormulas?: boolean;
  includeBreakdown?: boolean;
  filename?: string;
}

// Типы для аналитики
export interface AnalyticsData {
  timestamp: Date;
  action: string;
  data: Record<string, unknown>;
}

export interface PerformanceMetrics {
  calculationTime: number;
  memoryUsage: number;
  bundleSize: number;
}

