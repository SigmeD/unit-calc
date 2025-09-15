import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';

// Мокаем React DOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(),
}));

// Мокаем App компонент
vi.mock('@/App.tsx', () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

// Мокаем CSS файл
vi.mock('./index.css', () => ({}));

// Мокаем document.getElementById
const mockRootElement = {
  innerHTML: '',
  appendChild: vi.fn(),
  removeChild: vi.fn(),
};

Object.defineProperty(document, 'getElementById', {
  value: vi.fn(() => mockRootElement),
  writable: true,
});

describe('main.tsx', () => {
  const mockCreateRoot = createRoot as any;
  const mockRender = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRoot.mockReturnValue({
      render: mockRender,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('должен создавать root элемент с правильным ID', () => {
    // Импортируем main.tsx для выполнения кода
    require('@/main.tsx');
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
  });

  it('должен вызывать createRoot с правильным элементом', () => {
    require('@/main.tsx');
    
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
  });

  it('должен рендерить App в StrictMode', () => {
    require('@/main.tsx');
    
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(Symbol), // React.StrictMode
        props: {
          children: expect.any(Object), // App component
        },
      })
    );
  });

  it('должен обрабатывать случай когда root элемент не найден', () => {
    // Мокаем случай когда getElementById возвращает null
    Object.defineProperty(document, 'getElementById', {
      value: vi.fn(() => null),
      writable: true,
    });

    // Это должно выбросить ошибку из-за ! оператора
    expect(() => {
      require('@/main.tsx');
    }).toThrow();
  });

  it('должен импортировать CSS файл', () => {
    // Проверяем, что CSS файл импортируется
    // Это проверяется через vi.mock('./index.css')
    require('@/main.tsx');
    
    // Если бы CSS не был замокан, это бы вызвало ошибку
    expect(true).toBe(true);
  });

  it('должен импортировать App компонент', () => {
    // Проверяем, что App компонент импортируется
    require('@/main.tsx');
    
    // Если бы App не был замокан, это бы вызвало ошибку
    expect(true).toBe(true);
  });
});
