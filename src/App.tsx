import { useCallback } from 'react';
import { useAppState, useCalculations } from './hooks';
import { MarketplaceSelector, DataInputForm } from './components/forms';
import { ResultsPanel } from './components/results';
import type { MarketplaceId, TaxRegime } from './types';

// Моковые данные маркетплейсов для демонстрации
const mockMarketplaces = [
  {
    id: 'wildberries' as MarketplaceId,
    name: 'Wildberries',
    config: {
      defaultCommission: 17,
      logisticOptions: [],
      specificFields: [],
      taxRegimes: ['USN_6', 'USN_15', 'OSNO'] as TaxRegime[],
    },
    defaultValues: {
      commission: 17,
      pickupRate: 70,
      returnRate: 15,
      logistics: 0,
      purchasePrice: 0,
      deliveryToWarehouse: 0,
      packaging: 0,
      otherCOGS: 0,
      storage: 0,
      returnProcessing: 0,
      advertising: 0,
      otherVariableCosts: 0,
      fixedCostsPerMonth: 0,
      expectedSalesPerMonth: 100,
      taxRegime: 'USN_6' as TaxRegime,
      retailPrice: 1000,
      sellerDiscount: 0,
      additionalPromo: 0,
    }
  },
  {
    id: 'ozon' as MarketplaceId,
    name: 'Ozon', 
    config: {
      defaultCommission: 15,
      logisticOptions: [],
      specificFields: [],
      taxRegimes: ['USN_6', 'USN_15', 'OSNO'] as TaxRegime[],
    },
    defaultValues: {
      commission: 15,
      pickupRate: 65,
      returnRate: 20,
      logistics: 35,
      purchasePrice: 0,
      deliveryToWarehouse: 0,
      packaging: 0,
      otherCOGS: 0,
      storage: 0,
      returnProcessing: 0,
      advertising: 0,
      otherVariableCosts: 0,
      fixedCostsPerMonth: 0,
      expectedSalesPerMonth: 100,
      taxRegime: 'USN_6' as TaxRegime,
      retailPrice: 1000,
      sellerDiscount: 0,
      additionalPromo: 0,
    }
  }
];

function App() {
  const {
    selectedMarketplace,
    input,
    results,
    errors,
    isCalculating,
    setMarketplace,
    updateInput,
    setResults,
    setErrors,
    setCalculating
  } = useAppState();
  
  const handleMarketplaceChange = useCallback((marketplaceId: MarketplaceId) => {
    setMarketplace(marketplaceId);
    
    // Применяем дефолтные значения для выбранного маркетплейса
    const marketplace = mockMarketplaces.find(mp => mp.id === marketplaceId);
    if (marketplace) {
      updateInput(marketplace.defaultValues);
    }
  }, [setMarketplace, updateInput]);

  const handleInputChange = useCallback((field: string, value: number | string) => {
    updateInput({ [field]: value });
  }, [updateInput]);

  // Настройка автоматических расчетов
  useCalculations({
    input,
    onResults: setResults,
    onErrors: setErrors,
    onCalculating: setCalculating,
    debounceMs: 800 // Увеличили время чтобы избежать потери фокуса при вводе
  });

  // Получаем выбранный маркетплейс
  const currentMarketplace = mockMarketplaces.find(mp => mp.id === selectedMarketplace);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Заголовок */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Калькулятор юнит-экономики
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Рассчитайте прибыльность товаров на Wildberries и Ozon с учетом всех комиссий и скрытых расходов
            </p>
          </div>

        {/* Селектор маркетплейса */}
        <MarketplaceSelector
          marketplaces={mockMarketplaces}
          selectedMarketplace={selectedMarketplace}
          onMarketplaceChange={handleMarketplaceChange}
          errors={errors}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма ввода данных */}
          {selectedMarketplace && (
            <div className="order-2 lg:order-1">
              <DataInputForm
                marketplace={selectedMarketplace}
                values={input}
                onChange={handleInputChange}
                errors={errors}
              />
            </div>
          )}

          {/* Результаты расчетов - липкий блок */}
          {selectedMarketplace && (
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto sticky-results sticky-scroll lg:shadow-lg lg:rounded-xl">
                <ResultsPanel
                  marketplace={currentMarketplace || null}
                  results={results}
                  isCalculating={isCalculating}
                  onExport={() => console.log('Экспорт в Excel')}
                  onSave={() => console.log('Сохранить сценарий')}
                  onReset={() => console.log('Сбросить данные')}
                />
              </div>
            </div>
          )}
        </div>

          {/* Статус разработки */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Статус разработки</h2>
              <p className="text-gray-600">Текущий прогресс проекта</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Этап 1: Инфраструктура
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  React + TypeScript, Tailwind CSS
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Завершен
                </span>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Этап 2: Выбор маркетплейса
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  Селектор, автозаполнение, валидация
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Завершен
                </span>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Этап 3: Модуль ввода данных
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  5 блоков ввода, валидация форм
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Завершен
                </span>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Этап 4: Движок расчетов
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  Формулы юнит-экономики, мгновенные расчеты
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Завершен
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;