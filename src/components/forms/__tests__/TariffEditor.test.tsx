import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TariffEditor } from '../TariffEditor';

describe('TariffEditor', () => {
  const mockMarketplace = {
    id: 'wildberries' as const,
    name: 'Wildberries',
    config: {
      defaultCommission: 17,
      logisticOptions: [],
      specificFields: [],
      taxRegimes: ['USN_6', 'USN_15', 'OSNO'] as const,
    },
    defaultValues: {
      commission: 17,
      pickupRate: 70,
      returnRate: 15,
      logistics: 0,
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
      taxRegime: 'USN_6' as const,
      retailPrice: 1000,
      sellerDiscount: 0,
      additionalPromo: 0,
    },
  };

  const defaultProps = {
    marketplace: mockMarketplace,
    currentValues: {
      commission: 17,
      logistics: 0,
      storage: 0,
      advertising: 50,
      pickupRate: 70,
      returnRate: 15,
    },
    onValuesChange: vi.fn(),
    errors: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен рендериться без ошибок', () => {
    render(<TariffEditor {...defaultProps} />);
    
    expect(screen.getByText('Настройка тарифов')).toBeInTheDocument();
  });

  it('должен отображать название маркетплейса', () => {
    render(<TariffEditor {...defaultProps} />);
    
    expect(screen.getAllByText(/Wildberries/)).toHaveLength(2);
  });

  it('должен отображать все поля ввода в режиме ручного редактирования', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    expect(screen.getByLabelText(/комиссия маркетплейса/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/логистика/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/хранение/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/реклама на продажу/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/процент выкупа/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/процент возвратов/i)).toBeInTheDocument();
  });

  it('должен отображать текущие значения в режиме предустановок', () => {
    render(<TariffEditor {...defaultProps} />);
    
    expect(screen.getByText('17%')).toBeInTheDocument();
    expect(screen.getAllByText('₽0')).toHaveLength(2); // Логистика и хранение
    expect(screen.getByText('₽50')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('должен вызывать onValuesChange при изменении значений в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    fireEvent.change(commissionInput, { target: { value: '20' } });
    
    // Нажимаем кнопку применения изменений
    const applyButton = screen.getByText('Применить изменения');
    fireEvent.click(applyButton);
    
    expect(defaultProps.onValuesChange).toHaveBeenCalled();
  });

  it('должен отображать ошибки валидации в ручном режиме', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        commission: 'Комиссия должна быть от 0 до 100',
        logistics: 'Логистика должна быть больше 0',
      },
    };

    render(<TariffEditor {...propsWithErrors} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    expect(screen.getByText('Комиссия должна быть от 0 до 100')).toBeInTheDocument();
    expect(screen.getByText('Логистика должна быть больше 0')).toBeInTheDocument();
  });

  it('должен отображать кнопки подсказок для полей в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    // Проверяем наличие кнопок с подсказками
    const tooltipButtons = screen.getAllByLabelText('Информация');
    expect(tooltipButtons).toHaveLength(6);
  });

  it('должен отображать правильные атрибуты полей в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const logisticsInput = screen.getByLabelText(/логистика/i);
    const storageInput = screen.getByLabelText(/хранение/i);
    const advertisingInput = screen.getByLabelText(/реклама на продажу/i);
    const pickupInput = screen.getByLabelText(/процент выкупа/i);
    const returnInput = screen.getByLabelText(/процент возвратов/i);
    
    // Проверяем inputmode вместо type
    expect(commissionInput).toHaveAttribute('inputmode', 'numeric');
    expect(logisticsInput).toHaveAttribute('inputmode', 'numeric');
    expect(storageInput).toHaveAttribute('inputmode', 'numeric');
    expect(advertisingInput).toHaveAttribute('inputmode', 'numeric');
    expect(pickupInput).toHaveAttribute('inputmode', 'numeric');
    expect(returnInput).toHaveAttribute('inputmode', 'numeric');
  });

  it('должен отображать правильные значения полей в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const commissionInput = screen.getByLabelText(/комиссия маркетплейса/i);
    const logisticsInput = screen.getByLabelText(/логистика/i);
    const storageInput = screen.getByLabelText(/хранение/i);
    const advertisingInput = screen.getByLabelText(/реклама на продажу/i);
    const pickupInput = screen.getByLabelText(/процент выкупа/i);
    const returnInput = screen.getByLabelText(/процент возвратов/i);
    
    // Проверяем значения полей (как строки)
    expect(commissionInput).toHaveValue('17');
    expect(logisticsInput).toHaveValue('0');
    expect(storageInput).toHaveValue('0');
    expect(advertisingInput).toHaveValue('50');
    expect(pickupInput).toHaveValue('70');
    expect(returnInput).toHaveValue('15');
  });

  it('должен отображать правильные классы для контейнера', () => {
    render(<TariffEditor {...defaultProps} />);
    
    const container = screen.getByText('Настройка тарифов').closest('.card');
    expect(container).toBeInTheDocument();
  });

  it('должен отображать правильные классы для сетки в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(grid).toBeInTheDocument();
  });

  it('должен отображать правильные классы для полей в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const fields = screen.getAllByRole('textbox');
    fields.forEach(field => {
      expect(field).toHaveClass('input-field');
    });
  });

  it('должен отображать правильные классы для лейблов в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const labels = screen.getAllByText(/комиссия маркетплейса|логистика|хранение|реклама на продажу|процент выкупа|процент возвратов/i);
    labels.forEach(label => {
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });
  });

  it('должен отображать правильные классы для кнопок подсказок в ручном режиме', () => {
    render(<TariffEditor {...defaultProps} />);
    
    // Переключаемся в режим ручного редактирования
    const manualModeButton = screen.getByText('Ручной ввод');
    fireEvent.click(manualModeButton);
    
    const tooltipButtons = screen.getAllByLabelText('Информация');
    tooltipButtons.forEach(button => {
      expect(button).toHaveClass('text-gray-400', 'hover:text-gray-600', 'transition-colors', 'p-1', 'rounded-full', 'hover:bg-gray-100');
    });
  });
});