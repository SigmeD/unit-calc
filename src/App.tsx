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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        {/* Декоративные элементы фона */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Круги */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-32 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          
          {/* Сетка */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="relative z-10 py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 md:space-y-10">
              {/* Заголовок */}
              <div className="text-center mb-8 md:mb-12">
                {/* Иконка с анимацией */}
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Заголовок с улучшенной типографикой */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 leading-tight">
                  Калькулятор юнит-экономики
                </h1>
                
                {/* Подзаголовок */}
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4 mb-6 leading-relaxed">
                  Рассчитайте прибыльность товаров на <span className="font-semibold text-blue-600">Wildberries</span> и <span className="font-semibold text-orange-600">Ozon</span> с учетом всех комиссий и скрытых расходов
                </p>
                
                {/* Статистика */}
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>100% точность расчетов</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>2 маркетплейса</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Бесплатно</span>
                  </div>
                </div>
                
                {/* Кнопка глоссария с улучшенным дизайном */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsGlossaryOpen(true)}
                    className="group flex items-center space-x-3 px-6 py-3 text-blue-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 hover:shadow-md rounded-xl"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium">📚 Глоссарий терминов</span>
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

              {/* Основной контент с улучшенной компоновкой */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                {/* Форма ввода данных */}
                {selectedMarketplace && (
                  <div className="order-2 xl:order-1">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white/20 p-6 md:p-8">
                      <DataInputForm
                        marketplace={selectedMarketplace}
                        values={input}
                        onChange={handleInputChange}
                        onBulkChange={handleBulkChange}
                        errors={errors}
                      />
                    </div>
                  </div>
                )}

                {/* Результаты расчетов - липкий блок на десктопе */}
                {selectedMarketplace && (
                  <div className="order-1 xl:order-2">
                    <div className="xl:sticky xl:top-8 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white/20 overflow-hidden">
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
                  </div>
                )}
              </div>
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