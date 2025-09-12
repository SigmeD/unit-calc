import React from 'react';
import type { Marketplace, CalculationResults } from '../../types';
import { useFormulaExplanations, useProfitabilityAnalysis } from '../../hooks';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ResultsPanelProps {
  marketplace: Marketplace | null;
  results: CalculationResults | null;
  isCalculating: boolean;
  onExport?: () => void;
  onSave?: () => void;
  onReset?: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  marketplace, 
  results, 
  isCalculating, 
  onExport, 
  onSave, 
  onReset 
}) => {
  const { getExplanation } = useFormulaExplanations();
  const analysis = useProfitabilityAnalysis(results);

  // Форматирование чисел
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  // Определение цвета статуса
  const getStatusColor = (status: 'profit' | 'loss' | 'breakeven') => {
    switch (status) {
      case 'profit': return 'green';
      case 'loss': return 'red';
      case 'breakeven': return 'yellow';
      default: return 'gray';
    }
  };

  // Компонент метрики с тултипом
  const MetricCard: React.FC<{
    title: string;
    value: string;
    color: string;
    metric: string;
    subtitle?: string;
  }> = ({ title, value, color, metric, subtitle }) => {
    const explanation = getExplanation(metric);
    
    return (
      <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-200 relative group`}>
        <div className={`text-2xl font-bold text-${color}-600`}>
          {value}
        </div>
        <div className={`text-sm text-${color}-700`}>{title}</div>
        {subtitle && (
          <div className={`text-xs text-${color}-500 mt-1`}>{subtitle}</div>
        )}
        
        {/* Тултип с объяснением */}
        {explanation && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <div className="font-semibold mb-1">{explanation.title}</div>
            <div className="mb-1">{explanation.formula}</div>
            <div className="text-gray-300">{explanation.description}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>
    );
  };

  if (isCalculating) {
    return (
      <Card title="Результаты расчета">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Выполняется расчет...</span>
        </div>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card title="Результаты расчета">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-600">Заполните данные для начала расчета</p>
          </div>
        </div>
      </Card>
    );
  }

  const statusColor = getStatusColor(results.status);

  return (
    <Card title="Результаты расчета">
      <div className="space-y-6">
        {/* Статус прибыльности */}
        {analysis && (
          <div className={`p-4 rounded-lg border bg-${statusColor}-50 border-${statusColor}-200`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-lg font-semibold text-${statusColor}-700`}>
                  {analysis.status.message}
                </div>
                <div className={`text-sm text-${statusColor}-600`}>
                  {analysis.status.recommendation}
                </div>
              </div>
              <div className={`text-3xl font-bold text-${statusColor}-600`}>
                {formatCurrency(results.netProfit)}
              </div>
            </div>
          </div>
        )}

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Чистая прибыль"
            value={formatCurrency(results.netProfit)}
            color={statusColor}
            metric="netProfit"
          />
          
          <MetricCard
            title="Маржинальность"
            value={formatPercent(results.marginPercent)}
            color="blue"
            metric="marginPercent"
          />
          
          <MetricCard
            title="Точка безубыточности"
            value={formatCurrency(results.breakEvenPrice)}
            color="purple"
            metric="breakEvenPrice"
            subtitle="по цене"
          />
        </div>

        {/* Дополнительные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="CM1"
            value={formatCurrency(results.cm1)}
            color="gray"
            metric="cm1"
          />
          
          <MetricCard
            title="CM2"
            value={formatCurrency(results.cm2)}
            color="gray"
            metric="cm2"
          />
          
          <MetricCard
            title="ROI"
            value={formatPercent(results.roi)}
            color="gray"
            metric="roi"
          />

          <MetricCard
            title="ACoS"
            value={formatPercent(results.acos)}
            color="gray"
            metric="acos"
          />
        </div>

        {/* Детальная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3">Выручка и цены</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Эффективная цена:</span>
                <span className="font-medium">{formatCurrency(results.effectivePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Эффективный выкуп:</span>
                <span className="font-medium">{formatPercent(results.effectivePickupRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Выручка с единицы:</span>
                <span className="font-medium">{formatCurrency(results.revenue)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3">Безубыточность</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Мин. цена:</span>
                <span className="font-medium">{formatCurrency(results.breakEvenPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Нужный объем:</span>
                <span className="font-medium">
                  {results.breakEvenVolume === Infinity 
                    ? 'Невозможно' 
                    : `${Math.round(results.breakEvenVolume)} шт/мес`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <Button variant="primary" onClick={onExport}>
            Экспорт в Excel
          </Button>
          <Button variant="secondary" onClick={onSave}>
            Сохранить сценарий
          </Button>
          <Button variant="outline" onClick={onReset}>
            Сбросить данные
          </Button>
        </div>

        {/* Информация о маркетплейсе */}
        {marketplace && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Расчет для:</span> {marketplace.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Используются предустановленные значения для данного маркетплейса
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResultsPanel;
