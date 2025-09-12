import React, { useState } from 'react';
import { Input } from './components/ui';

/**
 * Тестовый компонент для проверки исправления бага с Input полями
 */
const TestInputComponent: React.FC = () => {
  const [values, setValues] = useState({
    price: 0,
    percentage: 0,
    currency: 0
  });

  const handleChange = (field: string) => (value: number) => {
    console.log(`Изменение ${field}:`, value);
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-6">Тест Input компонентов</h2>
      
      <div className="space-y-4">
        <Input
          label="Цена товара"
          type="currency"
          value={values.price}
          onChange={handleChange('price')}
          placeholder="1000"
          tooltip="Тест многозначных чисел - введите 12345"
          min={0}
        />
        
        <Input
          label="Процент комиссии"
          type="percentage"
          value={values.percentage}
          onChange={handleChange('percentage')}
          placeholder="15"
          tooltip="Тест процентов - введите 15.5"
          min={0}
          max={100}
        />
        
        <Input
          label="Обычное число"
          type="number"
          value={values.currency}
          onChange={handleChange('currency')}
          placeholder="500"
          tooltip="Тест обычных чисел - введите 500.25"
          min={0}
        />
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Текущие значения:</h3>
        <pre className="text-sm">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestInputComponent;
