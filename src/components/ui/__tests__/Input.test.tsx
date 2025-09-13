/**
 * Unit тесты для компонента Input
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '../Input';

describe('Input', () => {
  const defaultProps = {
    label: 'Тестовое поле',
    value: 0,
    onChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Рендеринг', () => {
    it('должен отображать базовое поле ввода', () => {
      render(<Input {...defaultProps} />);

      expect(screen.getByLabelText('Тестовое поле')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('должен отображать лейбл', () => {
      render(<Input {...defaultProps} />);

      expect(screen.getByText('Тестовое поле')).toBeInTheDocument();
    });

    it('должен отображать значение', () => {
      render(<Input {...defaultProps} value={150} />);

      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    });

    it('должен отображать placeholder', () => {
      render(<Input {...defaultProps} placeholder="Введите значение" />);

      expect(screen.getByPlaceholderText('Введите значение')).toBeInTheDocument();
    });

    it('должен отображать звездочку для обязательных полей', () => {
      render(<Input {...defaultProps} required />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Типы полей', () => {
    it('должен отображать суффикс % для процентных полей', () => {
      render(<Input {...defaultProps} type="percentage" />);

      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('должен отображать суффикс ₽ для валютных полей', () => {
      render(<Input {...defaultProps} type="currency" />);

      expect(screen.getByText('₽')).toBeInTheDocument();
    });

    it('должен применять корректные CSS классы для типов', () => {
      const { rerender } = render(<Input {...defaultProps} type="percentage" />);
      
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-8');

      rerender(<Input {...defaultProps} type="currency" />);
      
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-8');
    });
  });

  describe('Состояния', () => {
    it('должен отображать состояние ошибки', () => {
      render(<Input {...defaultProps} error="Поле обязательно" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
      expect(screen.getByText('Поле обязательно')).toBeInTheDocument();
    });

    it('должен отображать состояние disabled', () => {
      render(<Input {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    });
  });

  describe('Tooltip', () => {
    it('должен отображать иконку подсказки при наличии tooltip', () => {
      render(<Input {...defaultProps} tooltip="Это подсказка" />);

      const tooltipButton = screen.getByRole('button', { name: 'Информация' });
      expect(tooltipButton).toBeInTheDocument();
    });

    it('не должен отображать иконку подсказки без tooltip', () => {
      render(<Input {...defaultProps} />);

      const tooltipButton = screen.queryByRole('button', { name: 'Информация' });
      expect(tooltipButton).not.toBeInTheDocument();
    });

    it('должен иметь корректные атрибуты для accessibility', () => {
      render(<Input {...defaultProps} tooltip="Это подсказка" />);

      const tooltipButton = screen.getByRole('button', { name: 'Информация' });
      expect(tooltipButton).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Обработка ввода', () => {
    it('должен принимать цифры', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '123' } });
      expect(input).toHaveValue('123');
    });

    it('должен принимать десятичные числа с точкой', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '123.45' } });
      expect(input).toHaveValue('123.45');
    });

    it('должен принимать десятичные числа с запятой', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '123,45' } });
      expect(input).toHaveValue('123,45');
    });

    it('должен отвергать недопустимые символы', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      // Компонент отвергает строки с недопустимыми символами
      fireEvent.change(input, { target: { value: 'abc123' } });
      expect(input).toHaveValue('0'); // Строка отвергается, остается исходное значение
    });

    it('должен принимать строки только с разрешенными символами', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      // Строка с недопустимыми символами отвергается
      fireEvent.change(input, { target: { value: '123@#$.,- ' } });
      expect(input).toHaveValue('0'); // Строка с запрещенными символами отвергается
      
      // Строка только с разрешенными символами принимается
      fireEvent.change(input, { target: { value: '123.,- ' } });
      expect(input).toHaveValue('123.,- '); // Остаются только разрешенные символы
    });

    it('должен принимать пробелы (для разделения разрядов)', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '1 000' } });
      expect(input).toHaveValue('1 000');
    });
  });

  describe('Обработка blur события', () => {
    it('должен вызывать onChange с числом при blur', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '123.45' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(123.45);
      });
    });

    it('должен нормализовать запятую в точку при blur', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '123,45' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(123.45);
      });
    });

    it('должен удалять пробелы при blur', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: '1 000.50' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(1000.5);
      });
    });

    it('должен возвращать 0 для некорректного ввода', async () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      // Каким-то образом в поле попал некорректный текст
      Object.defineProperty(input, 'value', {
        writable: true,
        value: 'invalid'
      });
      
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(0);
      });
    });
  });

  describe('Синхронизация внешнего значения', () => {
    it('должен обновляться при изменении внешнего значения', () => {
      const { rerender } = render(<Input {...defaultProps} value={100} />);

      expect(screen.getByDisplayValue('100')).toBeInTheDocument();

      rerender(<Input {...defaultProps} value={200} />);

      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    });

    it('должен обрабатывать null и undefined значения', () => {
      const { rerender } = render(<Input {...defaultProps} value={null as any} />);

      expect(screen.getByRole('textbox')).toHaveValue('');

      rerender(<Input {...defaultProps} value={undefined as any} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('должен сохранять введенное значение до blur', () => {
      const onChange = vi.fn();
      render(<Input {...defaultProps} value={100} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      
      // Пользователь начинает вводить новое значение
      fireEvent.change(input, { target: { value: '200' } });
      expect(input).toHaveValue('200');

      // blur не произошел, внутреннее состояние сохраняется
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('должен связывать лейбл с полем ввода', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Тестовое поле');

      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('должен генерировать уникальный ID из лейбла', () => {
      render(<Input label="Закупочная цена" value={0} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'input-закупочная-цена');
    });

    it('должен использовать переданный ID', () => {
      render(<Input {...defaultProps} id="custom-id" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('должен иметь корректный inputMode для мобильных устройств', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('inputMode', 'numeric');
    });
  });

  describe('CSS классы', () => {
    it('должен применять базовые CSS классы', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('input-field');
    });

    it('должен применять переданные CSS классы', () => {
      render(<Input {...defaultProps} className="custom-class" />);

      const container = screen.getByRole('textbox').closest('.space-y-1');
      expect(container).toHaveClass('custom-class');
    });

    it('должен применять классы ошибок', () => {
      render(<Input {...defaultProps} error="Ошибка" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    });

    it('должен применять классы для disabled состояния', () => {
      render(<Input {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    });
  });

  describe('Комплексные сценарии', () => {
    it('должен корректно работать с процентным полем', async () => {
      const onChange = vi.fn();
      render(
        <Input 
          label="Комиссия" 
          value={15.5} 
          onChange={onChange} 
          type="percentage"
          tooltip="Процент комиссии маркетплейса"
        />
      );

      // Проверяем отображение
      expect(screen.getByDisplayValue('15.5')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Информация' })).toBeInTheDocument();

      // Тестируем ввод
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '17,25' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(17.25);
      });
    });

    it('должен корректно работать с валютным полем', async () => {
      const onChange = vi.fn();
      render(
        <Input 
          label="Цена" 
          value={1000} 
          onChange={onChange} 
          type="currency"
          required
          error="Поле обязательно"
        />
      );

      // Проверяем отображение
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByText('₽')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Поле обязательно')).toBeInTheDocument();

      // Проверяем стили ошибки
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });
  });
});
