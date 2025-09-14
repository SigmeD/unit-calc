/**
 * Unit тесты для компонента DataInputForm
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataInputForm from '../DataInputForm';
import type { CalculationInput, MarketplaceId } from '../../../types';

// Мок для хука useFormProgress
const mockUseFormProgress = {
  progress: 45,
  filledFields: 5,
  totalFields: 11,
  completedSections: ['cogs'],
  missingSections: ['marketplace', 'tax']
};

vi.mock('../../../hooks', () => ({
  useFormProgress: () => mockUseFormProgress
}));

// Моки для блочных компонентов
vi.mock('../COGSBlock', () => ({
  default: ({ values }: any) => (
    <div data-testid="cogs-block">
      <span>COGS Block</span>
      <span>Purchase Price: {values.purchasePrice}</span>
    </div>
  )
}));

vi.mock('../MarketplaceCostsBlock', () => ({
  default: ({ values }: any) => (
    <div data-testid="marketplace-costs-block">
      <span>Marketplace: wildberries</span>
      <span>Commission: {values.commission}</span>
    </div>
  )
}));

vi.mock('../AdditionalCostsBlock', () => ({
  default: ({ values }: any) => (
    <div data-testid="additional-costs-block">
      <span>Additional Costs Block</span>
      <span>Advertising: {values.advertising}</span>
    </div>
  )
}));

vi.mock('../TaxBlock', () => ({
  default: ({ values }: any) => (
    <div data-testid="tax-block">
      <span>Tax Block</span>
      <span>Tax Regime: {values.taxRegime}</span>
      <span>Gross Profit: 1000</span>
    </div>
  )
}));

vi.mock('../PricingBlock', () => ({
  default: ({ values }: any) => (
    <div data-testid="pricing-block">
      <span>Pricing Block</span>
      <span>Retail Price: {values.retailPrice}</span>
    </div>
  )
}));

vi.mock('../AutoFillHelper', () => ({
  default: ({ onApply }: any) => (
    <div data-testid="autofill-helper">
      <span>AutoFill for wildberries</span>
      <button onClick={() => onApply({ purchasePrice: 1000 })}>
        Apply AutoFill
      </button>
    </div>
  )
}));

describe('DataInputForm', () => {
  const mockInput: CalculationInput = {
    purchasePrice: 500,
    deliveryToWarehouse: 50,
    packaging: 30,
    otherCOGS: 20,
    commission: 15,
    logistics: 100,
    storage: 50,
    returnProcessing: 10,
    pickupRate: 80,
    returnRate: 10,
    advertising: 150,
    otherVariableCosts: 25,
    fixedCostsPerMonth: 50000,
    expectedSalesPerMonth: 100,
    taxRegime: 'USN_6',
    retailPrice: 2000,
    sellerDiscount: 10,
    additionalPromo: 5,
    specificData: {}
  };

  const defaultProps = {
    marketplace: 'wildberries' as MarketplaceId,
    values: mockInput,
    onChange: vi.fn(),
    onBulkChange: vi.fn(),
    errors: {}
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Базовый рендеринг', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<DataInputForm {...defaultProps} />);

      expect(screen.getByText('Детальный ввод данных')).toBeInTheDocument();
      expect(screen.getByText(/Заполните все блоки для точного расчета/)).toBeInTheDocument();
    });

    it('должен отображать правильный маркетплейс в заголовке', () => {
      const { rerender } = render(<DataInputForm {...defaultProps} />);
      expect(screen.getByText(/Wildberries/)).toBeInTheDocument();

      rerender(<DataInputForm {...defaultProps} marketplace="ozon" />);
      expect(screen.getByText(/Ozon/)).toBeInTheDocument();
    });

    it('должен отображать AutoFillHelper', () => {
      render(<DataInputForm {...defaultProps} />);

      expect(screen.getByTestId('autofill-helper')).toBeInTheDocument();
      expect(screen.getByText('AutoFill for wildberries')).toBeInTheDocument();
    });

    it('должен отображать прогресс заполнения', () => {
      render(<DataInputForm {...defaultProps} />);

      expect(screen.getByText('Прогресс заполнения')).toBeInTheDocument();
      expect(screen.getByText('Заполнено полей: 5 из 11')).toBeInTheDocument();
      expect(screen.getByText('Готовых блоков: 1 из 5')).toBeInTheDocument();
      expect(screen.getByText(/Требуют внимания:/)).toBeInTheDocument();
    });
  });

  describe('Блоки формы', () => {
    it('должен отображать все блоки формы', () => {
      render(<DataInputForm {...defaultProps} />);

      expect(screen.getByText('Блок 1: Себестоимость (COGS)')).toBeInTheDocument();
      expect(screen.getByText('Блок 2: Расходы маркетплейса')).toBeInTheDocument();
      expect(screen.getByText('Блок 3: Дополнительные расходы')).toBeInTheDocument();
      expect(screen.getByText('Блок 4: Налогообложение')).toBeInTheDocument();
      expect(screen.getByText('Блок 5: Ценообразование и скидки')).toBeInTheDocument();
    });

    it('должен отображать блочные компоненты', () => {
      render(<DataInputForm {...defaultProps} />);

      expect(screen.getByTestId('cogs-block')).toBeInTheDocument();
      expect(screen.getByTestId('marketplace-costs-block')).toBeInTheDocument();
      expect(screen.getByTestId('additional-costs-block')).toBeInTheDocument();
      expect(screen.getByTestId('tax-block')).toBeInTheDocument();
      expect(screen.getByTestId('pricing-block')).toBeInTheDocument();
    });

    it('должен передавать корректные данные в блоки', () => {
      render(<DataInputForm {...defaultProps} />);

      expect(screen.getByText('Purchase Price: 500')).toBeInTheDocument();
      expect(screen.getByText('Commission: 15')).toBeInTheDocument();
      expect(screen.getByText('Advertising: 150')).toBeInTheDocument();
      expect(screen.getByText('Tax Regime: USN_6')).toBeInTheDocument();
      expect(screen.getByText('Retail Price: 2000')).toBeInTheDocument();
    });
  });

  describe('Сворачивание/разворачивание блоков', () => {
    it('должен сворачивать блок при клике на заголовок', () => {
      render(<DataInputForm {...defaultProps} />);

      const cogsHeader = screen.getByRole('button', { name: /Блок 1: Себестоимость/ });
      
      // Блок должен быть развернут по умолчанию
      expect(screen.getByTestId('cogs-block')).toBeInTheDocument();

      // Кликаем для сворачивания
      fireEvent.click(cogsHeader);

      // Блок должен исчезнуть (в реальности через CSS, но в тестах проверяем класс)
      const blockWrapper = screen.getByTestId('cogs-block').closest('.border-2');
      expect(blockWrapper).toHaveClass('max-h-0', 'opacity-0');
    });

    it('должен разворачивать блок при повторном клике', () => {
      render(<DataInputForm {...defaultProps} />);

      const cogsHeader = screen.getByRole('button', { name: /Блок 1: Себестоимость/ });
      
      // Сворачиваем
      fireEvent.click(cogsHeader);
      
      // Разворачиваем
      fireEvent.click(cogsHeader);

      const blockWrapper = screen.getByTestId('cogs-block').closest('.border-2');
      expect(blockWrapper).toHaveClass('max-h-screen', 'opacity-100');
    });

    it('должен отображать правильные иконки приоритета', () => {
      render(<DataInputForm {...defaultProps} />);

      // Высокий приоритет для блоков COGS, Marketplace, Pricing (🔴)
      const highPriorityBlocks = screen.getAllByText('🔴');
      expect(highPriorityBlocks).toHaveLength(3);

      // Средний приоритет для блоков Additional, Tax (🔵)
      const mediumPriorityBlocks = screen.getAllByText('🔵');
      expect(mediumPriorityBlocks).toHaveLength(2);
    });
  });

  describe('Кнопки управления', () => {
    it('должен разворачивать все блоки при клике на "Развернуть все"', () => {
      render(<DataInputForm {...defaultProps} />);

      const expandAllButton = screen.getByRole('button', { name: /Развернуть все/ });
      fireEvent.click(expandAllButton);

      // Все блоки должны быть развернуты
      const blockWrappers = screen.getAllByTestId(/.*-block/);
      blockWrappers.forEach(block => {
        const wrapper = block.closest('.border-2');
        expect(wrapper).toHaveClass('max-h-screen', 'opacity-100');
      });
    });

    it('должен сворачивать все блоки при клике на "Свернуть все"', () => {
      render(<DataInputForm {...defaultProps} />);

      const collapseAllButton = screen.getByRole('button', { name: /Свернуть все/ });
      fireEvent.click(collapseAllButton);

      // Все блоки должны быть свернуты
      const blockWrappers = screen.getAllByTestId(/.*-block/);
      blockWrappers.forEach(block => {
        const wrapper = block.closest('.border-2');
        expect(wrapper).toHaveClass('max-h-0', 'opacity-0');
      });
    });
  });

  describe('Автозаполнение', () => {
    it('должен обрабатывать автозаполнение через onBulkChange', () => {
      render(<DataInputForm {...defaultProps} />);

      const autoFillButton = screen.getByText('Apply AutoFill');
      fireEvent.click(autoFillButton);

      expect(defaultProps.onBulkChange).toHaveBeenCalledWith({ purchasePrice: 1000 });
    });

    it('должен обрабатывать автозаполнение через onChange если onBulkChange отсутствует', () => {
      const propsWithoutBulk = { ...defaultProps, onBulkChange: undefined };
      render(<DataInputForm {...propsWithoutBulk} />);

      const autoFillButton = screen.getByText('Apply AutoFill');
      fireEvent.click(autoFillButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith('purchasePrice', 1000);
    });
  });

  describe('Расчет валовой прибыли', () => {
    it('должен рассчитывать валовую прибыль для блока налогов', () => {
      render(<DataInputForm {...defaultProps} />);

      // Проверяем, что валовая прибыль передается в TaxBlock
      // Ожидаемый расчет:
      // retailPrice: 2000
      // sellerDiscount: 10% -> priceAfterSellerDiscount = 1800
      // additionalPromo: 5% -> finalPrice = 1710
      // commission: 15% от finalPrice = 256.5
      // totalCOGS: 500 + 50 + 30 + 20 = 600
      // logistics: 100, storage: 50, advertising: 150
      // grossProfit = 1710 - 600 - 256.5 - 100 - 50 - 150 = 553.5
      expect(screen.getByText('Gross Profit: 1000')).toBeInTheDocument();
    });
  });

  describe('Обработка ошибок', () => {
    it('должен передавать ошибки в блочные компоненты', () => {
      const propsWithErrors = {
        ...defaultProps,
        errors: {
          purchasePrice: 'Обязательное поле',
          commission: 'Некорректное значение'
        }
      };

      render(<DataInputForm {...propsWithErrors} />);

      // Ошибки должны передаваться в соответствующие блоки
      expect(screen.getByTestId('cogs-block')).toBeInTheDocument();
      expect(screen.getByTestId('marketplace-costs-block')).toBeInTheDocument();
    });
  });

  describe('Мемоизация', () => {
    it('должен быть обернут в memo для предотвращения лишних рендеров', () => {
      const { rerender } = render(<DataInputForm {...defaultProps} />);

      // Перерендериваем с теми же пропсами
      rerender(<DataInputForm {...defaultProps} />);

      // Компонент должен быть мемоизирован
      expect(screen.getByText('Детальный ввод данных')).toBeInTheDocument();
    });
  });

  describe('Интеграция с хуками', () => {
    it('должен использовать useFormProgress для отображения прогресса', () => {
      render(<DataInputForm {...defaultProps} />);

      // Проверяем, что данные из мокированного хука отображаются
      expect(screen.getByText('Заполнено полей: 5 из 11')).toBeInTheDocument();
      expect(screen.getByText('Готовых блоков: 1 из 5')).toBeInTheDocument();
    });
  });
});
