/**
 * Unit тесты для компонента Card
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card, { CardHeader, CardBody, CardFooter } from '../Card';

describe('Card', () => {
  describe('Базовый рендеринг', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Card>Тестовый контент</Card>);
      
      expect(screen.getByText('Тестовый контент')).toBeInTheDocument();
    });

    it('должен применять базовые CSS классы', () => {
      const { container } = render(<Card>Контент</Card>);
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('card', 'p-6');
    });
  });

  describe('Заголовок и описание', () => {
    it('должен отображать заголовок', () => {
      render(
        <Card title="Тестовый заголовок">
          Контент карточки
        </Card>
      );
      
      expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
      expect(screen.getByText('Контент карточки')).toBeInTheDocument();
    });

    it('должен отображать subtitle', () => {
      render(
        <Card title="Заголовок" subtitle="Подзаголовок">
          Контент
        </Card>
      );
      
      expect(screen.getByText('Заголовок')).toBeInTheDocument();
      expect(screen.getByText('Подзаголовок')).toBeInTheDocument();
      expect(screen.getByText('Контент')).toBeInTheDocument();
    });

    it('должен отображать описание', () => {
      render(
        <Card title="Заголовок" description="Описание карточки">
          Контент
        </Card>
      );
      
      expect(screen.getByText('Заголовок')).toBeInTheDocument();
      expect(screen.getByText('Описание карточки')).toBeInTheDocument();
      expect(screen.getByText('Контент')).toBeInTheDocument();
    });

    it('должен работать без заголовка', () => {
      render(<Card>Только контент</Card>);
      
      expect(screen.getByText('Только контент')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Padding размеры', () => {
    it('должен применять размер sm', () => {
      const { container } = render(
        <Card padding="sm">Контент</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('p-4');
    });

    it('должен применять размер lg', () => {
      const { container } = render(
        <Card padding="lg">Контент</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('p-8');
    });

    it('должен применять размер по умолчанию (md)', () => {
      const { container } = render(<Card>Контент</Card>);
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('p-6');
    });
  });

  describe('Hover эффект', () => {
    it('должен применять hover эффект', () => {
      const { container } = render(
        <Card hover>Контент</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-pointer');
    });

    it('не должен применять hover эффект по умолчанию', () => {
      const { container } = render(<Card>Контент</Card>);
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).not.toHaveClass('hover:shadow-md');
    });
  });

  describe('Кастомизация', () => {
    it('должен поддерживать кастомные CSS классы', () => {
      const { container } = render(
        <Card className="custom-class">Контент</Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('custom-class');
      expect(cardElement).toHaveClass('card'); // Базовые классы должны сохраниться
    });
  });

  describe('Accessibility', () => {
    it('должен устанавливать правильную роль для заголовка', () => {
      render(
        <Card title="Заголовок карточки">
          Контент
        </Card>
      );
      
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Заголовок карточки');
    });
  });

  describe('Контент', () => {
    it('должен рендерить React элементы как children', () => {
      render(
        <Card>
          <div data-testid="child-element">Дочерний элемент</div>
          <p>Параграф текста</p>
        </Card>
      );
      
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
      expect(screen.getByText('Параграф текста')).toBeInTheDocument();
    });

    it('должен рендерить сложную структуру контента', () => {
      render(
        <Card title="Сложная карточка">
          <div>
            <h4>Подзаголовок</h4>
            <ul>
              <li>Элемент 1</li>
              <li>Элемент 2</li>
            </ul>
            <button>Кнопка действия</button>
          </div>
        </Card>
      );
      
      expect(screen.getByText('Сложная карточка')).toBeInTheDocument();
      expect(screen.getByText('Подзаголовок')).toBeInTheDocument();
      expect(screen.getByText('Элемент 1')).toBeInTheDocument();
      expect(screen.getByText('Элемент 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Кнопка действия' })).toBeInTheDocument();
    });
  });

  describe('Комбинации свойств', () => {
    it('должен корректно комбинировать все свойства', () => {
      const { container } = render(
        <Card
          title="Полная карточка"
          subtitle="Подзаголовок"
          description="Описание с всеми опциями"
          padding="lg"
          hover
          className="extra-class"
        >
          Контент карточки
        </Card>
      );
      
      expect(screen.getByText('Полная карточка')).toBeInTheDocument();
      expect(screen.getByText('Подзаголовок')).toBeInTheDocument();
      expect(screen.getByText('Описание с всеми опциями')).toBeInTheDocument();
      expect(screen.getByText('Контент карточки')).toBeInTheDocument();
      
      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('card');
      expect(cardElement).toHaveClass('p-8');
      expect(cardElement).toHaveClass('hover:shadow-md');
      expect(cardElement).toHaveClass('extra-class');
    });
  });
});

describe('CardHeader', () => {
  it('должен рендериться с контентом', () => {
    render(
      <CardHeader>
        <h2>Заголовок</h2>
      </CardHeader>
    );
    
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
  });

  it('должен применять стили границы', () => {
    const { container } = render(
      <CardHeader>Контент</CardHeader>
    );
    
    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass('border-b', 'border-gray-200', 'pb-4', 'mb-4');
  });
});

describe('CardBody', () => {
  it('должен рендериться с контентом', () => {
    render(
      <CardBody>
        <p>Тело карточки</p>
      </CardBody>
    );
    
    expect(screen.getByText('Тело карточки')).toBeInTheDocument();
  });

  it('должен поддерживать кастомные классы', () => {
    const { container } = render(
      <CardBody className="custom-body">Контент</CardBody>
    );
    
    const bodyElement = container.firstChild as HTMLElement;
    expect(bodyElement).toHaveClass('custom-body');
  });
});

describe('CardFooter', () => {
  it('должен рендериться с контентом', () => {
    render(
      <CardFooter>
        <button>Сохранить</button>
      </CardFooter>
    );
    
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
  });

  it('должен применять стили границы', () => {
    const { container } = render(
      <CardFooter>Контент</CardFooter>
    );
    
    const footerElement = container.firstChild as HTMLElement;
    expect(footerElement).toHaveClass('border-t', 'border-gray-200', 'pt-4', 'mt-4');
  });
});
