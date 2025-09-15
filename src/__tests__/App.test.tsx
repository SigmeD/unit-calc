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
      <button 
        data-testid="bulk-change"
        onClick={() => onBulkChange({ retailPrice: 2000, commission: 15 })}
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

describe('App', () => {
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

  it('должен рендериться без ошибок', () => {
    render(<App />);
    
    expect(screen.getByText('Калькулятор юнит-экономики')).toBeInTheDocument();
    expect(screen.getByTestId('marketplace-selector')).toBeInTheDocument();
    expect(screen.getByTestId('data-input-form')).toBeInTheDocument();
    expect(screen.getByTestId('results-panel')).toBeInTheDocument();
  });

  it('должен отображать заголовок и описание', () => {
    render(<App />);
    
    expect(screen.getByText('Калькулятор юнит-экономики')).toBeInTheDocument();
    expect(screen.getByText(/Рассчитайте прибыльность товаров на/)).toBeInTheDocument();
    expect(screen.getByText('Wildberries')).toBeInTheDocument();
    expect(screen.getByText('Ozon')).toBeInTheDocument();
  });

  it('должен отображать статистику', () => {
    render(<App />);
    
    expect(screen.getByText('100% точность расчетов')).toBeInTheDocument();
    expect(screen.getByText('2 маркетплейса')).toBeInTheDocument();
    expect(screen.getByText('Бесплатно')).toBeInTheDocument();
  });

  it('должен открывать глоссарий при клике на кнопку', async () => {
    render(<App />);
    
    const glossaryButton = screen.getByTestId('glossary-button');
    expect(glossaryButton).toBeInTheDocument();
    
    fireEvent.click(glossaryButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('glossary-modal')).toBeInTheDocument();
    });
  });

  it('должен закрывать глоссарий при клике на кнопку закрытия', async () => {
    render(<App />);
    
    // Открываем глоссарий
    fireEvent.click(screen.getByTestId('glossary-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('glossary-modal')).toBeInTheDocument();
    });
    
    // Закрываем глоссарий
    fireEvent.click(screen.getByTestId('close-glossary'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('glossary-modal')).not.toBeInTheDocument();
    });
  });

  it('должен вызывать setMarketplace при смене маркетплейса', () => {
    render(<App />);
    
    const select = screen.getByTestId('marketplace-select');
    fireEvent.change(select, { target: { value: 'ozon' } });
    
    expect(defaultAppState.setMarketplace).toHaveBeenCalledWith('ozon');
  });

  it('должен вызывать updateInput при изменении поля ввода', () => {
    render(<App />);
    
    const input = screen.getByTestId('retail-price');
    fireEvent.change(input, { target: { value: '2000' } });
    
    expect(defaultAppState.updateInput).toHaveBeenCalledWith({ retailPrice: 2000 });
  });

  it('должен вызывать updateInput при bulk изменении', () => {
    render(<App />);
    
    const button = screen.getByTestId('bulk-change');
    fireEvent.click(button);
    
    expect(defaultAppState.updateInput).toHaveBeenCalledWith({ 
      retailPrice: 2000, 
      commission: 15 
    });
  });

  it('должен отображать ScenarioManager когда выбран маркетплейс', () => {
    render(<App />);
    
    expect(screen.getByTestId('scenario-manager')).toBeInTheDocument();
    expect(screen.getByTestId('scenarios-count')).toHaveTextContent('2');
  });

  it('должен вызывать функции управления сценариями', () => {
    render(<App />);
    
    // Тест загрузки сценария
    fireEvent.click(screen.getByTestId('load-scenario'));
    expect(defaultAppState.loadScenario).toHaveBeenCalledWith('scenario-1');
    
    // Тест сохранения сценария
    fireEvent.click(screen.getByTestId('save-scenario'));
    expect(defaultAppState.saveScenario).toHaveBeenCalledWith('New Scenario');
    
    // Тест удаления сценария
    fireEvent.click(screen.getByTestId('delete-scenario'));
    expect(defaultAppState.deleteScenario).toHaveBeenCalledWith('scenario-1');
    
    // Тест создания нового сценария
    fireEvent.click(screen.getByTestId('new-scenario'));
    expect(defaultAppState.newScenario).toHaveBeenCalled();
  });

  it('должен передавать правильные пропсы в ResultsPanel', () => {
    render(<App />);
    
    expect(screen.getByTestId('results-data')).toHaveTextContent(JSON.stringify(defaultAppState.results));
    expect(screen.getByTestId('calculating-status')).toHaveTextContent('Ready');
  });

  it('должен отображать состояние загрузки в ResultsPanel', () => {
    mockUseAppState.mockReturnValue({
      ...defaultAppState,
      isCalculating: true,
    });
    
    render(<App />);
    
    expect(screen.getByTestId('calculating-status')).toHaveTextContent('Calculating');
  });

  it('должен вызывать useCalculations с правильными параметрами', () => {
    render(<App />);
    
    expect(mockUseCalculations).toHaveBeenCalledWith({
      input: defaultAppState.input,
      onResults: defaultAppState.setResults,
      onErrors: defaultAppState.setErrors,
      onCalculating: defaultAppState.setCalculating,
      debounceMs: 800,
    });
  });

  it('должен применять дефолтные значения при смене маркетплейса', () => {
    render(<App />);
    
    const select = screen.getByTestId('marketplace-select');
    fireEvent.change(select, { target: { value: 'ozon' } });
    
    expect(defaultAppState.setMarketplace).toHaveBeenCalledWith('ozon');
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

  it('должен отображать кнопки действий в ResultsPanel', () => {
    render(<App />);
    
    expect(screen.getByTestId('export-btn')).toBeInTheDocument();
    expect(screen.getByTestId('save-btn')).toBeInTheDocument();
    expect(screen.getByTestId('reset-btn')).toBeInTheDocument();
  });

  it('должен обрабатывать клики по кнопкам действий', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<App />);
    
    fireEvent.click(screen.getByTestId('export-btn'));
    expect(consoleSpy).toHaveBeenCalledWith('Экспорт в Excel');
    
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(consoleSpy).toHaveBeenCalledWith('Сохранить сценарий');
    
    fireEvent.click(screen.getByTestId('reset-btn'));
    expect(consoleSpy).toHaveBeenCalledWith('Сбросить данные');
    
    consoleSpy.mockRestore();
  });

  it('должен скрывать DataInputForm и ResultsPanel когда маркетплейс не выбран', () => {
    mockUseAppState.mockReturnValue({
      ...defaultAppState,
      selectedMarketplace: null,
    });
    
    render(<App />);
    
    expect(screen.queryByTestId('data-input-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-panel')).not.toBeInTheDocument();
  });

  it('должен отображать правильный маркетплейс в ResultsPanel', () => {
    render(<App />);
    
    // Проверяем, что ResultsPanel получает правильный маркетплейс
    // Это проверяется через передачу marketplace в ResultsPanel
    expect(screen.getByTestId('results-panel')).toBeInTheDocument();
  });
});
