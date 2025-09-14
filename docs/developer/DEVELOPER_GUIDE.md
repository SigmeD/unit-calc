# 👩‍💻 Developer Guide - Unit Calc

> Техническая документация для разработчиков калькулятора юнит-экономики

---

## 🏗️ Архитектура проекта

### Общие принципы
- **Монолитное SPA приложение** на React 18
- **Клиентская логика** - все расчеты выполняются в браузере
- **Реактивные вычисления** - мгновенный пересчет при изменении данных
- **Модульная структура** - легкое добавление новых маркетплейсов
- **TypeScript first** - полная типизация

### Tech Stack
```
Frontend:     React 18 + TypeScript 5.8
Styling:      Tailwind CSS 3.4
State:        React Context + useReducer
Build:        Vite 7.1
Tests:        Vitest 3.2 + React Testing Library
Linting:      ESLint 9 + Prettier 3.6
Export:       SheetJS (xlsx)
```

---

## 📁 Структура кодовой базы

```
src/
├── components/              # React компоненты
│   ├── ui/                 # Базовые UI элементы
│   │   ├── Button.tsx      # Кнопки с вариантами стилей
│   │   ├── Input.tsx       # Поля ввода с валидацией
│   │   ├── Card.tsx        # Карточки контента
│   │   ├── Select.tsx      # Выпадающие списки
│   │   └── Tooltip.tsx     # Подсказки с accessibility
│   ├── forms/              # Формы ввода данных
│   │   ├── DataInputForm.tsx        # Главная форма
│   │   ├── AutoFillHelper.tsx       # Помощник автозаполнения
│   │   ├── FormProgressTracker.tsx  # Трекер прогресса
│   │   └── sections/       # Секции формы
│   ├── results/            # Отображение результатов
│   │   ├── ResultsPanel.tsx         # Панель результатов
│   │   ├── MetricCard.tsx          # Карточки метрик
│   │   ├── BreakdownChart.tsx      # График структуры затрат
│   │   └── ProfitabilityIndicator.tsx # Индикатор прибыльности
│   ├── scenarios/          # Управление сценариями
│   │   ├── ScenarioManager.tsx     # Менеджер сценариев
│   │   ├── ScenarioList.tsx        # Список сценариев
│   │   └── ScenarioCard.tsx        # Карточка сценария
│   ├── export/             # Экспорт данных
│   │   └── ExcelExport.tsx # Экспорт в Excel
│   └── layout/             # Компоненты макета
│       ├── Layout.tsx      # Основной layout
│       ├── Header.tsx      # Шапка приложения
│       └── Footer.tsx      # Подвал
├── hooks/                  # Пользовательские хуки
│   ├── useAppState.ts      # Глобальное состояние
│   ├── useCalculations.ts  # Автоматические расчеты
│   ├── useFormProgress.ts  # Прогресс заполнения формы
│   ├── useAutoFill.ts      # Автозаполнение данных
│   └── useLocalStorage.ts  # Работа с localStorage
├── utils/                  # Утилиты
│   ├── formatters.ts       # Форматирование данных
│   ├── validators.ts       # Валидация
│   ├── constants.ts        # Константы
│   └── debounce.ts        # Debounce функция
├── types/                  # TypeScript типы
│   ├── index.ts           # Основные типы
│   ├── marketplace.ts     # Типы маркетплейсов
│   ├── calculation.ts     # Типы расчетов
│   └── scenario.ts        # Типы сценариев
├── calculations/           # Движок расчетов
│   ├── index.ts           # Основные функции расчетов
│   ├── formulas.ts        # Математические формулы
│   ├── validators.ts      # Валидация входных данных
│   └── __tests__/         # Тесты расчетов
├── data/                  # Данные и конфигурации
│   └── marketplaces/      # Конфигурации маркетплейсов
│       ├── wildberries.ts # Конфиг Wildberries
│       └── ozon.ts        # Конфиг Ozon
└── __tests__/             # Интеграционные тесты
    └── integration/       # E2E тесты
```

---

## 🔧 Основные модули

### 1. Управление состоянием (useAppState)

Централизованное состояние приложения с использованием Context API:

```typescript
interface AppState {
  selectedMarketplace: MarketplaceId;
  currentScenario: number;
  scenarios: Scenario[];
  input: CalculationInput;
  results: CalculationResults | null;
  errors: Record<string, string>;
  isCalculating: boolean;
}

// Основные действия
type AppAction = 
  | { type: 'SET_MARKETPLACE'; payload: MarketplaceId }
  | { type: 'UPDATE_INPUT'; payload: Partial<CalculationInput> }
  | { type: 'SET_RESULTS'; payload: CalculationResults }
  | { type: 'SAVE_SCENARIO'; payload: Scenario }
  | { type: 'LOAD_SCENARIO'; payload: number };
```

### 2. Движок расчетов (calculations/)

Чистые функции для математических операций:

```typescript
// Основная функция расчета всех метрик
export function calculateMetrics(input: CalculationInput): CalculationResults;

// Валидация входных данных
export function validateCalculationInput(input: CalculationInput): string[];

// Проверка на наличие критических ошибок
export function hasCalculationErrors(input: CalculationInput): boolean;
```

**Рассчитываемые метрики:**
- `revenue` - Выручка с учетом скидок и % выкупа
- `cm1` - Contribution Margin 1 (после MP-затрат)
- `cm2` - Contribution Margin 2 (после рекламы)
- `netProfit` - Чистая прибыль с единицы
- `marginPercent` - Маржинальность в %
- `roi` - Возврат на инвестиции
- `adRoi` - ROI на рекламу
- `acos` - Advertising Cost of Sales
- `breakEvenPrice` - Точка безубыточности по цене
- `breakEvenVolume` - Точка безубыточности по объему

### 3. Автоматические расчеты (useCalculations)

Реактивные расчеты с debounce и валидацией:

```typescript
export const useCalculations = ({
  input: CalculationInput,
  onResults: (results: CalculationResults) => void,
  onErrors: (errors: Record<string, string>) => void,
  onCalculating: (isCalculating: boolean) => void,
  debounceMs?: number // по умолчанию 300ms
}) => {
  // Возвращает утилиты для работы с расчетами
  return {
    canCalculate: boolean,
    validationErrors: Record<string, string>,
    forceCalculate: () => void
  };
};
```

---

## 🎨 UI/UX Компоненты

### Дизайн-система

**Цветовая палитра:**
```typescript
const theme = {
  primary: 'blue-600',     // Основной цвет
  success: 'green-600',    // Успех/прибыль
  danger: 'red-600',       // Ошибки/убытки
  warning: 'yellow-600',   // Предупреждения
  neutral: 'gray-600'      // Нейтральный
}
```

**Breakpoints (Tailwind CSS):**
- `sm: 640px` - Мобильные (landscape)
- `md: 768px` - Планшеты
- `lg: 1024px` - Десктоп
- `xl: 1280px` - Большие экраны

### Адаптивность

Приложение использует **desktop-first** подход с деградацией на мобильных:

```css
/* Десктоп (по умолчанию) */
.input-grid { grid-template-columns: repeat(2, 1fr); }

/* Планшеты */
@media (max-width: 1024px) {
  .input-grid { grid-template-columns: 1fr; }
}

/* Мобильные */
@media (max-width: 768px) {
  .input-grid { grid-template-columns: 1fr; }
  .results-panel { flex-direction: column; }
}
```

---

## 🧪 Тестирование

### Стратегия тестирования

1. **Unit тесты** - для движка расчетов и утилит
2. **Component тесты** - для React компонентов  
3. **Integration тесты** - для пользовательских сценариев

### Покрытие тестами

```bash
npm run test:coverage  # Запуск с покрытием
```

**Цели покрытия:**
- Движок расчетов: **100%**
- React компоненты: **≥80%**
- Утилиты: **≥90%**
- Общее покрытие: **≥85%**

### Примеры тестов

```typescript
// Тест расчетов
describe('calculateMetrics', () => {
  it('should calculate correct CM1 for profitable product', () => {
    const input: CalculationInput = { /* тестовые данные */ };
    const result = calculateMetrics(input);
    expect(result.cm1).toBeCloseTo(123.45, 2);
  });
});

// Тест компонента
describe('MetricCard', () => {
  it('renders profit status correctly', () => {
    render(<MetricCard value={100} label="CM1" status="profit" />);
    expect(screen.getByText('100 ₽')).toBeInTheDocument();
  });
});
```

---

## 🚀 Оптимизация производительности

### Build оптимизации

**Vite конфигурация:**
```typescript
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          xlsx: ['xlsx']  // Выделяем тяжелую библиотеку
        }
      }
    }
  }
});
```

### Runtime оптимизации

1. **React.memo** для дорогих компонентов
2. **useMemo** для тяжелых вычислений
3. **useCallback** для стабильных функций
4. **Debounce** для автоматических расчетов (300ms)

### Метрики производительности

**Цели:**
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.0s
- **Bundle size:** < 1MB (gzipped)

---

## 📱 Маркетплейсы

### Структура конфигурации

```typescript
interface MarketplaceConfig {
  id: MarketplaceId;
  name: string;
  defaultValues: Partial<CalculationInput>;
  commissionRates: {
    base: number;          // Базовая комиссия
    fulfillment: number;   // Логистика
    storage: number;       // Хранение
  };
  specialFields?: string[]; // Специфичные поля
}
```

### Добавление нового маркетплейса

1. Создать конфиг в `src/data/marketplaces/`
2. Добавить тип в `MarketplaceId`
3. Обновить селектор маркетплейса
4. Добавить специфичную логику (если нужно)

---

## 🔄 Процесс разработки

### Git workflow

```bash
# Создание feature ветки
git checkout -b feature/new-marketplace

# Коммиты с префиксами
git commit -m "feat: add Lamoda marketplace support"
git commit -m "fix: calculation error in tax module"
git commit -m "docs: update API documentation"
```

### Code style

Проект использует строгие правила ESLint + Prettier:

```bash
npm run lint      # Проверка кода
npm run lint:fix  # Автоисправление
npm run format    # Форматирование
```

### Pre-commit hooks

Автоматические проверки перед коммитом:
- Линтинг и форматирование
- Запуск тестов
- Проверка типов TypeScript

---

## 📊 Мониторинг и аналитика

### Метрики для отслеживания

**Технические метрики:**
- Bundle size и производительность
- Code coverage
- TypeScript ошибки

**Продуктовые метрики:**
- Time to first calculation (цель: < 5 минут)
- Retention по сценариям
- Export rate (цель: ≥70%)

---

## 🔮 Планы развития

### Версия 1.0
- [ ] Автообновление тарифов маркетплейсов
- [ ] Новые маркетплейсы (Lamoda, AliExpress)
- [ ] Пользовательские аккаунты

### Версия 2.0
- [ ] API интеграции с маркетплейсами
- [ ] Продвинутая аналитика и прогнозы
- [ ] Командная работа и шаринг

---

## 🆘 Troubleshooting

### Частые проблемы

**1. Ошибки расчетов**
```bash
# Проверить тесты
npm run test calculations/

# Проверить типы
npx tsc --noEmit
```

**2. Проблемы производительности**
```bash
# Анализ bundle
npm run build:analyze

# Профилирование в React DevTools
```

**3. Проблемы стилизации**
```bash
# Проверить Tailwind CSS
npx tailwindcss --watch

# Проверить адаптивность
# Использовать Chrome DevTools
```

---

## 📚 Полезные ресурсы

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)

---

**Обновлено:** 13 сентября 2025  
**Версия документации:** 1.0


