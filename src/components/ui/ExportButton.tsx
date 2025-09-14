/**
 * Компонент кнопки экспорта в Excel
 * Этап 7: Экспорт данных
 */

import React, { useState } from 'react';
import { useExport } from '../../hooks/useExport';
import type { Scenario, MarketplaceId } from '../../types';

interface ExportButtonProps {
  scenario: Scenario;
  marketplace: MarketplaceId;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showDropdown?: boolean;
}

/**
 * Компонент кнопки экспорта с опциями
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  scenario,
  marketplace,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  showDropdown = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { exportCurrentScenario, exportDataOnly, canExport, getExportInfo } = useExport();

  const exportInfo = getExportInfo(scenario);
  const isEnabled = canExport(scenario) && !disabled && !isExporting;

  /**
   * Обработка экспорта с формулами
   */
  const handleFullExport = async () => {
    if (!isEnabled) return;

    setIsExporting(true);
    setShowOptions(false);

    try {
      // Имитируем небольшую задержку для показа состояния загрузки
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = exportCurrentScenario(scenario, marketplace, true);
      
      if (result.success) {
        // Можно добавить уведомление об успехе
        console.log('Экспорт завершен успешно');
      } else {
        alert(`Ошибка экспорта: ${result.error}`);
      }
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Произошла ошибка при экспорте файла');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Обработка экспорта только данных
   */
  const handleDataOnlyExport = async () => {
    if (!isEnabled) return;

    setIsExporting(true);
    setShowOptions(false);

    try {
      // Имитируем небольшую задержку для показа состояния загрузки
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = exportDataOnly(scenario, marketplace);
      
      if (result.success) {
        console.log('Экспорт данных завершен');
      } else {
        alert(`Ошибка экспорта: ${result.error}`);
      }
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      alert('Произошла ошибка при экспорте файла');
    } finally {
      setIsExporting(false);
    }
  };

  // Определяем стили кнопки
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:bg-gray-600';

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${!isEnabled ? disabledClasses : ''}
    ${className}
  `.trim();

  // Если нет результатов, показываем простую кнопку с подсказкой
  if (!exportInfo.canExportResults) {
    return (
      <div className="relative">
        <button
          disabled={true}
          className={buttonClasses}
          title="Сначала выполните расчет для экспорта результатов"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Экспорт...' : 'Экспорт в Excel'}
        </button>
      </div>
    );
  }

  // Если dropdown не нужен, показываем простую кнопку полного экспорта
  if (!showDropdown) {
    return (
      <button
        onClick={handleFullExport}
        disabled={!isEnabled}
        className={buttonClasses}
        title="Экспортировать сценарий в Excel"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? 'Экспорт...' : 'Экспорт в Excel'}
      </button>
    );
  }

  // Полная версия с dropdown меню
  return (
    <div className="relative">
      <div className="flex">
        {/* Основная кнопка экспорта */}
        <button
          onClick={handleFullExport}
          disabled={!isEnabled}
          className={`${buttonClasses} rounded-r-none border-r border-r-blue-500`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Экспорт...' : 'Экспорт в Excel'}
        </button>

        {/* Кнопка dropdown */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={!isEnabled}
          className={`${buttonClasses} rounded-l-none border-l-0 px-2`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown меню */}
      {showOptions && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={handleFullExport}
              disabled={!isEnabled}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium">Полный экспорт</div>
                  <div className="text-xs text-gray-500">Данные, результаты, формулы</div>
                </div>
              </div>
            </button>

            <button
              onClick={handleDataOnlyExport}
              disabled={!isEnabled}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="font-medium">Только данные</div>
                  <div className="text-xs text-gray-500">Без формул и расчетов</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Фон для закрытия dropdown */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;
