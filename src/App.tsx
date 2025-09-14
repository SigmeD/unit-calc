import { useCallback, useState } from 'react';
import { useAppState, useCalculations } from './hooks';
import { MarketplaceSelector, DataInputForm, ScenarioManager } from './components/forms';
import { ResultsPanel } from './components/results';
import { Button } from './components/ui';
import GlossaryModal from './components/ui/GlossaryModal';
import Layout from './components/layout/Layout';
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
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  
  const {
    selectedMarketplace,
    currentScenario,
    scenarios,
    input,
    results,
    errors,
    isCalculating,
    setMarketplace,
    updateInput,
    setResults,
    setErrors,
    setCalculating,
    saveScenario,
    loadScenario,
    deleteScenario,
    newScenario
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

  const handleBulkChange = useCallback((values: Partial<any>) => {
    updateInput(values);
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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="space-y-4 md:space-y-8">
          {/* Заголовок */}
        <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Калькулятор юнит-экономики
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-4">
              Рассчитайте прибыльность товаров на Wildberries и Ozon с учетом всех комиссий и скрытых расходов
            </p>
            
            {/* Кнопка глоссария */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setIsGlossaryOpen(true)}
                className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>📚 Глоссарий терминов</span>
              </Button>
            </div>
          </div>

        {/* Селектор маркетплейса */}
        <MarketplaceSelector
          marketplaces={mockMarketplaces}
          selectedMarketplace={selectedMarketplace}
          onMarketplaceChange={handleMarketplaceChange}
          errors={errors}
        />

        {/* Управление сценариями */}
        {selectedMarketplace && (
          <ScenarioManager
            scenarios={scenarios}
            currentScenarioId={currentScenario}
            marketplace={selectedMarketplace}
            currentInput={input}
            currentResults={results}
            onScenarioLoad={loadScenario}
            onScenarioSave={saveScenario}
            onScenarioDelete={deleteScenario}
            onNewScenario={newScenario}
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
          {/* Форма ввода данных */}
          {selectedMarketplace && (
            <div className="order-2 xl:order-1">
              <DataInputForm
                marketplace={selectedMarketplace}
                values={input}
                onChange={handleInputChange}
                onBulkChange={handleBulkChange}
                errors={errors}
              />
            </div>
          )}

          {/* Результаты расчетов - липкий блок на десктопе */}
          {selectedMarketplace && (
            <div className="order-1 xl:order-2">
              <div className="xl:sticky xl:top-8 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto sticky-results sticky-scroll xl:shadow-lg xl:rounded-xl">
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

          </div>
        </div>
      </div>
      
      {/* Глоссарий модальное окно */}
      <GlossaryModal 
        isOpen={isGlossaryOpen} 
        onClose={() => setIsGlossaryOpen(false)} 
      />
    </Layout>
  );
}

export default App;