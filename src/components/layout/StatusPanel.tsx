import React from 'react';
import Card from '../ui/Card';

const StatusPanel: React.FC = () => {
  const statusItems = [
    {
      title: '✅ Этап 1: Инфраструктура - Завершен',
      description: 'React + TypeScript, Tailwind CSS',
      status: 'completed'
    },
    {
      title: '✅ Этап 2: Выбор маркетплейса - Завершен',
      description: 'Селектор, автозаполнение, базовая валидация',
      status: 'completed'
    },
    {
      title: '🔄 Этап 3: Модуль ввода данных - В разработке',
      description: '5 блоков ввода данных, валидация форм',
      status: 'in-progress'
    },
    {
      title: '⏳ Этап 4: Движок расчетов - Запланировано',
      description: 'Формулы юнит-экономики, точка безубыточности',
      status: 'planned'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'planned':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Card title="Статус разработки" className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {statusItems.map((item, index) => (
          <div
            key={index}
            className={`${getStatusColor(item.status)} border rounded-lg p-6`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${getStatusDot(item.status)} rounded-full`}></div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-700 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatusPanel;
