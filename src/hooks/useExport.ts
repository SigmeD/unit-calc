/**
 * Хук для экспорта данных в Excel
 * Этап 7: Экспорт данных
 */

import { useCallback } from 'react';
import { exportToExcel, exportAllScenarios, type ExportOptions } from '../utils/excelExport';
import type { Scenario, MarketplaceId } from '../types';

/**
 * Хук для управления экспортом данных
 */
export const useExport = () => {
  /**
   * Экспорт одного сценария в Excel
   */
  const exportScenario = useCallback((
    scenario: Scenario, 
    marketplace: MarketplaceId,
    options?: ExportOptions
  ) => {
    try {
      exportToExcel(scenario, marketplace, options);
      return { success: true, error: null };
    } catch (error) {
      console.error('Ошибка экспорта сценария:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка экспорта'
      };
    }
  }, []);

  /**
   * Экспорт всех сценариев в один файл
   */
  const exportMultipleScenarios = useCallback((
    scenarios: Scenario[], 
    marketplace: MarketplaceId
  ) => {
    try {
      if (scenarios.length === 0) {
        return { 
          success: false, 
          error: 'Нет сценариев для экспорта' 
        };
      }

      exportAllScenarios(scenarios, marketplace);
      return { success: true, error: null };
    } catch (error) {
      console.error('Ошибка экспорта сценариев:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка экспорта'
      };
    }
  }, []);

  /**
   * Экспорт текущего сценария с результатами
   */
  const exportCurrentScenario = useCallback((
    scenario: Scenario,
    marketplace: MarketplaceId,
    includeFormulas: boolean = true
  ) => {
    if (!scenario.results) {
      return {
        success: false,
        error: 'Невозможно экспортировать сценарий без результатов расчета'
      };
    }

    const options: ExportOptions = {
      includeFormulas,
      includeBreakdown: true,
      includeMetadata: true,
      scenarioName: scenario.name
    };

    return exportScenario(scenario, marketplace, options);
  }, [exportScenario]);

  /**
   * Быстрый экспорт только данных (без формул)
   */
  const exportDataOnly = useCallback((
    scenario: Scenario,
    marketplace: MarketplaceId
  ) => {
    const options: ExportOptions = {
      includeFormulas: false,
      includeBreakdown: true,
      includeMetadata: false,
      scenarioName: scenario.name
    };

    return exportScenario(scenario, marketplace, options);
  }, [exportScenario]);

  /**
   * Проверка возможности экспорта
   */
  const canExport = useCallback((scenario: Scenario): boolean => {
    return !!(scenario && scenario.input && scenario.results);
  }, []);

  /**
   * Получение информации о экспорте
   */
  const getExportInfo = useCallback((scenario: Scenario) => {
    const hasResults = !!scenario.results;
    const hasInputData = !!scenario.input;
    
    return {
      canExportData: hasInputData,
      canExportResults: hasResults,
      canExportFull: hasInputData && hasResults,
      scenarioName: scenario.name || 'Без названия',
      lastUpdated: scenario.updatedAt
    };
  }, []);

  return {
    // Основные функции экспорта
    exportScenario,
    exportMultipleScenarios,
    exportCurrentScenario,
    exportDataOnly,
    
    // Утилиты
    canExport,
    getExportInfo
  };
};

export default useExport;
