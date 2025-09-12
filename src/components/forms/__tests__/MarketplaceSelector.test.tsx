import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarketplaceSelector from '../MarketplaceSelector';
import type { Marketplace } from '../../../types';

const mockMarketplaces: Marketplace[] = [
  {
    id: 'wildberries',
    name: 'Wildberries',
    config: {
      defaultCommission: 17,
      logisticOptions: [],
      specificFields: [],
      taxRegimes: ['USN_6', 'USN_15'],
      commissionRanges: {}
    },
    defaultValues: {
      commission: 17,
      logistics: 0,
      pickupRate: 70,
      returnRate: 15
    }
  },
  {
    id: 'ozon',
    name: 'Ozon',
    config: {
      defaultCommission: 15,
      logisticOptions: [],
      specificFields: [],
      taxRegimes: ['USN_6', 'USN_15'],
      commissionRanges: {}
    },
    defaultValues: {
      commission: 15,
      logistics: 35,
      pickupRate: 65,
      returnRate: 20
    }
  }
];

describe('MarketplaceSelector', () => {
  it('renders marketplace selector', () => {
    const mockOnChange = vi.fn();
    
    render(
      <MarketplaceSelector
        marketplaces={mockMarketplaces}
        selectedMarketplace={null}
        onMarketplaceChange={mockOnChange}
        errors={{}}
      />
    );
    
    expect(screen.getByText('Выбор маркетплейса')).toBeInTheDocument();
    expect(screen.getByText('Выберите платформу')).toBeInTheDocument();
  });

  it('shows marketplace options', () => {
    const mockOnChange = vi.fn();
    
    render(
      <MarketplaceSelector
        marketplaces={mockMarketplaces}
        selectedMarketplace={null}
        onMarketplaceChange={mockOnChange}
        errors={{}}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Проверяем наличие опций
    expect(screen.getByText('Wildberries')).toBeInTheDocument();
    expect(screen.getByText('Ozon')).toBeInTheDocument();
  });

  it('calls onMarketplaceChange when selection changes', () => {
    const mockOnChange = vi.fn();
    
    render(
      <MarketplaceSelector
        marketplaces={mockMarketplaces}
        selectedMarketplace={null}
        onMarketplaceChange={mockOnChange}
        errors={{}}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'wildberries' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('wildberries');
  });

  it('shows selected marketplace info', () => {
    const mockOnChange = vi.fn();
    
    render(
      <MarketplaceSelector
        marketplaces={mockMarketplaces}
        selectedMarketplace="wildberries"
        onMarketplaceChange={mockOnChange}
        errors={{}}
      />
    );
    
    expect(screen.getByText('✅ Выбран: Wildberries')).toBeInTheDocument();
    expect(screen.getByText('Комиссия по умолчанию: 17%')).toBeInTheDocument();
    expect(screen.getByText('Типичный процент выкупа: 70%')).toBeInTheDocument();
  });

  it('displays errors when provided', () => {
    const mockOnChange = vi.fn();
    const errors = { general: 'Маркетплейс не выбран' };
    
    render(
      <MarketplaceSelector
        marketplaces={mockMarketplaces}
        selectedMarketplace={null}
        onMarketplaceChange={mockOnChange}
        errors={errors}
      />
    );
    
    expect(screen.getByText('Маркетплейс не выбран')).toBeInTheDocument();
  });
});
