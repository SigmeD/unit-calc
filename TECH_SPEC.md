# 🔧 Техническая спецификация MVP

## 📋 Обзор архитектуры

### Общие принципы
- **Монолитное SPA приложение** на React
- **Состояние на клиенте** - без backend'а в MVP
- **Реактивные вычисления** - мгновенный пересчет
- **Конфигурационная гибкость** - легкое добавление новых маркетплейсов

### Структура проекта
```
src/
├── components/           # React компоненты
│   ├── ui/              # Базовые UI элементы
│   ├── forms/           # Формы ввода данных
│   ├── results/         # Отображение результатов
│   └── layout/          # Общие компоненты макета
├── hooks/               # Custom hooks
├── utils/               # Утилиты
├── types/               # TypeScript типы
├── config/              # Конфигурационные файлы
├── calculations/        # Движок расчетов
└── data/                # Данные маркетплейсов
```

## 🏗️ Архитектурные компоненты

### 1. Управление состоянием

#### React Context + useReducer
```typescript
interface AppState {
  selectedMarketplace: Marketplace;
  inputData: CalculationInput;
  scenarios: Scenario[];
  currentScenario: number;
  results: CalculationResults;
}

type AppAction = 
  | { type: 'SET_MARKETPLACE'; payload: Marketplace }
  | { type: 'UPDATE_INPUT'; payload: Partial<CalculationInput> }
  | { type: 'SAVE_SCENARIO'; payload: Scenario }
  | { type: 'LOAD_SCENARIO'; payload: number };
```

#### Хуки для работы с состоянием
- `useAppState()` - доступ к глобальному состоянию
- `useCalculations()` - реактивные расчеты
- `useScenarios()` - управление сценариями
- `useLocalStorage()` - персистентность данных

### 2. Типизация данных

#### Основные интерфейсы
```typescript
interface Marketplace {
  id: 'wildberries' | 'ozon';
  name: string;
  config: MarketplaceConfig;
}

interface MarketplaceConfig {
  defaultCommission: number;
  logisticOptions: LogisticOption[];
  specificFields: FieldConfig[];
  taxRegimes: TaxRegime[];
}

interface CalculationInput {
  // Блок 1: COGS
  purchasePrice: number;
  deliveryToWarehouse: number;
  packaging: number;
  otherCOGS: number;
  
  // Блок 2: Marketplace расходы
  commission: number;
  logistics: number;
  storage: number;
  returnProcessing: number;
  pickupRate: number;
  returnRate: number;
  
  // Блок 3: Дополнительные расходы
  advertising: number;
  otherVariableCosts: number;
  fixedCostsPerMonth: number;
  
  // Блок 4: Налоги
  taxRegime: 'USN_6' | 'USN_15' | 'OSNO';
  
  // Блок 5: Ценообразование
  retailPrice: number;
  sellerDiscount: number;
  additionalPromo: number;
}

interface CalculationResults {
  // Основные метрики
  cm1: number;
  cm2: number;
  netProfit: number;
  marginPercent: number;
  roi: number;
  adRoi: number;
  acos: number;
  status: 'profit' | 'loss';
  
  // Точка безубыточности
  breakEvenPrice: number;
  breakEvenVolume: number;
  
  // Детализация
  breakdown: CostBreakdown;
}
```

### 3. Движок расчетов

#### Файл: `calculations/engine.ts`
```typescript
class CalculationEngine {
  constructor(private config: MarketplaceConfig) {}
  
  calculate(input: CalculationInput): CalculationResults {
    const totalCOGS = this.calculateCOGS(input);
    const marketplaceFees = this.calculateMarketplaceFees(input);
    const taxes = this.calculateTaxes(input);
    
    return {
      cm1: this.calculateCM1(input, totalCOGS, marketplaceFees),
      cm2: this.calculateCM2(input, totalCOGS, marketplaceFees),
      // ... остальные метрики
    };
  }
  
  private calculateCOGS(input: CalculationInput): number {
    return input.purchasePrice + 
           input.deliveryToWarehouse + 
           input.packaging + 
           input.otherCOGS;
  }
  
  private calculateBreakEvenPrice(input: CalculationInput): number {
    // Формула с учетом всех факторов
    const totalCosts = this.calculateTotalCosts(input);
    const effectivePickupRate = input.pickupRate / 100;
    const taxMultiplier = this.getTaxMultiplier(input.taxRegime);
    
    return totalCosts / (effectivePickupRate * taxMultiplier);
  }
}
```

## 🎨 UI/UX компоненты

### 1. Базовые UI элементы

#### Компоненты в `components/ui/`
- **Input** - числовые поля с валидацией
- **Select** - выпадающие списки
- **Card** - карточки для группировки
- **Button** - кнопки с различными стилями
- **Badge** - индикаторы статуса
- **Tooltip** - всплывающие подсказки

#### Стилизация с Tailwind CSS
```typescript
const inputStyles = {
  base: "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500",
  error: "border-red-500 focus:ring-red-500",
  success: "border-green-500 focus:ring-green-500"
};

const statusColors = {
  profit: "text-green-600 bg-green-100",
  loss: "text-red-600 bg-red-100"
};
```

### 2. Компоненты форм

#### `MarketplaceSelector`
- Выбор между WB и Ozon
- Загрузка соответствующих конфигов
- Отображение специфичных полей

#### `DataInputBlocks`
- 5 основных блоков ввода
- Валидация и подсказки
- Условное отображение полей

#### `ScenarioManager`
- Сохранение/загрузка сценариев
- Именование сценариев
- Переключение между сценариями

### 3. Отображение результатов

#### `ResultsPanel`
- Карточки с ключевыми метриками
- Цветовая индикация прибыль/убыток
- Анимированные изменения

#### `BreakEvenChart`
- Простой график на Canvas/SVG
- Точка безубыточности по цене
- Интерактивные элементы

#### `CostBreakdown`
- Детальная раскладка расходов
- Процентное соотношение
- Возможность сворачивания

## 📦 Конфигурационная система

### 1. Файлы конфигурации маркетплейсов

#### `data/marketplaces/wildberries.json`
```json
{
  "id": "wildberries",
  "name": "Wildberries",
  "defaultValues": {
    "commission": 0.17,
    "logistics": 0,
    "storage": 0,
    "pickupRate": 70,
    "returnRate": 15
  },
  "specificFields": [
    {
      "id": "spp",
      "name": "СПП (бонусы)",
      "type": "percentage",
      "tooltip": "Система персональных предложений"
    }
  ],
  "commissionRanges": {
    "fashion": { "min": 0.15, "max": 0.20 },
    "electronics": { "min": 0.12, "max": 0.18 }
  }
}
```

#### `data/marketplaces/ozon.json`
```json
{
  "id": "ozon",
  "name": "Ozon",
  "defaultValues": {
    "commission": 0.15,
    "logistics": 0,
    "storage": 0,
    "pickupRate": 65,
    "returnRate": 20
  },
  "specificFields": [
    {
      "id": "lastMile",
      "name": "Последняя миля",
      "type": "currency",
      "tooltip": "Стоимость доставки до клиента"
    }
  ]
}
```

### 2. Система пресетов

#### Автозаполнение для новичков
```typescript
interface PresetValues {
  category: string;
  averageValues: Partial<CalculationInput>;
  description: string;
}

const fashionPreset: PresetValues = {
  category: "fashion",
  averageValues: {
    pickupRate: 70,
    returnRate: 15,
    commission: 17,
    advertising: 50
  },
  description: "Средние значения для одежды и аксессуаров"
};
```

## 🧮 Система формул

### 1. Основные расчеты

#### Contribution Margin
```typescript
// CM1 = Revenue - COGS - Marketplace Fees
const calculateCM1 = (input: CalculationInput): number => {
  const revenue = input.retailPrice * (1 - input.sellerDiscount/100) * (1 - input.additionalPromo/100);
  const cogs = input.purchasePrice + input.deliveryToWarehouse + input.packaging + input.otherCOGS;
  const mpFees = revenue * input.commission/100 + input.logistics + input.storage + input.returnProcessing;
  
  return (revenue - cogs - mpFees) * input.pickupRate/100;
};

// CM2 = CM1 - Advertising
const calculateCM2 = (cm1: number, advertising: number): number => {
  return cm1 - advertising;
};
```

#### Точка безубыточности
```typescript
const calculateBreakEvenPrice = (input: CalculationInput): number => {
  const cogs = calculateTotalCOGS(input);
  const variableCosts = input.advertising + input.otherVariableCosts;
  const taxRate = getTaxRate(input.taxRegime);
  const effectivePickupRate = input.pickupRate / 100;
  const commissionRate = input.commission / 100;
  
  // Формула: (COGS + VariableCosts) / (PickupRate * (1 - Commission) * (1 - Tax))
  return (cogs + variableCosts) / 
         (effectivePickupRate * (1 - commissionRate) * (1 - taxRate));
};
```

### 2. Налоговые расчеты

```typescript
const calculateTax = (input: CalculationInput, revenue: number, profit: number): number => {
  switch (input.taxRegime) {
    case 'USN_6':
      return revenue * 0.06;
    case 'USN_15':
      return Math.max(profit * 0.15, revenue * 0.01); // минимальный налог
    case 'OSNO':
      // Упрощенная модель без НДС
      return profit * 0.20;
    default:
      return 0;
  }
};
```

## 📊 Экспорт в Excel

### Использование SheetJS
```typescript
import * as XLSX from 'xlsx';

interface ExcelExportData {
  inputData: CalculationInput;
  results: CalculationResults;
  breakdown: CostBreakdown;
  formulas: FormulaExplanation[];
}

const exportToExcel = (data: ExcelExportData): void => {
  const workbook = XLSX.utils.book_new();
  
  // Лист 1: Введенные данные
  const inputSheet = createInputDataSheet(data.inputData);
  XLSX.utils.book_append_sheet(workbook, inputSheet, "Исходные данные");
  
  // Лист 2: Результаты расчетов
  const resultsSheet = createResultsSheet(data.results);
  XLSX.utils.book_append_sheet(workbook, resultsSheet, "Результаты");
  
  // Лист 3: Детализация
  const breakdownSheet = createBreakdownSheet(data.breakdown);
  XLSX.utils.book_append_sheet(workbook, breakdownSheet, "Детализация");
  
  // Лист 4: Формулы и допущения
  const formulasSheet = createFormulasSheet(data.formulas);
  XLSX.utils.book_append_sheet(workbook, formulasSheet, "Формулы");
  
  // Экспорт файла
  XLSX.writeFile(workbook, `unit-economics-${Date.now()}.xlsx`);
};
```

## 🧪 Стратегия тестирования

### 1. Unit тесты для формул

```typescript
describe('CalculationEngine', () => {
  const engine = new CalculationEngine(wildberriesConfig);
  
  test('should calculate CM1 correctly', () => {
    const input: CalculationInput = {
      retailPrice: 1000,
      purchasePrice: 300,
      commission: 17,
      pickupRate: 70,
      // ... остальные поля
    };
    
    const result = engine.calculate(input);
    expect(result.cm1).toBeCloseTo(expectedCM1, 2);
  });
  
  test('should handle edge cases', () => {
    const input = { ...baseInput, pickupRate: 0 };
    const result = engine.calculate(input);
    expect(result.status).toBe('loss');
  });
});
```

### 2. Интеграционные тесты

```typescript
describe('User Journey', () => {
  test('complete calculation flow', async () => {
    render(<App />);
    
    // Выбор маркетплейса
    fireEvent.click(screen.getByText('Wildberries'));
    
    // Ввод данных
    fireEvent.change(screen.getByLabelText('Закупочная цена'), { 
      target: { value: '500' } 
    });
    
    // Проверка результатов
    await waitFor(() => {
      expect(screen.getByText(/CM1:/)).toBeInTheDocument();
    });
  });
});
```

## 🚀 Производительность

### 1. Оптимизация вычислений

```typescript
// Debounce для тяжелых расчетов
const useCalculationsWithDebounce = (input: CalculationInput) => {
  const [results, setResults] = useState<CalculationResults>();
  
  const debouncedCalculate = useMemo(
    () => debounce((input: CalculationInput) => {
      const newResults = calculationEngine.calculate(input);
      setResults(newResults);
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedCalculate(input);
  }, [input, debouncedCalculate]);
  
  return results;
};
```

### 2. Мемоизация дорогих операций

```typescript
const useMemoizedBreakdown = (results: CalculationResults) => {
  return useMemo(() => {
    return generateCostBreakdown(results);
  }, [results.cm1, results.cm2, results.netProfit]);
};
```

## 📱 Адаптивность

### Responsive design стратегия
- **Desktop-first** подход
- Breakpoints: 1024px (desktop), 768px (tablet), 480px (mobile)
- Стэкинг блоков на мобильных устройствах
- Скрытие вторичной информации на малых экранах

### Мобильная оптимизация
```css
@media (max-width: 768px) {
  .input-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .results-panel {
    flex-direction: column;
  }
  
  .chart-container {
    height: 200px; /* Уменьшенная высота */
  }
}
```

## 🔧 Конфигурация сборки

### Vite конфигурация
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['xlsx', 'chart.js']
        }
      }
    }
  }
});
```

Этот план предоставляет детальную техническую основу для разработки MVP калькулятора юнит-экономики с фокусом на производительность, масштабируемость и качество кода.
