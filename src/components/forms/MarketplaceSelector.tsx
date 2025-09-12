import React from 'react';
import type { MarketplaceId } from '../../types';
import Card from '../ui/Card';
import Select from '../ui/Select';

interface SimpleMarketplace {
  id: MarketplaceId;
  name: string;
  defaultValues: {
    commission: number;
    pickupRate: number;
    [key: string]: string | number;
  };
}

interface MarketplaceSelectorProps {
  marketplaces: SimpleMarketplace[];
  selectedMarketplace: MarketplaceId | null;
  onMarketplaceChange: (marketplaceId: MarketplaceId) => void;
  errors: Record<string, string>;
}

const MarketplaceSelector: React.FC<MarketplaceSelectorProps> = ({
  marketplaces,
  selectedMarketplace,
  onMarketplaceChange,
  errors
}) => {
  const marketplaceOptions = marketplaces.map(mp => ({
    value: mp.id,
    label: mp.name
  }));

  const selectedMarketplaceData = selectedMarketplace 
    ? marketplaces.find(mp => mp.id === selectedMarketplace)
    : null;

  return (
    <Card title="Выбор маркетплейса">
      <div className="space-y-4">
        <Select
          label="Выберите платформу"
          value={selectedMarketplace || ''}
          onChange={(value) => onMarketplaceChange(value as MarketplaceId)}
          options={marketplaceOptions}
          placeholder="Выберите маркетплейс"
          error={errors.general}
          required
        />

        {selectedMarketplaceData && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">
              ✅ Выбран: {selectedMarketplaceData.name}
            </h3>
            <p className="text-sm text-green-700">
              {selectedMarketplaceData.id === 'wildberries' 
                ? 'Крупнейший российский маркетплейс' 
                : 'Быстрорастущая онлайн-платформа'}
            </p>
            <div className="mt-2 text-xs text-green-600">
              <p>Комиссия по умолчанию: {selectedMarketplaceData.defaultValues.commission}%</p>
              <p>Типичный процент выкупа: {selectedMarketplaceData.defaultValues.pickupRate}%</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MarketplaceSelector;