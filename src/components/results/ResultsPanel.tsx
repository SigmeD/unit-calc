import React from 'react';
import type { Marketplace } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ResultsPanelProps {
  marketplace: Marketplace | null;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ marketplace }) => {
  // Временные данные для демонстрации
  const mockResults = {
    netProfit: 450,
    marginPercent: 25,
    breakEvenPrice: 850,
    cm1: 320,
    cm2: 270,
    roi: 45
  };

  return (
    <Card title="Результаты расчета">
      <div className="space-y-6">
        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              ₽{mockResults.netProfit}
            </div>
            <div className="text-sm text-green-700">Чистая прибыль</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {mockResults.marginPercent}%
            </div>
            <div className="text-sm text-blue-700">Маржинальность</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              ₽{mockResults.breakEvenPrice}
            </div>
            <div className="text-sm text-purple-700">Точка безубыточности</div>
          </div>
        </div>

        {/* Дополнительные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-lg font-semibold text-gray-700">
              ₽{mockResults.cm1}
            </div>
            <div className="text-sm text-gray-600">CM1 (Contribution Margin 1)</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-lg font-semibold text-gray-700">
              ₽{mockResults.cm2}
            </div>
            <div className="text-sm text-gray-600">CM2 (Contribution Margin 2)</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-lg font-semibold text-gray-700">
              {mockResults.roi}%
            </div>
            <div className="text-sm text-gray-600">ROI</div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <Button variant="primary">
            Экспорт в Excel
          </Button>
          <Button variant="secondary">
            Сохранить сценарий
          </Button>
          <Button variant="outline">
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
