/**
 * Unit тесты для компонента LoadingSpinner
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Базовый рендеринг', () => {
    it('должен рендериться с базовыми настройками', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('должен отображать SVG спиннер', () => {
      render(<LoadingSpinner />);

      const svg = screen.getByRole('status');
      expect(svg).toBeInTheDocument();
      expect(svg.tagName).toBe('svg');
    });
  });

  describe('Размеры', () => {
    it('должен применять размер sm', () => {
      render(<LoadingSpinner size="sm" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('должен применять размер md по умолчанию', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('должен применять размер lg', () => {
      render(<LoadingSpinner size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('должен применять размер xl', () => {
      render(<LoadingSpinner size="xl" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Цвета', () => {
    it('должен применять синий цвет по умолчанию', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-blue-600');
    });

    it('должен применять серый цвет', () => {
      render(<LoadingSpinner color="gray" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-gray-600');
    });

    it('должен применять белый цвет', () => {
      render(<LoadingSpinner color="white" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-white');
    });

    it('должен применять зеленый цвет', () => {
      render(<LoadingSpinner color="green" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-green-600');
    });
  });

  describe('Текст загрузки', () => {
    it('должен отображать текст загрузки', () => {
      render(<LoadingSpinner text="Загрузка данных..." />);

      expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
    });

    it('должен скрывать текст если он не указан', () => {
      render(<LoadingSpinner />);

      // Должен быть только спиннер, без текста
      const container = screen.getByRole('status').parentElement;
      expect(container?.textContent?.trim()).toBe('');
    });

    it('должен применять правильный размер текста для разных размеров спиннера', () => {
      const { rerender } = render(<LoadingSpinner size="sm" text="Загрузка" />);
      expect(screen.getByText('Загрузка')).toHaveClass('text-xs');

      rerender(<LoadingSpinner size="md" text="Загрузка" />);
      expect(screen.getByText('Загрузка')).toHaveClass('text-sm');

      rerender(<LoadingSpinner size="lg" text="Загрузка" />);
      expect(screen.getByText('Загрузка')).toHaveClass('text-base');

      rerender(<LoadingSpinner size="xl" text="Загрузка" />);
      expect(screen.getByText('Загрузка')).toHaveClass('text-lg');
    });
  });

  describe('Режим inline', () => {
    it('должен отображаться в inline режиме', () => {
      const { container } = render(
        <LoadingSpinner inline text="Загрузка..." />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('inline-flex');
    });

    it('должен отображать спиннер и текст в одной строке в inline режиме', () => {
      render(<LoadingSpinner inline text="Загрузка..." />);

      const spinner = screen.getByRole('status');
      const text = screen.getByText('Загрузка...');
      
      expect(spinner).toBeInTheDocument();
      expect(text).toBeInTheDocument();

      // Проверяем, что они в одном контейнере с inline-flex
      const container = spinner.parentElement;
      expect(container).toHaveClass('inline-flex');
      expect(container).toContainElement(text);
    });

    it('должен отображаться в блочном режиме по умолчанию', () => {
      const { container } = render(
        <LoadingSpinner text="Загрузка..." />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col');
      expect(wrapper).not.toHaveClass('inline-flex');
    });
  });

  describe('Пользовательские CSS классы', () => {
    it('должен применять пользовательские CSS классы', () => {
      const { container } = render(
        <LoadingSpinner className="custom-spinner" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-spinner');
    });

    it('должен применять пользовательские классы в inline режиме', () => {
      const { container } = render(
        <LoadingSpinner inline className="custom-inline-spinner" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-inline-spinner');
    });
  });

  describe('Анимация', () => {
    it('должен иметь CSS класс анимации', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Комбинированные тесты', () => {
    it('должен корректно работать со всеми пропсами одновременно', () => {
      const { container } = render(
        <LoadingSpinner
          size="lg"
          color="green"
          text="Сохранение..."
          inline
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      const spinner = screen.getByRole('status');
      const text = screen.getByText('Сохранение...');

      // Проверяем размер и цвет спиннера
      expect(spinner).toHaveClass('w-8', 'h-8', 'text-green-600');
      
      // Проверяем текст
      expect(text).toHaveClass('text-base', 'text-green-600');
      
      // Проверяем inline режим
      expect(wrapper).toHaveClass('inline-flex');
      
      // Проверяем кастомный класс
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь правильные ARIA атрибуты', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('должен иметь правильную роль', () => {
      render(<LoadingSpinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
