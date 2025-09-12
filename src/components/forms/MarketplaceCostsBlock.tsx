import React from 'react';
import { Input, Card } from '../ui';
import type { CalculationInput, MarketplaceId } from '../../types';

interface MarketplaceCostsBlockProps {
  values: Pick<CalculationInput, 'commission' | 'logistics' | 'storage' | 'returnProcessing' | 'pickupRate' | 'returnRate'>;
  onChange: (field: string, value: number) => void;
  errors: Record<string, string>;
  marketplace: MarketplaceId;
}

const MarketplaceCostsBlock: React.FC<MarketplaceCostsBlockProps> = ({ 
  values, 
  onChange, 
  errors, 
  marketplace 
}) => {
  const isWildberries = marketplace === 'wildberries';

  return (
    <Card 
      title="Блок 2: Расходы маркетплейса" 
      subtitle="Комиссии и расходы, связанные с продажами на платформе"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Комиссия маркетплейса"
          type="percentage"
          value={values.commission}
          onChange={(value) => onChange('commission', value)}
          placeholder={isWildberries ? "17" : "15"}
          tooltip="Процент комиссии маркетплейса от цены к оплате покупателем"
          error={errors.commission}
          required
          min={0}
          max={50}
        />

        <Input
          label="Логистика до клиента"
          type="currency"
          value={values.logistics}
          onChange={(value) => onChange('logistics', value)}
          placeholder={isWildberries ? "0" : "35"}
          tooltip={isWildberries 
            ? "На Wildberries логистика до клиента включена в комиссию" 
            : "Стоимость доставки товара от склада до покупателя"
          }
          error={errors.logistics}
          min={0}
          disabled={isWildberries}
        />

        <Input
          label="Хранение на складе"
          type="currency"
          value={values.storage}
          onChange={(value) => onChange('storage', value)}
          placeholder="10"
          tooltip="Стоимость хранения товара на складе маркетплейса (в расчете на оборот)"
          error={errors.storage}
          min={0}
        />

        <Input
          label="Обработка возврата"
          type="currency"
          value={values.returnProcessing}
          onChange={(value) => onChange('returnProcessing', value)}
          placeholder="20"
          tooltip="Затраты на обработку возвращенного товара (сортировка, проверка, возврат на склад)"
          error={errors.returnProcessing}
          min={0}
        />

        <Input
          label="Процент выкупа"
          type="percentage"
          value={values.pickupRate}
          onChange={(value) => onChange('pickupRate', value)}
          placeholder={isWildberries ? "70" : "65"}
          tooltip="Доля заказов, которые покупатели фактически выкупают (не отменяют)"
          error={errors.pickupRate}
          required
          min={1}
          max={100}
        />

        <Input
          label="Доля невосстановимых возвратов"
          type="percentage"
          value={values.returnRate}
          onChange={(value) => onChange('returnRate', value)}
          placeholder={isWildberries ? "15" : "20"}
          tooltip="Процент товаров, которые возвращаются после оплаты и не подлежат повторной продаже"
          error={errors.returnRate}
          min={0}
          max={100}
        />
      </div>

      {/* Информационная панель */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Особенности {isWildberries ? 'Wildberries' : 'Ozon'}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {isWildberries 
                ? "Логистика до клиента включена в комиссию. Средний выкуп 65-75%." 
                : "Отдельная плата за логистику. Средний выкуп 60-70%."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketplaceCostsBlock;
