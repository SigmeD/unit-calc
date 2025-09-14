/**
 * Unit тесты для компонента Select
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Select from '../Select';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'Опция 1' },
    { value: 'option2', label: 'Опция 2' },
    { value: 'option3', label: 'Опция 3' }
  ];

  describe('Базовое рендеринг', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(
        <Select
          label="Тестовый select"
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByLabelText('Тестовый select')).toBeInTheDocument();
    });

    it('должен отображать label', () => {
      render(
        <Select
          label="Выберите опцию"
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByText('Выберите опцию')).toBeInTheDocument();
      expect(screen.getByLabelText('Выберите опцию')).toBeInTheDocument();
    });

    it('должен отображать placeholder', () => {
      render(
        <Select
          label="Выбор"
          placeholder="Выберите значение"
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByText('Выберите значение')).toBeInTheDocument();
    });

    it('должен отображать все опции', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
      );
      
      mockOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('Выбор значения', () => {
    it('должен отображать выбранное значение', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value="option2"
          onChange={() => {}}
        />
      );
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('должен вызывать onChange при изменении значения', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={handleChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option2');
      
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('должен работать как controlled компонент', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      const { rerender } = render(
        <Select
          label="Выбор"
          options={mockOptions}
          value="option1"
          onChange={handleChange}
        />
      );
      
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option1');
      
      await user.selectOptions(select, 'option2');
      expect(handleChange).toHaveBeenCalledWith('option2');
      
      // Симулируем обновление от родителя
      rerender(
        <Select
          label="Выбор"
          options={mockOptions}
          value="option2"
          onChange={handleChange}
        />
      );
      
      expect(select.value).toBe('option2');
    });
  });

  describe('Валидация и ошибки', () => {
    it('должен отображать сообщение об ошибке', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          error="Это поле обязательно"
        />
      );
      
      expect(screen.getByText('Это поле обязательно')).toBeInTheDocument();
    });

    it('должен применять стили ошибки', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          error="Ошибка валидации"
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-500');
    });

    it('должен показывать required индикатор', () => {
      render(
        <Select
          label="Обязательное поле"
          options={mockOptions}
          value=""
          onChange={() => {}}
          required
        />
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Состояния', () => {
    it('должен быть disabled', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          disabled
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('должен применять стили disabled', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          disabled
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    });
  });

  describe('Опции с disabled', () => {
    const optionsWithDisabled = [
      { value: 'option1', label: 'Опция 1' },
      { value: 'option2', label: 'Опция 2', disabled: true },
      { value: 'option3', label: 'Опция 3' }
    ];

    it('должен отображать disabled опции', () => {
      render(
        <Select
          label="Выбор"
          options={optionsWithDisabled}
          value=""
          onChange={() => {}}
        />
      );
      
      const disabledOption = screen.getByRole('option', { name: 'Опция 2' });
      expect(disabledOption).toBeDisabled();
    });
  });

  describe('Tooltip', () => {
    it('должен отображать tooltip', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          tooltip="Подсказка для пользователя"
        />
      );
      
      expect(screen.getByLabelText('Информация')).toBeInTheDocument();
    });
  });

  describe('ID и Name', () => {
    it('должен устанавливать кастомный ID', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          id="custom-select-id"
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'custom-select-id');
    });

    it('должен генерировать ID из label', () => {
      render(
        <Select
          label="Моя категория товара"
          options={mockOptions}
          value=""
          onChange={() => {}}
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'select-моя-категория-товара');
    });

    it('должен устанавливать name атрибут', () => {
      render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          name="category"
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('name', 'category');
    });
  });

  describe('Числовые значения', () => {
    const numericOptions = [
      { value: 1, label: 'Один' },
      { value: 2, label: 'Два' },
      { value: 3, label: 'Три' }
    ];

    it('должен работать с числовыми значениями', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Select
          label="Числа"
          options={numericOptions}
          value={1}
          onChange={handleChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '2');
      
      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('должен преобразовывать строки в числа', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Select
          label="Числа"
          options={[{ value: '123', label: 'Сто двадцать три' }]}
          value=""
          onChange={handleChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '123');
      
      expect(handleChange).toHaveBeenCalledWith(123);
    });
  });

  describe('CSS классы', () => {
    it('должен поддерживать кастомные CSS классы', () => {
      const { container } = render(
        <Select
          label="Выбор"
          options={mockOptions}
          value=""
          onChange={() => {}}
          className="custom-select-class"
        />
      );
      
      const selectContainer = container.firstChild as HTMLElement;
      expect(selectContainer).toHaveClass('custom-select-class');
    });
  });

  describe('Пограничные случаи', () => {
    it('должен обрабатывать пустой массив опций', () => {
      render(
        <Select
          label="Выбор"
          options={[]}
          value=""
          onChange={() => {}}
        />
      );
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('должен обрабатывать очень длинные списки опций', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Опция ${i}`
      }));
      
      render(
        <Select
          label="Выбор"
          options={manyOptions}
          value=""
          onChange={() => {}}
        />
      );
      
      expect(screen.getByText('Опция 0')).toBeInTheDocument();
      expect(screen.getByText('Опция 99')).toBeInTheDocument();
    });
  });
});
