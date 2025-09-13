import React, { useState } from 'react';
import { Button, Card } from '../ui';
import { useAutoFill } from '../../hooks';
import type { CalculationInput, MarketplaceId } from '../../types';

interface AutoFillHelperProps {
  marketplace: MarketplaceId;
  currentInput: CalculationInput;
  onApply: (values: Partial<CalculationInput>) => void;
  className?: string;
}

const AutoFillHelper: React.FC<AutoFillHelperProps> = ({
  marketplace,
  currentInput,
  onApply,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'low_price' | 'mid_price' | 'high_price'>('mid_price');
  const [isExpanded, setIsExpanded] = useState(false);

  const { suggestions, applySuggestions, categories } = useAutoFill({
    marketplace,
    priceCategory: selectedCategory,
    currentInput
  });

  const handleApply = () => {
    const values = applySuggestions();
    onApply(values);
    setIsExpanded(false);
  };

  const handleApplyCategory = () => {
    // Применяем только поля, которые еще не заполнены пользователем
    const values = applySuggestions();
    const filteredValues: Partial<CalculationInput> = {};
    
    Object.entries(values).forEach(([key, value]) => {
      const currentValue = currentInput[key as keyof CalculationInput];
      // Применяем значение только если поле пустое или равно 0
      if (currentValue === 0 || currentValue === '' || currentValue === undefined || currentValue === null) {
        filteredValues[key as keyof CalculationInput] = value as any;
      }
    });
    
    onApply(filteredValues);
  };

  const selectedCategoryInfo = categories.find(cat => cat.key === selectedCategory);

  if (!isExpanded) {
    return (
      <div className={`mb-6 ${className}`}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Быстрое заполнение</h3>
                <p className="text-xs text-blue-700">Заполните форму средними значениями для вашей категории товаров</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Настроить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 ${className}`}>
      <Card title="🚀 Быстрое заполнение" subtitle="Заполните форму средними значениями для экономии времени">
        <div className="space-y-4">
          {/* Выбор категории товара */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите категорию товара
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'low_price' | 'mid_price' | 'high_price')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.name} ({category.priceRange}) - {category.description}
                </option>
              ))}
            </select>
          </div>

          {/* Предварительный просмотр значений */}
          {selectedCategoryInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Предварительный просмотр для "{selectedCategoryInfo.name}"
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-gray-700">Себестоимость:</div>
                  <div>Закупочная цена: {suggestions.purchasePrice?.toLocaleString('ru-RU')} ₽</div>
                  <div>Доставка: {suggestions.deliveryToWarehouse?.toLocaleString('ru-RU')} ₽</div>
                  <div>Упаковка: {suggestions.packaging?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-700">Маркетплейс:</div>
                  <div>Логистика: {suggestions.logistics?.toLocaleString('ru-RU')} ₽</div>
                  <div>Хранение: {suggestions.storage?.toLocaleString('ru-RU')} ₽</div>
                  <div>Возвраты: {suggestions.returnProcessing?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-700">Цены и реклама:</div>
                  <div>Розничная цена: {suggestions.retailPrice?.toLocaleString('ru-RU')} ₽</div>
                  <div>Реклама: {suggestions.advertising?.toLocaleString('ru-RU')} ₽</div>
                  <div>Продажи/мес: {suggestions.expectedSalesPerMonth} шт</div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleApply}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Заполнить все поля</span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleApplyCategory}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span>Заполнить только пустые</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Скрыть</span>
            </Button>
          </div>

          {/* Помощь */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Совет:</p>
                <p>Используйте "Заполнить только пустые", чтобы не перезаписать уже введенные вами данные. 
                   Значения основаны на средних показателях для {marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'}.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AutoFillHelper;
