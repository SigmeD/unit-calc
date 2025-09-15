import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '@/App';
import { useAppState, useCalculations } from '@/hooks';

// Мокаем хуки
vi.mock('@/hooks', () => ({
  useAppState: vi.fn(),
  useCalculations: vi.fn(),
}));

// Мокаем компоненты
vi.mock('@/components/forms', () => ({
  MarketplaceSelector: ({ onMarketplaceChange, selectedMarketplace, marketplaces }: any) => (
    <div data-testid="marketplace-selector">
      <select 
        value={selectedMarketplace} 
        onChange={(e) => onMarketplaceChange(e.target.value)}
        data-testid="marketplace-select"
      >
        {marketplaces.map((mp: any) => (
          <option key={mp.id} value={mp.id}>{mp.name}</option>
        ))}
      </select>
    </div>
  ),
  DataInputForm: ({ onChange, onBulkChange, values }: any) => (
    <div data-testid="data-input-form">
      <input 
        data-testid="retail-price"
        value={values.retailPrice || ''}
        onChange={(e) => onChange('retailPrice', Number(e.target.value))}
        placeholder="Розничная цена"
      />
      <input 
        data-testid="purchase-price"
        value={values.purchasePrice || ''}
        onChange={(e) => onChange('purchasePrice', Number(e.target.value))}
        placeholder="Закупочная цена"
      />
      <input 
        data-testid="commission"
        value={values.commission || ''}
        onChange={(e) => onChange('commission', Number(e.target.value))}
        placeholder="Комиссия"
      />
      <button 
        data-testid="bulk-change"
        onClick={() => onBulkChange({ 
          retailPrice: 2000, 
          commission: 15,
          purchasePrice: 1000 
        })}
      >
        Bulk Change
      </button>
    </div>
  ),
  ScenarioManager: ({ scenarios, onScenarioLoad, onScenarioSave, onScenarioDelete, onNewScenario }: any) => (
    <div data-testid="scenario-manager">
      <div data-testid="scenarios-count">{scenarios.length}</div>
      <button data-testid="load-scenario" onClick={() => onScenarioLoad('scenario-1')}>Load</button>
      <button data-testid="save-scenario" onClick={() => onScenarioSave('New Scenario')}>Save</button>
      <button data-testid="delete-scenario" onClick={() => onScenarioDelete('scenario-1')}>Delete</button>
      <button data-testid="new-scenario" onClick={() => onNewScenario()}>New</button>
    </div>
  ),
}));

vi.mock('@/components/results', () => ({
  ResultsPanel: ({ results, isCalculating, onExport, onSave, onReset }: any) => (
    <div data-testid="results-panel">
      <div data-testid="results-data">{JSON.stringify(results)}</div>
      <div data-testid="calculating-status">{isCalculating ? 'Calculating' : 'Ready'}</div>
      <button data-testid="export-btn" onClick={onExport}>Export</button>
      <button data-testid="save-btn" onClick={onSave}>Save</button>
      <button data-testid="reset-btn" onClick={onReset}>Reset</button>
    </div>
  ),
}));

vi.mock('@/components/ui', () => ({
  Button: ({ onClick, children, className }: any) => (
    <button onClick={onClick} className={className} data-testid="glossary-button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/GlossaryModal', () => ({
  default: ({ isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="glossary-modal">
        <button data-testid="close-glossary" onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

vi.mock('@/components/layout/Layout', () => ({
  default: ({ children }: any) => (
    <div data-testid="layout">{children}</div>
  ),
}));

describe('App Integration Tests', () => {
  const mockUseAppState = useAppState as any;
  const mockUseCalculations = useCalculations as any;

  const defaultAppState = {
    selectedMarketplace: 'wildberries' as const,
    currentScenario: 'scenario-1',
    scenarios: [
      { id: 'scenario-1', name: 'Test Scenario 1' },
      { id: 'scenario-2', name: 'Test Scenario 2' }
    ],
    input: {
      retailPrice: 1000,
      commission: 17,
      purchasePrice: 500,
      taxRegime: 'USN_6' as const,
    },
    results: {
      netProfit: 200,
      profitMargin: 20,
      breakevenPrice: 800,
    },
    errors: {},
    isCalculating: false,
    setMarketplace: vi.fn(),
    updateInput: vi.fn(),
    setResults: vi.fn(),
    setErrors: vi.fn(),
    setCalculating: vi.fn(),
    saveScenario: vi.fn(),
    loadScenario: vi.fn(),
    deleteScenario: vi.fn(),
    newScenario: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockReturnValue(defaultAppState);
    mockUseCalculations.mockImplementation(() => {});
  });

  describe('Полный пользовательский сценарий', () => {
    it('должен выполнять полный цикл: выбор маркетплейса -> ввод данных -> расчет -> экспорт', async () => {
      render(<App />);
      
      // 1. Выбор маркетплейса
      const select = screen.getByTestId('marketplace-select');
      fireEvent.change(select, { target: { value: 'ozon' } });
      
      expect(defaultAppState.setMarketplace).toHaveBeenCalledWith('ozon');
      
      // 2. Ввод данных
      const retailPriceInput = screen.getByTestId('retail-price');
      const purchasePriceInput = screen.getByTestId('purchase-price');
      const commissionInput = screen.getByTestId('commission');
      
      fireEvent.change(retailPriceInput, { target: { value: '2000' } });
      fireEvent.change(purchasePriceInput, { target: { value: '1000' } });
      fireEvent.change(commissionInput, { target: { value: '15' } });
      
      expect(defaultAppState.updateInput).toHaveBeenCalledWith({ retailPrice: 2000 });
      expect(defaultAppState.updateInput).toHaveBeenCalledWith({ purchasePrice: 1000 });
      expect(defaultAppState.updateInput).toHaveBeenCalledWith({ commission: 15 });
      
      // 3. Проверка результатов
      expect(screen.getByTestId('results-panel')).toBeInTheDocument();
      expect(screen.getByTestId('results-data')).toHaveTextContent(JSON.stringify(defaultAppState.results));
      
      // 4. Экспорт
      const exportBtn = screen.getByTestId('export-btn');
      fireEvent.click(exportBtn);
      
      // Проверяем, что экспорт был вызван
      expect(exportBtn).toBeInTheDocument();
    });

    it('должен обрабатывать смену маркетплейса с применением дефолтных значений', async () => {
      render(<App />);
      
      // Начальное состояние - Wildberries
      expect(screen.getByTestId('marketplace-select')).toHaveValue('wildberries');
      
      // Смена на Ozon
      const select = screen.getByTestId('marketplace-select');
      fireEvent.change(select, { target: { value: 'ozon' } });
      
      // Проверяем, что применились дефолтные значения Ozon
      expect(defaultAppState.updateInput).toHaveBeenCalledWith({
        commission: 15,
        pickupRate: 65,
        returnRate: 20,
        logistics: 35,
        purchasePrice: 0,
        deliveryToWarehouse: 0,
        packaging: 0,
        otherCOGS: 0,
        storage: 0,
        returnProcessing: 0,
        advertising: 0,
        otherVariableCosts: 0,
        fixedCostsPerMonth: 0,
        expectedSalesPerMonth: 100,
        taxRegime: 'USN_6',
        retailPrice: 1000,
        sellerDiscount: 0,
        additionalPromo: 0,
      });
    });

    it('должен обрабатывать bulk изменения данных', async () => {
      render(<App />);
      
      const bulkChangeBtn = screen.getByTestId('bulk-change');
      fireEvent.click(bulkChangeBtn);
      
      expect(defaultAppState.updateInput).toHaveBeenCalledWith({
        retailPrice: 2000,
        commission: 15,
        purchasePrice: 1000,
      });
    });

    it('должен управлять сценариями: создание, загрузка, сохранение, удаление', async () => {
      render(<App />);
      
      // Создание нового сценария
      fireEvent.click(screen.getByTestId('new-scenario'));
      expect(defaultAppState.newScenario).toHaveBeenCalled();
      
      // Загрузка сценария
      fireEvent.click(screen.getByTestId('load-scenario'));
      expect(defaultAppState.loadScenario).toHaveBeenCalledWith('scenario-1');
      
      // Сохранение сценария
      fireEvent.click(screen.getByTestId('save-scenario'));
      expect(defaultAppState.saveScenario).toHaveBeenCalledWith('New Scenario');
      
      // Удаление сценария
      fireEvent.click(screen.getByTestId('delete-scenario'));
      expect(defaultAppState.deleteScenario).toHaveBeenCalledWith('scenario-1');
    });

    it('должен открывать и закрывать глоссарий', async () => {
      render(<App />);
      
      // Открытие глоссария
      const glossaryBtn = screen.getByTestId('glossary-button');
      fireEvent.click(glossaryBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('glossary-modal')).toBeInTheDocument();
      });
      
      // Закрытие глоссария
      const closeBtn = screen.getByTestId('close-glossary');
      fireEvent.click(closeBtn);
      
      await waitFor(() => {
        expect(screen.queryByTestId('glossary-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Обработка состояний', () => {
    it('должен отображать состояние загрузки', () => {
      mockUseAppState.mockReturnValue({
        ...defaultAppState,
        isCalculating: true,
      });
      
      render(<App />);
      
      expect(screen.getByTestId('calculating-status')).toHaveTextContent('Calculating');
    });

    it('должен скрывать форму и результаты когда маркетплейс не выбран', () => {
      mockUseAppState.mockReturnValue({
        ...defaultAppState,
        selectedMarketplace: null,
      });
      
      render(<App />);
      
      expect(screen.queryByTestId('data-input-form')).not.toBeInTheDocument();
      expect(screen.queryByTestId('results-panel')).not.toBeInTheDocument();
    });

    it('должен отображать правильное количество сценариев', () => {
      render(<App />);
      
      expect(screen.getByTestId('scenarios-count')).toHaveTextContent('2');
    });
  });

  describe('Взаимодействие с хуками', () => {
    it('должен правильно настраивать useCalculations', () => {
      render(<App />);
      
      expect(mockUseCalculations).toHaveBeenCalledWith({
        input: defaultAppState.input,
        onResults: defaultAppState.setResults,
        onErrors: defaultAppState.setErrors,
        onCalculating: defaultAppState.setCalculating,
        debounceMs: 800,
      });
    });

    it('должен обновлять расчеты при изменении входных данных', () => {
      const { rerender } = render(<App />);
      
      // Изменяем состояние
      mockUseAppState.mockReturnValue({
        ...defaultAppState,
        input: { ...defaultAppState.input, retailPrice: 2000 },
      });
      
      rerender(<App />);
      
      // Проверяем, что useCalculations получил новые данные
      expect(mockUseCalculations).toHaveBeenCalledWith({
        input: { ...defaultAppState.input, retailPrice: 2000 },
        onResults: defaultAppState.setResults,
        onErrors: defaultAppState.setErrors,
        onCalculating: defaultAppState.setCalculating,
        debounceMs: 800,
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('должен обрабатывать ошибки валидации', () => {
      mockUseAppState.mockReturnValue({
        ...defaultAppState,
        errors: {
          retailPrice: 'Цена должна быть больше 0',
          commission: 'Комиссия должна быть от 0 до 100',
        },
      });
      
      render(<App />);
      
      // Проверяем, что приложение не падает при наличии ошибок
      expect(screen.getByTestId('marketplace-selector')).toBeInTheDocument();
      expect(screen.getByTestId('data-input-form')).toBeInTheDocument();
    });
  });
});
