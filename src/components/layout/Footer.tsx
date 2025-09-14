import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Помощь */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Помощь</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Как пользоваться калькулятором
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Часто задаваемые вопросы
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Контакты поддержки
                </a>
              </li>
            </ul>
          </div>

          {/* Глоссарий терминов */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Глоссарий терминов</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Юнит-экономика
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Contribution Margin
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  ROI и ACoS
                </a>
              </li>
            </ul>
          </div>

          {/* Все права подтверждены */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Правовая информация</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Лицензия MIT
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-gray-200 pt-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Unit Calc. Калькулятор юнит-экономики для маркетплейсов.</p>
            <p className="mt-1">Все права подтверждены. Создано с ❤️ для селлеров.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;