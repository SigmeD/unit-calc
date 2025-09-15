import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ScenarioManager from '../ScenarioManager';
import { useScenarios } from '../../../hooks/useScenarios';
import { useExport } from '../../../hooks/useExport';

// Мокаем хуки
vi.mock('../../../hooks/useScenarios', () => ({
  useScenarios: vi.fn(),
}));

vi.mock('../../../hooks/useExport', () => ({
  useExport: vi.fn(),
}));

describe('ScenarioManager', () => {
  const mockUseScenarios = vi.mocked(useScenarios);
  const mockUseExport = vi.mocked(useExport);
  const defaultProps = {
    scenarios: [
      { 
        id: 'scenario-1', 
        name: 'Test Scenario 1', 
        description: 'Test Description 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        input: { retailPrice: 1000, commission: 17, purchasePrice: 500 },
        results: { 
          netProfit: 200, 
          profitMargin: 20, 
          breakevenPrice: 800,
          marginPercent: 20,
          totalCosts: 800,
          revenue: 1000
        }
      },
      { 
        id: 'scenario-2', 
        name: 'Test Scenario 2', 
        description: 'Test Description 2',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        input: { retailPrice: 1200, commission: 15, purchasePrice: 600 },
        results: { 
          netProfit: 300, 
          profitMargin: 25, 
          breakevenPrice: 900,
          marginPercent: 25,
          totalCosts: 900,
          revenue: 1200
        }
      },
      { 
        id: 'scenario-3', 
        name: 'Test Scenario 3', 
        description: 'Test Description 3',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        input: { retailPrice: 800, commission: 20, purchasePrice: 400 },
        results: { 
          netProfit: 150, 
          profitMargin: 18, 
          breakevenPrice: 700,
          marginPercent: 18,
          totalCosts: 650,
          revenue: 800
        }
      },
    ],
    currentScenarioId: 'scenario-1',
    marketplace: 'wildberries' as const,
    currentInput: {
      retailPrice: 1000,
      commission: 17,
      purchasePrice: 500,
    },
    currentResults: {
      netProfit: 200,
      profitMargin: 20,
      breakevenPrice: 800,
    },
    onScenarioLoad: vi.fn(),
    onScenarioSave: vi.fn(),
    onScenarioDelete: vi.fn(),
    onNewScenario: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScenarios.mockReturnValue({
      isNameUnique: vi.fn().mockReturnValue(true),
      generateUniqueName: vi.fn().mockImplementation((name) => name),
      maxScenarios: 3,
      loadScenariosFromStorage: vi.fn(),
      saveScenario: vi.fn(),
      updateScenario: vi.fn(),
      deleteScenario: vi.fn(),
      getScenario: vi.fn(),
      copyScenario: vi.fn(),
      clearAllScenarios: vi.fn(),
    });
    mockUseExport.mockReturnValue({
      exportScenario: vi.fn(),
      exportMultipleScenarios: vi.fn(),
    });
  });

  it('должен рендериться без ошибок', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Управление сценариями')).toBeInTheDocument();
  });

  it('должен отображать все сценарии', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Test Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Test Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Test Scenario 3')).toBeInTheDocument();
  });

  it('должен отображать описания сценариев', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 3')).toBeInTheDocument();
  });

  it('должен выделять текущий сценарий', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const currentScenario = screen.getByText('Test Scenario 1').closest('div');
    expect(currentScenario).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('должен вызывать onScenarioLoad при клике на сценарий', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const scenario2 = screen.getByText('Test Scenario 2');
    fireEvent.click(scenario2);
    
    expect(defaultProps.onScenarioLoad).toHaveBeenCalledWith('scenario-2');
  });

  it('должен отображать кнопку создания нового сценария', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const newButton = screen.getByRole('button', { name: /новый сценарий/i });
    expect(newButton).toBeInTheDocument();
  });

  it('должен вызывать onNewScenario при клике на кнопку создания', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const newButton = screen.getByRole('button', { name: /новый сценарий/i });
    fireEvent.click(newButton);
    
    expect(defaultProps.onNewScenario).toHaveBeenCalled();
  });

  it('должен отображать кнопку сохранения сценария', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('должен вызывать onScenarioSave при клике на кнопку сохранения', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(saveButton);
    
    expect(defaultProps.onScenarioSave).toHaveBeenCalledWith({
      id: 'scenario-1',
      name: 'Test Scenario 1',
      description: 'Test Description 1',
    });
  });

  it('должен отображать кнопку удаления сценария', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('должен вызывать onScenarioDelete при клике на кнопку удаления', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onScenarioDelete).toHaveBeenCalledWith('scenario-1');
  });

  it('должен отображать информацию о текущем сценарии', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Текущий сценарий: Test Scenario 1')).toBeInTheDocument();
  });

  it('должен отображать количество сценариев', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Всего сценариев: 3')).toBeInTheDocument();
  });

  it('должен отображать информацию о маркетплейсе', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Маркетплейс: Wildberries')).toBeInTheDocument();
  });

  it('должен отображать информацию о входных данных', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Розничная цена: 1000')).toBeInTheDocument();
    expect(screen.getByText('Комиссия: 17%')).toBeInTheDocument();
    expect(screen.getByText('Закупочная цена: 500')).toBeInTheDocument();
  });

  it('должен отображать информацию о результатах', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    expect(screen.getByText('Чистая прибыль: 200')).toBeInTheDocument();
    expect(screen.getByText('Маржа прибыли: 20%')).toBeInTheDocument();
  });

  it('должен отображать пустое состояние когда нет сценариев', () => {
    const props = {
      ...defaultProps,
      scenarios: [],
    };

    render(<ScenarioManager {...props} />);
    
    expect(screen.getByText('Нет сохраненных сценариев')).toBeInTheDocument();
  });

  it('должен отображать правильные иконки для кнопок', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const newButton = screen.getByRole('button', { name: /новый сценарий/i });
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    
    expect(newButton.querySelector('svg')).toBeInTheDocument();
    expect(saveButton.querySelector('svg')).toBeInTheDocument();
    expect(deleteButton.querySelector('svg')).toBeInTheDocument();
  });

  it('должен отображать правильные цвета для кнопок', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const newButton = screen.getByRole('button', { name: /новый сценарий/i });
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    
    expect(newButton).toHaveClass('bg-green-500', 'hover:bg-green-600');
    expect(saveButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600');
    expect(deleteButton).toHaveClass('bg-red-500', 'hover:bg-red-600');
  });

  it('должен отображать правильные размеры кнопок', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const newButton = screen.getByRole('button', { name: /новый сценарий/i });
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    
    expect(newButton).toHaveClass('px-4', 'py-2');
    expect(saveButton).toHaveClass('px-4', 'py-2');
    expect(deleteButton).toHaveClass('px-4', 'py-2');
  });

  it('должен отображать правильные типы кнопок', () => {
    render(<ScenarioManager {...defaultProps} />);
    
    const newButton = screen.getByRole('button', { name: /новый сценарий/i });
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    
    expect(newButton).toHaveAttribute('type', 'button');
    expect(saveButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('type', 'button');
  });
});