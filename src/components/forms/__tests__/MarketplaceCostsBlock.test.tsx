import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MarketplaceCostsBlock from '../MarketplaceCostsBlock';

describe('MarketplaceCostsBlock', () => {
  const defaultProps = {
    values: {
      commission: 17,
      pickupRate: 70,
      returnRate: 15,
      logistics: 0,
      storage: 0,
      returnProcessing: 0,
    },
    onChange: vi.fn(),
    errors: {},
    marketplace: 'wildberries' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен рендериться без ошибок', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    expect(screen.getByText('Блок 2: Расходы маркетплейса')).toBeInTheDocument();
  });

  it('должен отображать подзаголовок', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    expect(screen.getByText('Комиссии и расходы, связанные с продажами на платформе')).toBeInTheDocument();
  });

  it('должен отображать все поля ввода', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    expect(screen.getByLabelText(/комиссия маркетплейса/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/логистика до клиента/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/процент пикапа/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/процент возврата/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/хранение/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/обработка возврата/i)).toBeInTheDocument();
  });

  it('должен отображать текущие значения', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    expect(screen.getByDisplayValue('17')).toBeInTheDocument();
    expect(screen.getByDisplayValue('70')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  it('должен вызывать onChange при изменении значений', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    fireEvent.change(commissionInput, { target: { value: '20' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('commission', 20);
  });

  it('должен отображать ошибки валидации', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        commission: 'Комиссия должна быть от 0 до 100',
        pickupRate: 'Пикап должен быть от 0 до 100',
      },
    };

    render(<MarketplaceCostsBlock {...propsWithErrors} />);
    
    expect(screen.getByText('Комиссия должна быть от 0 до 100')).toBeInTheDocument();
    expect(screen.getByText('Пикап должен быть от 0 до 100')).toBeInTheDocument();
  });

  it('должен отображать подсказки для полей', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    expect(screen.getByText(/процент комиссии маркетплейса/i)).toBeInTheDocument();
    expect(screen.getByText(/на wildberries логистика/i)).toBeInTheDocument();
    expect(screen.getByText(/процент пикапа/i)).toBeInTheDocument();
    expect(screen.getByText(/процент возврата/i)).toBeInTheDocument();
    expect(screen.getByText(/стоимость хранения/i)).toBeInTheDocument();
    expect(screen.getByText(/стоимость обработки/i)).toBeInTheDocument();
  });

  it('должен отображать правильные placeholder для Wildberries', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const logisticsInput = screen.getByLabelText(/логистика до клиента/i);
    
    expect(commissionInput).toHaveAttribute('placeholder', '17');
    expect(logisticsInput).toHaveAttribute('placeholder', '0');
  });

  it('должен отображать правильные placeholder для Ozon', () => {
    const props = {
      ...defaultProps,
      marketplace: 'ozon' as const,
    };

    render(<MarketplaceCostsBlock {...props} />);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const logisticsInput = screen.getByLabelText(/логистика до клиента/i);
    
    expect(commissionInput).toHaveAttribute('placeholder', '15');
    expect(logisticsInput).toHaveAttribute('placeholder', '35');
  });

  it('должен отображать правильные типы полей', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const logisticsInput = screen.getByLabelText(/логистика до клиента/i);
    const pickupInput = screen.getByLabelText(/процент пикапа/i);
    const returnInput = screen.getByLabelText(/процент возврата/i);
    const storageInput = screen.getByLabelText(/хранение/i);
    const returnProcessingInput = screen.getByLabelText(/обработка возврата/i);
    
    expect(commissionInput).toHaveAttribute('type', 'number');
    expect(logisticsInput).toHaveAttribute('type', 'number');
    expect(pickupInput).toHaveAttribute('type', 'number');
    expect(returnInput).toHaveAttribute('type', 'number');
    expect(storageInput).toHaveAttribute('type', 'number');
    expect(returnProcessingInput).toHaveAttribute('type', 'number');
  });

  it('должен отображать правильные min и max для полей', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const pickupInput = screen.getByLabelText(/процент пикапа/i);
    const returnInput = screen.getByLabelText(/процент возврата/i);
    
    expect(commissionInput).toHaveAttribute('min', '0');
    expect(commissionInput).toHaveAttribute('max', '50');
    expect(pickupInput).toHaveAttribute('min', '0');
    expect(pickupInput).toHaveAttribute('max', '100');
    expect(returnInput).toHaveAttribute('min', '0');
    expect(returnInput).toHaveAttribute('max', '100');
  });

  it('должен отображать правильные step для полей', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const pickupInput = screen.getByLabelText(/процент пикапа/i);
    const returnInput = screen.getByLabelText(/процент возврата/i);
    
    expect(commissionInput).toHaveAttribute('step', '0.1');
    expect(pickupInput).toHaveAttribute('step', '0.1');
    expect(returnInput).toHaveAttribute('step', '0.1');
  });

  it('должен отображать правильные классы для контейнера', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const container = screen.getByText('Блок 2: Расходы маркетплейса').closest('.card');
    expect(container).toBeInTheDocument();
  });

  it('должен отображать правильные классы для сетки', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(grid).toBeInTheDocument();
  });

  it('должен отображать правильные классы для полей', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const fields = screen.getAllByRole('textbox');
    fields.forEach(field => {
      expect(field).toHaveClass('w-full', 'px-3', 'py-2', 'border', 'rounded-md');
    });
  });

  it('должен отображать правильные классы для лейблов', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const labels = screen.getAllByText(/комиссия|логистика|пикап|возврат|хранение|обработка/i);
    labels.forEach(label => {
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });
  });

  it('должен отображать правильные классы для подсказок', () => {
    render(<MarketplaceCostsBlock {...defaultProps} />);
    
    const tooltips = screen.getAllByText(/процент комиссии|на wildberries|процент пикапа|процент возврата|стоимость хранения|стоимость обработки/i);
    tooltips.forEach(tooltip => {
      expect(tooltip).toHaveClass('text-xs', 'text-gray-500', 'mt-1');
    });
  });
});