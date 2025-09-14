/**
 * Unit тесты для компонента ProgressBar
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  describe('Базовый рендеринг', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<ProgressBar progress={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('должен отображать правильное значение прогресса', () => {
      render(<ProgressBar progress={75} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('должен иметь правильную ширину полосы прогресса', () => {
      render(<ProgressBar progress={60} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar.style.width).toBe('60%');
    });
  });

  describe('Нормализация значений прогресса', () => {
    it('должен ограничивать прогресс максимумом 100', () => {
      render(<ProgressBar progress={150} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      expect(progressBar.style.width).toBe('100%');
    });

    it('должен ограничивать прогресс минимумом 0', () => {
      render(<ProgressBar progress={-20} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar.style.width).toBe('0%');
    });

    it('должен округлять дробные значения в процентах', () => {
      render(<ProgressBar progress={33.333} />);

      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('Отображение процентов', () => {
    it('должен показывать проценты по умолчанию', () => {
      render(<ProgressBar progress={42} />);

      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('должен скрывать проценты когда showPercentage=false', () => {
      render(<ProgressBar progress={42} showPercentage={false} />);

      expect(screen.queryByText('42%')).not.toBeInTheDocument();
    });
  });

  describe('Лейбл', () => {
    it('должен отображать лейбл', () => {
      render(<ProgressBar progress={50} label="Загрузка файла" />);

      expect(screen.getByText('Загрузка файла')).toBeInTheDocument();
    });

    it('должен работать без лейбла', () => {
      render(<ProgressBar progress={50} />);

      // Проверяем, что progressbar все равно работает
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('должен использовать лейбл в aria-label если он есть', () => {
      render(<ProgressBar progress={50} label="Обработка данных" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Обработка данных');
    });

    it('должен использовать дефолтный aria-label если лейбла нет', () => {
      render(<ProgressBar progress={75} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress: 75%');
    });
  });

  describe('Размеры', () => {
    it('должен применять размер md по умолчанию', () => {
      const { container } = render(<ProgressBar progress={50} />);
      
      const progressBar = container.querySelector('.h-2\\.5');
      expect(progressBar).toBeInTheDocument();
    });

    it('должен применять размер sm', () => {
      const { container } = render(<ProgressBar progress={50} size="sm" />);
      
      const progressBar = container.querySelector('.h-1\\.5');
      expect(progressBar).toBeInTheDocument();
    });

    it('должен применять размер lg', () => {
      const { container } = render(<ProgressBar progress={50} size="lg" />);
      
      const progressBar = container.querySelector('.h-4');
      expect(progressBar).toBeInTheDocument();
    });

    it('должен применять соответствующий размер текста', () => {
      const { rerender } = render(<ProgressBar progress={50} label="Тест" size="sm" />);
      expect(screen.getByText('Тест')).toHaveClass('text-xs');

      rerender(<ProgressBar progress={50} label="Тест" size="md" />);
      expect(screen.getByText('Тест')).toHaveClass('text-sm');

      rerender(<ProgressBar progress={50} label="Тест" size="lg" />);
      expect(screen.getByText('Тест')).toHaveClass('text-base');
    });
  });

  describe('Цвета', () => {
    it('должен применять синий цвет по умолчанию', () => {
      render(<ProgressBar progress={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-blue-600');
    });

    it('должен применять зеленый цвет', () => {
      render(<ProgressBar progress={50} color="green" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-green-600');
    });

    it('должен применять желтый цвет', () => {
      render(<ProgressBar progress={50} color="yellow" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('должен применять красный цвет', () => {
      render(<ProgressBar progress={50} color="red" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-red-600');
    });

    it('должен применять серый цвет', () => {
      render(<ProgressBar progress={50} color="gray" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-gray-600');
    });
  });

  describe('Анимация', () => {
    it('должен применять анимацию когда animated=true', () => {
      render(<ProgressBar progress={50} animated />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('animate-pulse');
    });

    it('не должен применять анимацию по умолчанию', () => {
      render(<ProgressBar progress={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).not.toHaveClass('animate-pulse');
    });
  });

  describe('Пользовательские CSS классы', () => {
    it('должен применять пользовательские CSS классы', () => {
      const { container } = render(
        <ProgressBar progress={50} className="custom-progress" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-progress');
    });
  });

  describe('Переходы и анимации', () => {
    it('должен иметь CSS классы для плавных переходов', () => {
      render(<ProgressBar progress={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('transition-all', 'duration-500', 'ease-out');
    });
  });

  describe('Комбинированные тесты', () => {
    it('должен корректно работать со всеми пропсами одновременно', () => {
      const { container } = render(
        <ProgressBar
          progress={85}
          label="Загрузка проекта"
          showPercentage={true}
          color="green"
          size="lg"
          animated={true}
          className="custom-progress"
        />
      );

      // Проверяем лейбл
      expect(screen.getByText('Загрузка проекта')).toBeInTheDocument();
      
      // Проверяем проценты
      expect(screen.getByText('85%')).toBeInTheDocument();
      
      // Проверяем progressbar
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '85');
      expect(progressBar).toHaveClass('bg-green-600', 'animate-pulse');
      expect(progressBar.style.width).toBe('85%');
      
      // Проверяем кастомный класс
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-progress');
    });
  });

  describe('Крайние случаи', () => {
    it('должен корректно обрабатывать нулевой прогресс', () => {
      render(<ProgressBar progress={0} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar.style.width).toBe('0%');
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('должен корректно обрабатывать 100% прогресс', () => {
      render(<ProgressBar progress={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      expect(progressBar.style.width).toBe('100%');
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь правильные ARIA атрибуты', () => {
      render(<ProgressBar progress={60} label="Обработка" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Обработка');
    });
  });
});
