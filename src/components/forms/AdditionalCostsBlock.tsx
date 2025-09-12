import React from 'react';
import { Input, Card } from '../ui';
import type { CalculationInput } from '../../types';

interface AdditionalCostsBlockProps {
  values: Pick<CalculationInput, 'advertising' | 'otherVariableCosts' | 'fixedCostsPerMonth' | 'expectedSalesPerMonth'>;
  onChange: (field: string, value: number) => void;
  errors: Record<string, string>;
}

const AdditionalCostsBlock: React.FC<AdditionalCostsBlockProps> = ({ values, onChange, errors }) => {
  // Рассчитываем долю фиксированных расходов на единицу
  const fixedCostPerUnit = values.expectedSalesPerMonth && values.expectedSalesPerMonth > 0 
    ? values.fixedCostsPerMonth / values.expectedSalesPerMonth 
    : 0;

  return (
    <Card 
      title="Блок 3: Дополнительные расходы" 
      subtitle="Переменные и фиксированные расходы, не связанные с маркетплейсом"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Реклама на 1 продажу"
          type="currency"
          value={values.advertising}
          onChange={(value) => onChange('advertising', value)}
          placeholder="100"
          tooltip="Затраты на рекламу в расчете на одну продажу (общий рекламный бюджет / количество продаж)"
          error={errors.advertising}
          min={0}
        />

        <Input
          label="Прочие переменные расходы"
          type="currency"
          value={values.otherVariableCosts}
          onChange={(value) => onChange('otherVariableCosts', value)}
          placeholder="30"
          tooltip="Другие переменные расходы на единицу: брак, доп. услуги, сервис и т.д."
          error={errors.otherVariableCosts}
          min={0}
        />

        <Input
          label="Фиксированные расходы в месяц"
          type="currency"
          value={values.fixedCostsPerMonth}
          onChange={(value) => onChange('fixedCostsPerMonth', value)}
          placeholder="50000"
          tooltip="Постоянные расходы: аренда, зарплаты, подписки, которые не зависят от объема продаж"
          error={errors.fixedCostsPerMonth}
          min={0}
        />

        <Input
          label="Ожидаемые продажи в месяц"
          type="number"
          value={values.expectedSalesPerMonth || 0}
          onChange={(value) => onChange('expectedSalesPerMonth', value)}
          placeholder="100"
          tooltip="Прогнозируемое количество продаж в месяц для расчета доли фиксированных расходов"
          error={errors.expectedSalesPerMonth}
          min={1}
        />
      </div>

      {/* Расчет доли фиксированных расходов */}
      {values.fixedCostsPerMonth > 0 && values.expectedSalesPerMonth && values.expectedSalesPerMonth > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">
              Доля фиксированных расходов на единицу:
            </span>
            <span className="text-lg font-bold text-yellow-900">
              {fixedCostPerUnit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Рассчитано как: {values.fixedCostsPerMonth.toLocaleString('ru-RU')} ₽ ÷ {values.expectedSalesPerMonth} шт.
          </p>
        </div>
      )}

      {/* Общая сумма дополнительных расходов */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Дополнительные расходы на единицу:
          </span>
          <span className="text-lg font-bold text-gray-900">
            {(values.advertising + values.otherVariableCosts + fixedCostPerUnit).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 space-y-1">
          <div className="flex justify-between">
            <span>• Реклама:</span>
            <span>{values.advertising.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>• Прочие переменные:</span>
            <span>{values.otherVariableCosts.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>• Доля фиксированных:</span>
            <span>{fixedCostPerUnit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdditionalCostsBlock;
