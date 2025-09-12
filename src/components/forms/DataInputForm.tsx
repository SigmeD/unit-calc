import React, { useState, memo } from 'react';
import { COGSBlock, MarketplaceCostsBlock, AdditionalCostsBlock, TaxBlock, PricingBlock } from './';
import type { CalculationInput, MarketplaceId } from '../../types';

interface DataInputFormProps {
  marketplace: MarketplaceId;
  values: CalculationInput;
  onChange: (field: string, value: number | string) => void;
  errors: Record<string, string>;
}

const DataInputForm: React.FC<DataInputFormProps> = ({
  marketplace,
  values,
  onChange,
  errors
}) => {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
    new Set(['cogs', 'marketplace', 'additional', 'tax', 'pricing'])
  );

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  // Рассчитываем валовую прибыль для блока налогов
  const calculateGrossProfit = (): number => {
    const totalCOGS = values.purchasePrice + values.deliveryToWarehouse + values.packaging + values.otherCOGS;
    const priceAfterSellerDiscount = values.retailPrice * (1 - values.sellerDiscount / 100);
    const finalPrice = priceAfterSellerDiscount * (1 - values.additionalPromo / 100);
    const commission = finalPrice * (values.commission / 100);
    
    return finalPrice - totalCOGS - commission - values.logistics - values.storage - values.advertising;
  };

  const BlockWrapper: React.FC<{
    blockId: string;
    title: string;
    children: React.ReactNode;
    priority?: 'high' | 'medium' | 'low';
  }> = ({ blockId, title, children, priority = 'medium' }) => {
    const isExpanded = expandedBlocks.has(blockId);
    
    const priorityColors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-blue-200 bg-blue-50',
      low: 'border-gray-200 bg-gray-50'
    };

    const priorityIcons = {
      high: '🔴',
      medium: '🔵', 
      low: '⚪'
    };

    return (
      <div className="mb-6">
        <button
          type="button"
          onClick={() => toggleBlock(blockId)}
          className={`w-full text-left p-4 rounded-t-lg border-2 ${priorityColors[priority]} hover:bg-opacity-80 transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{priorityIcons[priority]}</span>
              <span className="font-medium text-gray-900">{title}</span>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        <div className={`border-2 border-t-0 border-gray-200 rounded-b-lg bg-white transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Заголовок формы */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Детальный ввод данных
        </h2>
        <p className="text-gray-600">
          Заполните все блоки для точного расчета юнит-экономики на {marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'}
        </p>
      </div>

      {/* Прогресс заполнения */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Прогресс заполнения:</span>
          <span className="text-sm text-gray-500">5 из 5 блоков</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full w-full"></div>
        </div>
      </div>

      {/* Блок 1: Себестоимость */}
      <BlockWrapper blockId="cogs" title="Блок 1: Себестоимость (COGS)" priority="high">
        <COGSBlock
          values={{
            purchasePrice: values.purchasePrice,
            deliveryToWarehouse: values.deliveryToWarehouse,
            packaging: values.packaging,
            otherCOGS: values.otherCOGS
          }}
          onChange={onChange}
          errors={errors}
        />
      </BlockWrapper>

      {/* Блок 2: Расходы маркетплейса */}
      <BlockWrapper blockId="marketplace" title="Блок 2: Расходы маркетплейса" priority="high">
        <MarketplaceCostsBlock
          values={{
            commission: values.commission,
            logistics: values.logistics,
            storage: values.storage,
            returnProcessing: values.returnProcessing,
            pickupRate: values.pickupRate,
            returnRate: values.returnRate
          }}
          onChange={onChange}
          errors={errors}
          marketplace={marketplace}
        />
      </BlockWrapper>

      {/* Блок 3: Дополнительные расходы */}
      <BlockWrapper blockId="additional" title="Блок 3: Дополнительные расходы" priority="medium">
        <AdditionalCostsBlock
          values={{
            advertising: values.advertising,
            otherVariableCosts: values.otherVariableCosts,
            fixedCostsPerMonth: values.fixedCostsPerMonth,
            expectedSalesPerMonth: values.expectedSalesPerMonth
          }}
          onChange={onChange}
          errors={errors}
        />
      </BlockWrapper>

      {/* Блок 4: Налоги */}
      <BlockWrapper blockId="tax" title="Блок 4: Налогообложение" priority="medium">
        <TaxBlock
          values={{
            taxRegime: values.taxRegime
          }}
          onChange={onChange}
          errors={errors}
          grossProfit={calculateGrossProfit()}
        />
      </BlockWrapper>

      {/* Блок 5: Ценообразование */}
      <BlockWrapper blockId="pricing" title="Блок 5: Ценообразование и скидки" priority="high">
        <PricingBlock
          values={{
            retailPrice: values.retailPrice,
            sellerDiscount: values.sellerDiscount,
            additionalPromo: values.additionalPromo
          }}
          onChange={onChange}
          errors={errors}
          marketplace={marketplace}
        />
      </BlockWrapper>

      {/* Кнопки управления */}
      <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setExpandedBlocks(new Set(['cogs', 'marketplace', 'additional', 'tax', 'pricing']))}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span>Развернуть все</span>
        </button>
        
        <button
          type="button"
          onClick={() => setExpandedBlocks(new Set())}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v18" />
          </svg>
          <span>Свернуть все</span>
        </button>
      </div>
    </div>
  );
};

export default memo(DataInputForm);
