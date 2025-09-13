/**
 * Unit тесты для компонента Tooltip
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers(); // Используем реальные таймеры для стабильности
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Базовый рендеринг', () => {
    it('должен рендериться с дочерним элементом', () => {
      render(
        <Tooltip content="Тест tooltip">
          <button>Кнопка</button>
        </Tooltip>
      );

      expect(screen.getByRole('button', { name: 'Кнопка' })).toBeInTheDocument();
    });

    it('должен скрывать tooltip по умолчанию', () => {
      render(
        <Tooltip content="Тест tooltip">
          <button>Кнопка</button>
        </Tooltip>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Показ/скрытие tooltip', () => {
    it('должен показывать tooltip при наведении мыши', async () => {
      render(
        <Tooltip content="Тест tooltip" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      // Без задержки tooltip должен появиться сразу
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).not.toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByText('Тест tooltip')).toBeInTheDocument();
      });
    });

    it('должен скрывать tooltip при уходе мыши', async () => {
      render(
        <Tooltip content="Тест tooltip" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('должен показывать tooltip при фокусе', async () => {
      render(
        <Tooltip content="Тест tooltip" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.focus(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('должен скрывать tooltip при потере фокуса', async () => {
      render(
        <Tooltip content="Тест tooltip" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.focus(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.blur(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Задержка отображения', () => {
    it('должен применять задержку перед показом tooltip', async () => {
      vi.useFakeTimers(); // Включаем fake timers только для этого теста
      
      render(
        <Tooltip content="Тест tooltip" delay={100}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      // Tooltip не должен появиться сразу
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Продвигаем время на 50ms - tooltip все еще не должен быть виден
      vi.advanceTimersByTime(50);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Продвигаем время до 100ms - tooltip должен появиться
      vi.advanceTimersByTime(50);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });

    it('должен отменять показ tooltip при быстром уходе мыши', async () => {
      vi.useFakeTimers();
      
      render(
        <Tooltip content="Тест tooltip" delay={100}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      // Быстро убираем мышь до истечения задержки
      vi.advanceTimersByTime(50);
      fireEvent.mouseLeave(button);
      
      // Продвигаем время дальше - tooltip не должен показаться
      vi.advanceTimersByTime(100);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('Позиционирование', () => {
    it('должен применять позицию top по умолчанию', async () => {
      render(
        <Tooltip content="Тест tooltip" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('bottom-full');
      });
    });

    it('должен применять позицию bottom', async () => {
      render(
        <Tooltip content="Тест tooltip" placement="bottom" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('top-full');
      });
    });

    it('должен применять позицию left', async () => {
      render(
        <Tooltip content="Тест tooltip" placement="left" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('right-full');
      });
    });

    it('должен применять позицию right', async () => {
      render(
        <Tooltip content="Тест tooltip" placement="right" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('left-full');
      });
    });
  });

  describe('Отключение', () => {
    it('не должен показывать tooltip когда disabled=true', async () => {
      render(
        <Tooltip content="Тест tooltip" disabled delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      // Ждем немного и проверяем, что tooltip не появился
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Кастомные стили', () => {
    it('должен применять пользовательские CSS классы', () => {
      const { container } = render(
        <Tooltip content="Тест tooltip" className="custom-tooltip">
          <button>Кнопка</button>
        </Tooltip>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-tooltip');
    });
  });

  describe('Сложный контент', () => {
    it('должен отображать React элементы в качестве контента', async () => {
      const complexContent = (
        <div>
          <strong>Заголовок</strong>
          <p>Описание</p>
        </div>
      );

      render(
        <Tooltip content={complexContent} delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Заголовок')).toBeInTheDocument();
        expect(screen.getByText('Описание')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('должен иметь правильные ARIA атрибуты', async () => {
      render(
        <Tooltip content="Тест tooltip" delay={0}>
          <button>Кнопка</button>
        </Tooltip>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('aria-hidden', 'false');
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });
});
