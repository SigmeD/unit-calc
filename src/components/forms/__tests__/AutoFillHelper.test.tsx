import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AutoFillHelper from '../AutoFillHelper';

// Мокаем хуки
vi.mock('@/hooks', () => ({
  useAutoFill: vi.fn(),
}));

describe('AutoFillHelper', () => {
  const mockUseAutoFill = vi.fn();
  const defaultProps = {
    marketplace: 'wildberries' as const,
    currentInput: {
      retailPrice: 1000,
      commission: 17,
      purchasePrice: 500,
    },
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAutoFill.mockReturnValue({
      suggestions: [],
      applySuggestions: vi.fn(),
      categories: [
        { key: 'low_price', name: 'Низкая цена', description: 'Бюджетный сегмент' },
        { key: 'mid_price', name: 'Средняя цена', description: 'Средний сегмент' },
        { key: 'high_price', name: 'Высокая цена', description: 'Премиум сегмент' },
      ],
    });
  });

  it('должен рендериться без ошибок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    expect(screen.getByText('Автозаполнение')).toBeInTheDocument();
  });

  it('должен отображать кнопку автозаполнения', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /автозаполнение/i });
    expect(button).toBeInTheDocument();
  });

  it('должен отображать категории цен', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    expect(screen.getByText('Низкая цена')).toBeInTheDocument();
    expect(screen.getByText('Средняя цена')).toBeInTheDocument();
    expect(screen.getByText('Высокая цена')).toBeInTheDocument();
  });

  it('должен отображать описания категорий', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    expect(screen.getByText('Бюджетный сегмент')).toBeInTheDocument();
    expect(screen.getByText('Средний сегмент')).toBeInTheDocument();
    expect(screen.getByText('Премиум сегмент')).toBeInTheDocument();
  });

  it('должен вызывать onApply при клике на кнопку применения', () => {
    const mockApplySuggestions = vi.fn().mockReturnValue({ retailPrice: 2000 });
    mockUseAutoFill.mockReturnValue({
      suggestions: [],
      applySuggestions: mockApplySuggestions,
      categories: [],
    });

    render(<AutoFillHelper {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /применить/i });
    fireEvent.click(applyButton);
    
    expect(mockApplySuggestions).toHaveBeenCalled();
    expect(defaultProps.onApply).toHaveBeenCalledWith({ retailPrice: 2000 });
  });

  it('должен вызывать onApply при клике на кнопку применения категории', () => {
    const mockApplySuggestions = vi.fn().mockReturnValue({ retailPrice: 2000 });
    mockUseAutoFill.mockReturnValue({
      suggestions: [],
      applySuggestions: mockApplySuggestions,
      categories: [],
    });

    render(<AutoFillHelper {...defaultProps} />);
    
    const applyCategoryButton = screen.getByRole('button', { name: /применить категорию/i });
    fireEvent.click(applyCategoryButton);
    
    expect(mockApplySuggestions).toHaveBeenCalled();
    expect(defaultProps.onApply).toHaveBeenCalledWith({ retailPrice: 2000 });
  });

  it('должен отображать правильные иконки для кнопок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /применить/i });
    const applyCategoryButton = screen.getByRole('button', { name: /применить категорию/i });
    
    expect(applyButton.querySelector('svg')).toBeInTheDocument();
    expect(applyCategoryButton.querySelector('svg')).toBeInTheDocument();
  });

  it('должен отображать правильные классы для кнопок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /применить/i });
    const applyCategoryButton = screen.getByRole('button', { name: /применить категорию/i });
    
    expect(applyButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600');
    expect(applyCategoryButton).toHaveClass('bg-green-500', 'hover:bg-green-600');
  });

  it('должен отображать правильные размеры для кнопок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /применить/i });
    const applyCategoryButton = screen.getByRole('button', { name: /применить категорию/i });
    
    expect(applyButton).toHaveClass('px-4', 'py-2');
    expect(applyCategoryButton).toHaveClass('px-4', 'py-2');
  });

  it('должен отображать правильные типы для кнопок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /применить/i });
    const applyCategoryButton = screen.getByRole('button', { name: /применить категорию/i });
    
    expect(applyButton).toHaveAttribute('type', 'button');
    expect(applyCategoryButton).toHaveAttribute('type', 'button');
  });

  it('должен отображать правильные атрибуты для кнопок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /применить/i });
    const applyCategoryButton = screen.getByRole('button', { name: /применить категорию/i });
    
    expect(applyButton).toHaveAttribute('data-testid', 'apply-suggestions');
    expect(applyCategoryButton).toHaveAttribute('data-testid', 'apply-category');
  });

  it('должен отображать правильные классы для контейнера', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const container = screen.getByTestId('auto-fill-helper');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });

  it('должен отображать правильные классы для заголовка', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const title = screen.getByText('Автозаполнение');
    expect(title).toHaveClass('text-xl', 'font-bold', 'mb-4');
  });

  it('должен отображать правильные классы для списка категорий', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const list = screen.getByTestId('category-list');
    expect(list).toHaveClass('space-y-4');
  });

  it('должен отображать правильные классы для элементов категорий', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const categoryItems = screen.getAllByTestId('category-item');
    categoryItems.forEach(item => {
      expect(item).toHaveClass('border', 'rounded-lg', 'p-4', 'cursor-pointer', 'hover:bg-gray-50');
    });
  });

  it('должен отображать правильные классы для названий категорий', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const categoryNames = screen.getAllByTestId('category-name');
    categoryNames.forEach(name => {
      expect(name).toHaveClass('font-semibold', 'text-gray-900');
    });
  });

  it('должен отображать правильные классы для описаний категорий', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const categoryDescriptions = screen.getAllByTestId('category-description');
    categoryDescriptions.forEach(description => {
      expect(description).toHaveClass('text-sm', 'text-gray-600');
    });
  });

  it('должен отображать правильные классы для кнопок действий', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const actionButtons = screen.getAllByTestId('action-button');
    actionButtons.forEach(button => {
      expect(button).toHaveClass('px-4', 'py-2', 'rounded-md', 'text-white', 'font-medium');
    });
  });

  it('должен отображать правильные классы для иконок кнопок', () => {
    render(<AutoFillHelper {...defaultProps} />);
    
    const buttonIcons = screen.getAllByTestId('button-icon');
    buttonIcons.forEach(icon => {
      expect(icon).toHaveClass('w-4', 'h-4', 'mr-2');
    });
  });
});