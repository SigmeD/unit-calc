import React, { useState, useEffect } from 'react';
import { Button } from './';

interface GlossaryTerm {
  term: string;
  definition: string;
  formula?: string;
  example?: string;
  category: 'cogs' | 'marketplace' | 'metrics' | 'pricing' | 'general';
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // COGS
  {
    term: 'Себестоимость (COGS)',
    definition: 'Прямые затраты на производство или приобретение товара',
    formula: 'COGS = Закупочная цена + Доставка + Упаковка + Прочие',
    example: '500₽ + 50₽ + 25₽ + 25₽ = 600₽',
    category: 'cogs'
  },
  {
    term: 'Закупочная цена',
    definition: 'Стоимость товара у поставщика без учета доставки и налогов',
    example: 'Если покупаете товар за 500₽ у поставщика',
    category: 'cogs'
  },
  
  // Маркетплейс
  {
    term: 'Комиссия маркетплейса',
    definition: 'Процент, который берет маркетплейс с каждой продажи',
    example: 'WB: 17%, Ozon: 15% (в среднем)',
    category: 'marketplace'
  },
  {
    term: 'Процент выкупа',
    definition: 'Доля заказов, которые покупатели действительно выкупают',
    example: 'При 70% выкупе из 100 заказов выкупят только 70',
    category: 'marketplace'
  },
  {
    term: 'Логистика',
    definition: 'Стоимость доставки товара до покупателя',
    example: 'WB: бесплатно для покупателя, Ozon: 35-150₽',
    category: 'marketplace'
  },
  
  // Метрики
  {
    term: 'CM1 (Contribution Margin 1)',
    definition: 'Маржинальная прибыль после вычета прямых затрат маркетплейса',
    formula: 'CM1 = Выручка - COGS - Комиссия - Логистика',
    example: '1000₽ - 500₽ - 170₽ - 50₽ = 280₽',
    category: 'metrics'
  },
  {
    term: 'CM2 (Contribution Margin 2)',
    definition: 'Маржинальная прибыль после вычета рекламных расходов',
    formula: 'CM2 = CM1 - Реклама',
    example: '280₽ - 100₽ = 180₽',
    category: 'metrics'
  },
  {
    term: 'ROI (Return on Investment)',
    definition: 'Возврат на инвестиции - показывает эффективность вложений',
    formula: 'ROI = (Прибыль / Вложения) × 100%',
    example: 'При прибыли 200₽ и затратах 600₽: ROI = 33%',
    category: 'metrics'
  },
  {
    term: 'ACoS (Advertising Cost of Sales)',
    definition: 'Доля рекламных расходов от выручки',
    formula: 'ACoS = (Реклама / Выручка) × 100%',
    example: 'При рекламе 100₽ и выручке 1000₽: ACoS = 10%',
    category: 'metrics'
  },
  {
    term: 'Точка безубыточности',
    definition: 'Минимальная цена или объем продаж для покрытия всех расходов',
    formula: 'БУ цена = Все затраты / Эффективный выкуп',
    example: 'При затратах 700₽ и выкупе 70%: БУ = 1000₽',
    category: 'metrics'
  },
  
  // Ценообразование
  {
    term: 'Розничная цена',
    definition: 'Базовая цена товара до применения скидок',
    example: 'Цена 1200₽ до скидки продавца 10%',
    category: 'pricing'
  },
  {
    term: 'Скидка продавца',
    definition: 'Скидка, которую вы как продавец даете покупателю',
    example: 'При розничной цене 1000₽ и скидке 15% = 850₽',
    category: 'pricing'
  },
  {
    term: 'Дополнительные промо',
    definition: 'Дополнительные скидки от маркетплейса (СПП, акции)',
    example: 'Скидка по программе СПП на WB или Flash Sale на Ozon',
    category: 'pricing'
  },
  
  // Общие термины
  {
    term: 'Юнит-экономика',
    definition: 'Анализ прибыльности одной единицы товара с учетом всех затрат',
    example: 'Помогает понять, сколько вы зарабатываете с каждой продажи',
    category: 'general'
  },
  {
    term: 'Маржинальность',
    definition: 'Доля прибыли в цене товара, выраженная в процентах',
    formula: 'Маржа = (Прибыль / Цена) × 100%',
    example: 'При прибыли 200₽ и цене 1000₽: маржа = 20%',
    category: 'general'
  }
];

const CATEGORY_NAMES = {
  cogs: 'Себестоимость',
  marketplace: 'Маркетплейс',
  metrics: 'Метрики',
  pricing: 'Ценообразование',
  general: 'Общие термины'
};

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Фильтрация терминов
  const filteredTerms = GLOSSARY_TERMS.filter(term => {
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Группировка по категориям
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📚 Глоссарий терминов</h2>
              <p className="text-blue-100 mt-1">Разъяснение основных понятий юнит-экономики</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по терминам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Фильтр по категориям */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все категории</option>
                {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(groupedTerms).map(([category, terms]) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
              </h3>
              
              <div className="space-y-4">
                {terms.map((term, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{term.term}</h4>
                    <p className="text-gray-700 mb-3">{term.definition}</p>
                    
                    {term.formula && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                        <div className="text-sm font-medium text-blue-900 mb-1">Формула:</div>
                        <code className="text-sm text-blue-800 font-mono">{term.formula}</code>
                      </div>
                    )}
                    
                    {term.example && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-900 mb-1">Пример:</div>
                        <div className="text-sm text-green-800">{term.example}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <p className="text-gray-600">Термины не найдены</p>
              <p className="text-gray-500 text-sm mt-1">Попробуйте изменить поисковый запрос или категорию</p>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Найдено терминов: <span className="font-medium">{filteredTerms.length}</span>
            </div>
            <Button variant="primary" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlossaryModal;
