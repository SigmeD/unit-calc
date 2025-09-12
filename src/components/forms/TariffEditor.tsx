import React, { useState } from 'react';
import { Card, Input, Button } from '../ui';
import type { Marketplace } from '../../types';

interface TariffEditorProps {
  marketplace: Marketplace;
  currentValues: {
    commission: number;
    logistics: number;
    storage: number;
    advertising: number;
    pickupRate: number;
    returnRate: number;
  };
  onValuesChange: (values: Partial<TariffEditorProps['currentValues']>) => void;
  errors?: Record<string, string>;
  className?: string;
}

export const TariffEditor: React.FC<TariffEditorProps> = ({
  marketplace,
  currentValues,
  onValuesChange,
  errors = {},
  className = ''
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValues, setCustomValues] = useState(currentValues);

  // Применить предустановки маркетплейса
  const applyPresets = () => {
    const presets = {
      commission: marketplace.defaultValues.commission || 15,
      logistics: marketplace.defaultValues.logistics || 0,
      storage: marketplace.defaultValues.storage || 0,
      advertising: marketplace.defaultValues.advertising || 50,
      pickupRate: marketplace.defaultValues.pickupRate || 70,
      returnRate: marketplace.defaultValues.returnRate || 15
    };
    
    setCustomValues(presets);
    onValuesChange(presets);
    setIsCustomMode(false);
  };

  // Применить пользовательские значения
  const applyCustomValues = () => {
    onValuesChange(customValues);
  };

  // Сброс к значениям по умолчанию
  const resetToDefaults = () => {
    const defaults = {
      commission: marketplace.defaultValues.commission || 15,
      logistics: marketplace.defaultValues.logistics || 0,
      storage: marketplace.defaultValues.storage || 0,
      advertising: marketplace.defaultValues.advertising || 50,
      pickupRate: marketplace.defaultValues.pickupRate || 70,
      returnRate: marketplace.defaultValues.returnRate || 15
    };
    
    setCustomValues(defaults);
    onValuesChange(defaults);
  };

  // Получить рекомендации по категории
  // const getCategoryRecommendations = (category: string) => {
  //   const range = marketplace.config.commissionRanges?.[category];
  //   if (range) {
  //     return `Рекомендуемая комиссия для ${category}: ${range.min}% - ${range.max}%`;
  //   }
  //   return null;
  // };

  const updateCustomValue = (field: keyof typeof customValues, value: number) => {
    setCustomValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card
      title="Настройка тарифов"
      description={`Редактирование тарифов для ${marketplace.name}`}
      className={className}
    >
      <div className="space-y-6">
        {/* Переключатель режима */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Режим редактирования</h4>
            <p className="text-sm text-gray-600">
              {isCustomMode 
                ? 'Ручное редактирование значений' 
                : 'Использование предустановок маркетплейса'
              }
            </p>
          </div>
          <Button
            variant={isCustomMode ? 'secondary' : 'primary'}
            onClick={() => setIsCustomMode(!isCustomMode)}
          >
            {isCustomMode ? 'Предустановки' : 'Ручной ввод'}
          </Button>
        </div>

        {isCustomMode ? (
          // Режим ручного редактирования
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Комиссия маркетплейса"
                type="percentage"
                value={customValues.commission}
                onChange={(value) => updateCustomValue('commission', value as number)}
                tooltip="Процент комиссии платформы от цены товара"
                error={errors.commission}
                min={0}
                max={100}
              />

              <Input
                label="Логистика"
                type="currency"
                value={customValues.logistics}
                onChange={(value) => updateCustomValue('logistics', value as number)}
                tooltip="Стоимость доставки до клиента"
                error={errors.logistics}
                min={0}
              />

              <Input
                label="Хранение"
                type="currency"
                value={customValues.storage}
                onChange={(value) => updateCustomValue('storage', value as number)}
                tooltip="Стоимость хранения на складе маркетплейса"
                error={errors.storage}
                min={0}
              />

              <Input
                label="Реклама на продажу"
                type="currency"
                value={customValues.advertising}
                onChange={(value) => updateCustomValue('advertising', value as number)}
                tooltip="Затраты на рекламу в расчете на одну продажу"
                error={errors.advertising}
                min={0}
              />

              <Input
                label="Процент выкупа"
                type="percentage"
                value={customValues.pickupRate}
                onChange={(value) => updateCustomValue('pickupRate', value as number)}
                tooltip="Какой процент заказов доходит до выкупа"
                error={errors.pickupRate}
                min={0}
                max={100}
              />

              <Input
                label="Процент возвратов"
                type="percentage"
                value={customValues.returnRate}
                onChange={(value) => updateCustomValue('returnRate', value as number)}
                tooltip="Процент товаров, которые возвращаются"
                error={errors.returnRate}
                min={0}
                max={100}
              />
            </div>

            {/* Рекомендации по категориям */}
            {marketplace.config.commissionRanges && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">💡 Рекомендации по категориям:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(marketplace.config.commissionRanges).map(([category, range]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-blue-700 capitalize">{category}:</span>
                      <span className="text-blue-800 font-medium">
                        {range.min}% - {range.max}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="primary" onClick={applyCustomValues}>
                Применить изменения
              </Button>
              <Button variant="secondary" onClick={resetToDefaults}>
                Сбросить к умолчаниям
              </Button>
            </div>
          </div>
        ) : (
          // Режим предустановок
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-3">
                Текущие предустановки для {marketplace.name}:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Комиссия:</span>
                  <span className="text-green-800 font-medium">{currentValues.commission}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Логистика:</span>
                  <span className="text-green-800 font-medium">₽{currentValues.logistics}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Хранение:</span>
                  <span className="text-green-800 font-medium">₽{currentValues.storage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Реклама:</span>
                  <span className="text-green-800 font-medium">₽{currentValues.advertising}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">% выкупа:</span>
                  <span className="text-green-800 font-medium">{currentValues.pickupRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">% возвратов:</span>
                  <span className="text-green-800 font-medium">{currentValues.returnRate}%</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="primary" onClick={applyPresets}>
                Обновить предустановки
              </Button>
            </div>
          </div>
        )}

        {/* Общие ошибки */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">⚠️ {errors.general}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TariffEditor;
