import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Калькулятор юнит-экономики
          </h1>
          <p className="text-lg text-gray-600">
            Рассчитайте прибыльность товаров на Wildberries и Ozon
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;