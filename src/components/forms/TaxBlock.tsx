import React from 'react';
import { Card, Select } from '../ui';
import type { CalculationInput, TaxRegime } from '../../types';

interface TaxBlockProps {
  values: Pick<CalculationInput, 'taxRegime'>;
  onChange: (field: string, value: TaxRegime) => void;
  errors: Record<string, string>;
  grossProfit?: number; // Валовая прибыль для расчета налога
}

const TaxBlock: React.FC<TaxBlockProps> = ({ values, onChange, errors, grossProfit = 0 }) => {
  const taxOptions = [
    { value: 'USN_6', label: 'УСН 6% (с оборота)' },
    { value: 'USN_15', label: 'УСН 15% (с прибыли)' },
    { value: 'OSNO', label: 'ОСНО (упрощенно)' }
  ];

  // Расчет налоговой ставки и базы
  const getTaxInfo = (regime: TaxRegime, profit: number) => {
    switch (regime) {
      case 'USN_6':
        return {
          rate: 6,
          base: profit, // Упрощенно берем валовую прибыль как оборот
          description: 'Налог с валового оборота'
        };
      case 'USN_15':
        return {
          rate: 15,
          base: Math.max(0, profit), // Налог только с положительной прибыли
          description: 'Налог с чистой прибыли'
        };
      case 'OSNO':
        return {
          rate: 20,
          base: Math.max(0, profit), // НДС + налог на прибыль (упрощенно)
          description: 'НДС + налог на прибыль (упрощенно)'
        };
      default:
        return { rate: 0, base: 0, description: '' };
    }
  };

  const taxInfo = getTaxInfo(values.taxRegime, grossProfit);
  const calculatedTax = (taxInfo.base * taxInfo.rate) / 100;

  return (
    <Card 
      title="Блок 4: Налогообложение" 
      subtitle="Выбор налогового режима и расчет налоговой нагрузки"
    >
      <div className="space-y-6">
        <Select
          label="Налоговый режим"
          value={values.taxRegime}
          onChange={(value) => onChange('taxRegime', value as TaxRegime)}
          options={taxOptions}
          error={errors.taxRegime}
          required
        />

        {/* Информация о выбранном режиме */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Выбранный режим: {taxOptions.find(opt => opt.value === values.taxRegime)?.label}
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            {values.taxRegime === 'USN_6' && (
              <>
                <p>• Налоговая ставка: 6% с валового оборота</p>
                <p>• Простая отчетность, минимум документооборота</p>
                <p>• Подходит для торговли с высокой оборачиваемостью</p>
              </>
            )}
            {values.taxRegime === 'USN_15' && (
              <>
                <p>• Налоговая ставка: 15% с прибыли (доходы минус расходы)</p>
                <p>• Нужно документировать все расходы</p>
                <p>• Выгодно при высоких расходах и низкой марже</p>
              </>
            )}
            {values.taxRegime === 'OSNO' && (
              <>
                <p>• НДС 20% + налог на прибыль ~20%</p>
                <p>• Полная отчетность, сложный учет</p>
                <p>• Обязательно при работе с НДС-плательщиками</p>
              </>
            )}
          </div>
        </div>

        {/* Расчет налога */}
        {grossProfit > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Налоговая база:
                </span>
                <span className="text-sm text-gray-900">
                  {taxInfo.base.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Налоговая ставка:
                </span>
                <span className="text-sm text-gray-900">
                  {taxInfo.rate}%
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-300 pt-2">
                <span className="text-sm font-bold text-gray-700">
                  Налог к доплате:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {calculatedTax.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {taxInfo.description}
              </p>
            </div>
          </div>
        )}

        {/* Предупреждение */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Внимание! Расчет упрощенный
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Для точного расчета налогов обратитесь к бухгалтеру. 
                Не учтены льготы, лимиты доходов и другие особенности.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaxBlock;
