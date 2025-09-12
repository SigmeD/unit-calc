import React, { useState } from 'react';
import type { Marketplace, FieldConfig } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface MarketplaceSpecificFieldsProps {
  marketplace: Marketplace;
  errors: Record<string, string>;
}

const MarketplaceSpecificFields: React.FC<MarketplaceSpecificFieldsProps> = ({
  marketplace,
  errors
}) => {
  const [inputData, setInputData] = useState({
    purchasePrice: 0,
    commission: marketplace.defaultValues.commission || 15,
    pickupRate: marketplace.defaultValues.pickupRate || 70,
    returnRate: marketplace.defaultValues.returnRate || 15,
    logistics: marketplace.defaultValues.logistics || 0,
    advertising: marketplace.defaultValues.advertising || 50,
    retailPrice: 1000,
    sellerDiscount: 0,
    additionalPromo: 0,
    ...marketplace.defaultValues
  });

  const handleInputChange = (field: string, value: number | string) => {
    setInputData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderSpecificField = (field: FieldConfig) => {
    const value = inputData[field.id as keyof typeof inputData] || 0;
    const error = errors[field.id];

    switch (field.type) {
      case 'percentage':
        return (
          <Input
            key={field.id}
            label={field.name}
            value={typeof value === 'number' ? value : 0}
            onChange={(val) => handleInputChange(field.id, val)}
            type="percentage"
            tooltip={field.tooltip}
            error={error}
            min={0}
            max={100}
          />
        );
      case 'currency':
        return (
          <Input
            key={field.id}
            label={field.name}
            value={typeof value === 'number' ? value : 0}
            onChange={(val) => handleInputChange(field.id, val)}
            type="currency"
            tooltip={field.tooltip}
            error={error}
            min={0}
          />
        );
      case 'select':
        return (
          <Select
            key={field.id}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => handleInputChange(field.id, val as string)}
            options={field.options || []}
            tooltip={field.tooltip}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card title="Основные параметры">
      <div className="space-y-6">
        {/* Базовые поля */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Закупочная цена (₽)"
            value={inputData.purchasePrice}
            onChange={(val) => handleInputChange('purchasePrice', val)}
            type="currency"
            placeholder="1000"
            error={errors.purchasePrice}
            required
          />
          
          <Input
            label="Комиссия (%)"
            value={inputData.commission}
            onChange={(val) => handleInputChange('commission', val)}
            type="percentage"
            error={errors.commission}
            required
          />
          
          <Input
            label="Процент выкупа (%)"
            value={inputData.pickupRate}
            onChange={(val) => handleInputChange('pickupRate', val)}
            type="percentage"
            error={errors.pickupRate}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Процент возвратов (%)"
            value={inputData.returnRate}
            onChange={(val) => handleInputChange('returnRate', val)}
            type="percentage"
            error={errors.returnRate}
            required
          />
          
          <Input
            label="Логистика (₽)"
            value={inputData.logistics}
            onChange={(val) => handleInputChange('logistics', val)}
            type="currency"
            error={errors.logistics}
          />
          
          <Input
            label="Реклама (₽)"
            value={inputData.advertising}
            onChange={(val) => handleInputChange('advertising', val)}
            type="currency"
            error={errors.advertising}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Розничная цена (₽)"
            value={inputData.retailPrice}
            onChange={(val) => handleInputChange('retailPrice', val)}
            type="currency"
            error={errors.retailPrice}
            required
          />
          
          <Input
            label="Скидка продавца (%)"
            value={inputData.sellerDiscount}
            onChange={(val) => handleInputChange('sellerDiscount', val)}
            type="percentage"
            error={errors.sellerDiscount}
          />
          
          <Input
            label="Дополнительное промо (%)"
            value={inputData.additionalPromo}
            onChange={(val) => handleInputChange('additionalPromo', val)}
            type="percentage"
            error={errors.additionalPromo}
          />
        </div>

        {/* Специфичные поля маркетплейса */}
        {marketplace.config.specificFields && marketplace.config.specificFields.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Специфичные поля {marketplace.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketplace.config.specificFields.map(renderSpecificField)}
            </div>
          </div>
        )}

        {/* Подсказка */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 Поля автоматически заполнены типичными значениями для {marketplace.name}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MarketplaceSpecificFields;