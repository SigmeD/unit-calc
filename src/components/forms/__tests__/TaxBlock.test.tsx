import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TaxBlock from '../TaxBlock';

describe('TaxBlock', () => {
  const defaultProps = {
    values: {
      taxRegime: 'USN_6' as const,
    },
    onChange: vi.fn(),
    errors: {},
    grossProfit: 100000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен рендериться без ошибок', () => {
    render(<TaxBlock {...defaultProps} />);
    
    expect(screen.getByText('Блок 4: Налогообложение')).toBeInTheDocument();
  });

  it('должен отображать селектор налогового режима', () => {
    render(<TaxBlock {...defaultProps} />);
    
    expect(screen.getByLabelText(/налоговый режим/i)).toBeInTheDocument();
  });

  it('должен отображать текущее значение налогового режима', () => {
    render(<TaxBlock {...defaultProps} />);
    
    const select = screen.getByLabelText(/налоговый режим/i);
    expect(select).toHaveValue('USN_6');
  });

  it('должен вызывать onChange при изменении налогового режима', () => {
    render(<TaxBlock {...defaultProps} />);
    
    const select = screen.getByLabelText(/налоговый режим/i);
    fireEvent.change(select, { target: { value: 'USN_15' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('taxRegime', 'USN_15');
  });

  it('должен отображать ошибки валидации', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        taxRegime: 'Налоговый режим обязателен',
      },
    };

    render(<TaxBlock {...propsWithErrors} />);
    
    expect(screen.getByText('Налоговый режим обязателен')).toBeInTheDocument();
  });

  it('должен отображать информацию о выбранном режиме', () => {
    render(<TaxBlock {...defaultProps} />);
    
    expect(screen.getByText(/Выбранный режим:/)).toBeInTheDocument();
    expect(screen.getByText('УСН 6% (с оборота)')).toBeInTheDocument();
  });

  it('должен отображать правильные опции для налогового режима', () => {
    render(<TaxBlock {...defaultProps} />);
    
    const select = screen.getByLabelText(/налоговый режим/i);
    const options = select.querySelectorAll('option');
    
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('УСН 6% (с оборота)');
    expect(options[1]).toHaveTextContent('УСН 15% (с прибыли)');
    expect(options[2]).toHaveTextContent('ОСНО (упрощенно)');
  });

  it('должен отображать расчет налога при наличии валовой прибыли', () => {
    render(<TaxBlock {...defaultProps} grossProfit={50000} />);
    
    expect(screen.getByText('Налоговая база:')).toBeInTheDocument();
    expect(screen.getByText('Налоговая ставка:')).toBeInTheDocument();
    expect(screen.getByText('Налог к доплате:')).toBeInTheDocument();
  });

  it('должен отображать предупреждение о упрощенном расчете', () => {
    render(<TaxBlock {...defaultProps} />);
    
    expect(screen.getByText('Внимание! Расчет упрощенный')).toBeInTheDocument();
    expect(screen.getByText(/Для точного расчета налогов обратитесь к бухгалтеру/)).toBeInTheDocument();
  });

  it('должен отображать информацию для USN_15 режима', () => {
    const propsUSN15 = {
      ...defaultProps,
      values: { taxRegime: 'USN_15' as const },
    };
    
    render(<TaxBlock {...propsUSN15} />);
    
    expect(screen.getByText('УСН 15% (с прибыли)')).toBeInTheDocument();
    expect(screen.getByText(/Налоговая ставка: 15% с прибыли/)).toBeInTheDocument();
  });

  it('должен отображать информацию для OSNO режима', () => {
    const propsOSNO = {
      ...defaultProps,
      values: { taxRegime: 'OSNO' as const },
    };
    
    render(<TaxBlock {...propsOSNO} />);
    
    expect(screen.getByText('ОСНО (упрощенно)')).toBeInTheDocument();
    expect(screen.getByText(/НДС 20% \+ налог на прибыль ~20%/)).toBeInTheDocument();
  });
});