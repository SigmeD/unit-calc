import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ValidationSummary from '../ValidationSummary';

describe('ValidationSummary', () => {
  const defaultProps = {
    errors: {
      retailPrice: 'Цена должна быть больше 0',
      commission: 'Комиссия должна быть от 0 до 100',
      purchasePrice: 'Закупочная цена обязательна',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен рендериться без ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    expect(screen.getByText('Ошибки валидации')).toBeInTheDocument();
  });

  it('должен отображать все ошибки', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    expect(screen.getByText('Цена должна быть больше 0')).toBeInTheDocument();
    expect(screen.getByText('Комиссия должна быть от 0 до 100')).toBeInTheDocument();
    expect(screen.getByText('Закупочная цена обязательна')).toBeInTheDocument();
  });

  it('должен отображать названия полей с ошибками', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    expect(screen.getByText('retailPrice:')).toBeInTheDocument();
    expect(screen.getByText('commission:')).toBeInTheDocument();
    expect(screen.getByText('purchasePrice:')).toBeInTheDocument();
  });

  it('должен отображать правильные иконки для ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const errorIcons = document.querySelectorAll('svg');
    expect(errorIcons).toHaveLength(3);
  });

  it('должен отображать правильные классы для контейнера', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const container = screen.getByText('Ошибки валидации').closest('.card');
    expect(container).toHaveClass('border-red-200', 'bg-red-50');
  });

  it('должен отображать правильные классы для заголовка', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const title = screen.getByText('Ошибки валидации');
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
  });

  it('должен отображать правильные классы для списка ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const list = screen.getByText('Ошибки валидации').closest('.card')?.querySelector('.space-y-2');
    expect(list).toHaveClass('space-y-2');
  });

  it('должен отображать правильные классы для элементов ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const errorItems = screen.getAllByText(/Цена должна быть больше 0|Комиссия должна быть от 0 до 100|Закупочная цена обязательна/);
    errorItems.forEach(item => {
      const container = item.closest('div')?.parentElement;
      expect(container).toHaveClass('flex', 'items-start', 'space-x-2');
    });
  });

  it('должен отображать правильные классы для иконок ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const errorIcons = document.querySelectorAll('svg');
    errorIcons.forEach(icon => {
      expect(icon).toHaveClass('w-5', 'h-5', 'text-red-500');
    });
  });

  it('должен отображать правильные классы для текста ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const errorTexts = screen.getAllByText(/Цена должна быть больше 0|Комиссия должна быть от 0 до 100|Закупочная цена обязательна/);
    errorTexts.forEach(text => {
      expect(text).toHaveClass('text-sm', 'text-red-700');
    });
  });

  it('должен возвращать null когда нет ошибок', () => {
    const props = {
      ...defaultProps,
      errors: {},
    };

    const { container } = render(<ValidationSummary {...props} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('должен отображать правильные классы для иконок контейнеров', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const iconContainers = screen.getAllByText('Цена должна быть больше 0').map(item => 
      item.closest('div')?.previousElementSibling
    ).filter(Boolean);
    
    iconContainers.forEach(container => {
      expect(container).toHaveClass('flex-shrink-0', 'w-5', 'h-5', 'mt-0.5');
    });
  });

  it('должен отображать правильные классы для текстовых контейнеров', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const textContainers = screen.getAllByText(/Цена должна быть больше 0|Комиссия должна быть от 0 до 100|Закупочная цена обязательна/);
    
    textContainers.forEach(container => {
      expect(container).toHaveClass('text-sm', 'text-red-700');
    });
  });

  it('должен отображать правильные классы для названий полей', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const fieldNames = screen.getAllByText(/retailPrice:|commission:|purchasePrice:/);
    fieldNames.forEach(name => {
      expect(name).toHaveClass('font-medium');
    });
  });

  it('должен отображать правильное количество ошибок', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const errorItems = screen.getAllByText(/Цена должна быть больше 0|Комиссия должна быть от 0 до 100|Закупочная цена обязательна/);
    expect(errorItems).toHaveLength(3);
  });

  it('должен отображать правильные SVG иконки', () => {
    render(<ValidationSummary {...defaultProps} />);
    
    const svgElements = document.querySelectorAll('svg');
    svgElements.forEach(svg => {
      expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });
  });
});