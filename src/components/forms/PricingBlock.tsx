import React from 'react';
import { Input, Card } from '../ui';
import type { CalculationInput, MarketplaceId } from '../../types';

interface PricingBlockProps {
  values: Pick<CalculationInput, 'retailPrice' | 'sellerDiscount' | 'additionalPromo'>;
  onChange: (field: string, value: number) => void;
  errors: Record<string, string>;
  marketplace: MarketplaceId;
}

const PricingBlock: React.FC<PricingBlockProps> = ({ values, onChange, errors, marketplace }) => {
  const isWildberries = marketplace === 'wildberries';

  // Расчет итоговой цены
  const priceAfterSellerDiscount = values.retailPrice * (1 - values.sellerDiscount / 100);
  const finalPrice = priceAfterSellerDiscount * (1 - values.additionalPromo / 100);
  const totalDiscount = values.sellerDiscount + values.additionalPromo;

  return (
    <Card 
      title="Блок 5: Ценообразование и скидки" 
      subtitle="Розничная цена и все виды скидок"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Розничная цена"
          type="currency"
          value={values.retailPrice}
          onChange={(value) => onChange('retailPrice', value)}
          placeholder="1500"
          tooltip="Базовая розничная цена товара до применения всех скидок"
          error={errors.retailPrice}
          required
          min={1}
        />

        <Input
          label="Скидка продавца"
          type="percentage"
          value={values.sellerDiscount}
          onChange={(value) => onChange('sellerDiscount', value)}
          placeholder="10"
          tooltip="Ваша персональная скидка на товар (в процентах от розничной цены)"
          error={errors.sellerDiscount}
          min={0}
          max={90}
        />

        <div className="md:col-span-2">
          <Input
            label={isWildberries ? "Дополнительные промо (СПП, акции)" : "Дополнительные промо (акции)"}
            type="percentage"
            value={values.additionalPromo}
            onChange={(value) => onChange('additionalPromo', value)}
            placeholder="5"
            tooltip={isWildberries 
              ? "Дополнительные скидки: СПП (скидка постоянного покупателя), флеш-акции, программа лояльности"
              : "Дополнительные маркетинговые скидки: акции, промокоды, cashback и т.д."
            }
            error={errors.additionalPromo}
            min={0}
            max={50}
          />
        </div>
      </div>

      {/* Расчет цены к оплате */}
      <div className="mt-6 space-y-4">
        {/* Промежуточные расчеты */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">Расчет цены к оплате:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Розничная цена:</span>
              <span className="font-medium">{values.retailPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
            
            {values.sellerDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  - Скидка продавца ({values.sellerDiscount}%):
                </span>
                <span className="text-red-600">
                  -{(values.retailPrice * values.sellerDiscount / 100).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}
            
            {values.sellerDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Цена после скидки продавца:</span>
                <span className="font-medium">{priceAfterSellerDiscount.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}
            
            {values.additionalPromo > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  - Дополнительные промо ({values.additionalPromo}%):
                </span>
                <span className="text-red-600">
                  -{(priceAfterSellerDiscount * values.additionalPromo / 100).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Итоговая цена */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-800">
                Цена к оплате покупателем:
              </span>
              {totalDiscount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Общая скидка: {totalDiscount.toFixed(1)}%
                </p>
              )}
            </div>
            <span className="text-2xl font-bold text-green-900">
              {finalPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {/* Предупреждения */}
        {totalDiscount > 70 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Очень большая скидка!
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Общая скидка превышает 70%. Проверьте корректность данных и рентабельность.
                </p>
              </div>
            </div>
          </div>
        )}

        {finalPrice < 100 && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Низкая цена товара
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  При цене менее 100₽ относительные расходы на логистику могут быть критически высокими.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PricingBlock;
