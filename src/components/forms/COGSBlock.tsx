import React from 'react';
import { Input, Card } from '../ui';
import type { CalculationInput } from '../../types';

interface COGSBlockProps {
  values: Pick<CalculationInput, 'purchasePrice' | 'deliveryToWarehouse' | 'packaging' | 'otherCOGS'>;
  onChange: (field: string, value: number) => void;
  errors: Record<string, string>;
}

const COGSBlock: React.FC<COGSBlockProps> = ({ values, onChange, errors }) => {
  return (
    <Card 
      title="Блок 1: Себестоимость (COGS)" 
      subtitle="Прямые затраты на производство и доставку товара"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Закупочная цена"
          type="currency"
          value={values.purchasePrice}
          onChange={(value) => onChange('purchasePrice', value)}
          placeholder="1000"
          tooltip="Стоимость покупки товара у поставщика без учета доставки"
          error={errors.purchasePrice}
          required
          min={0}
        />

        <Input
          label="Доставка до склада"
          type="currency"
          value={values.deliveryToWarehouse}
          onChange={(value) => onChange('deliveryToWarehouse', value)}
          placeholder="50"
          tooltip="Расходы на доставку товара от поставщика до вашего склада или склада маркетплейса"
          error={errors.deliveryToWarehouse}
          min={0}
        />

        <Input
          label="Упаковка и маркировка"
          type="currency"
          value={values.packaging}
          onChange={(value) => onChange('packaging', value)}
          placeholder="25"
          tooltip="Затраты на упаковочные материалы, маркировку, подготовку товара к отправке"
          error={errors.packaging}
          min={0}
        />

        <Input
          label="Прочие расходы COGS"
          type="currency"
          value={values.otherCOGS}
          onChange={(value) => onChange('otherCOGS', value)}
          placeholder="15"
          tooltip="Другие прямые расходы: пошлины, сертификация, брендинг упаковки и т.д."
          error={errors.otherCOGS}
          min={0}
        />
      </div>

      {/* Итоговая сумма COGS */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Общая себестоимость (COGS):
          </span>
          <span className="text-lg font-bold text-gray-900">
            {(values.purchasePrice + values.deliveryToWarehouse + values.packaging + values.otherCOGS).toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Сумма всех прямых затрат на единицу товара
        </p>
      </div>
    </Card>
  );
};

export default COGSBlock;
