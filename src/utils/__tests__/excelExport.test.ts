/**
 * Тесты для модуля экспорта Excel
 * Этап 7: Экспорт данных
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { exportToExcel, exportAllScenarios, type ExportOptions } from '../excelExport';
import type { Scenario, CalculationResults, CalculationInput } from '../../types';

// Мокаем XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn(() => ({ '!cols': [], '!ref': 'A1:C10' })),
    encode_cell: vi.fn((cell) => `${String.fromCharCode(65 + cell.c)}${cell.r + 1}`)
  },
  writeFile: vi.fn()
}));

// Тестовые данные
const mockInput: CalculationInput = {
  purchasePrice: 1000,
  deliveryToWarehouse: 50,
  packaging: 30,
  otherCOGS: 20,
  commission: 15,
  logistics: 100,
  storage: 25,
  returnProcessing: 5,
  pickupRate: 85,
  returnRate: 10,
  advertising: 200,
  otherVariableCosts: 50,
  fixedCostsPerMonth: 30000,
  expectedSalesPerMonth: 100,
  taxRegime: 'USN_6',
  retailPrice: 2000,
  sellerDiscount: 20,
  additionalPromo: 5
};

const mockResults: CalculationResults = {
  revenue: 1520,
  effectivePrice: 1520,
  effectivePickupRate: 75,
  cm1: 345,
  cm2: 145,
  netProfit: 45,
  marginPercent: 2.96,
  roi: 4.29,
  adRoi: 22.5,
  acos: 13.16,
  breakEvenPrice: 1490,
  breakEvenVolume: 98,
  status: 'profit' as const,
  breakdown: {
    totalCOGS: 1100,
    marketplaceFees: {
      commission: 228,
      logistics: 100,
      storage: 25,
      returns: 7.6,
      total: 360.6
    },
    additionalCosts: {
      advertising: 200,
      otherVariable: 50,
      fixedPerUnit: 300,
      total: 550
    },
    taxes: {
      base: 1520,
      rate: 0.06,
      amount: 91.2
    },
    totalCosts: 2101.8
  }
};

const mockScenario: Scenario = {
  id: 'test-scenario-1',
  name: 'Тестовый сценарий',
  description: 'Описание для тестирования',
  marketplace: 'wildberries',
  input: mockInput,
  results: mockResults,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02')
};

describe('excelExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToExcel', () => {
    it('должен создать новую рабочую книгу', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.utils.book_new).toHaveBeenCalled();
    });

    it('должен создать лист с входными данными', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Входные данные'
      );
    });

    it('должен создать лист с результатами если они есть', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Результаты'
      );
    });

    it('должен пропустить лист результатов если их нет', () => {
      const scenarioWithoutResults = { ...mockScenario, results: undefined };
      exportToExcel(scenarioWithoutResults, 'wildberries');
      
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const resultsCalls = calls.filter((call: any) => call[2] === 'Результаты');
      expect(resultsCalls).toHaveLength(0);
    });

    it('должен создать лист формул по умолчанию', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Формулы'
      );
    });

    it('должен пропустить лист формул если отключен в опциях', () => {
      const options: ExportOptions = { includeFormulas: false };
      exportToExcel(mockScenario, 'wildberries', options);
      
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const formulasCalls = calls.filter((call: any) => call[2] === 'Формулы');
      expect(formulasCalls).toHaveLength(0);
    });

    it('должен создать лист с детальной раскладкой по умолчанию', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Расходы'
      );
    });

    it('должен пропустить лист раскладки если отключен в опциях', () => {
      const options: ExportOptions = { includeBreakdown: false };
      exportToExcel(mockScenario, 'wildberries', options);
      
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const breakdownCalls = calls.filter((call: any) => call[2] === 'Расходы');
      expect(breakdownCalls).toHaveLength(0);
    });

    it('должен создать лист метаданных по умолчанию', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Информация'
      );
    });

    it('должен пропустить лист метаданных если отключен в опциях', () => {
      const options: ExportOptions = { includeMetadata: false };
      exportToExcel(mockScenario, 'wildberries', options);
      
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const metadataCalls = calls.filter((call: any) => call[2] === 'Информация');
      expect(metadataCalls).toHaveLength(0);
    });

    it('должен сохранить файл с корректным именем', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      expect(XLSX.writeFile).toHaveBeenCalled();
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toMatch(/^Тестовый сценарий_wildberries_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.xlsx$/);
    });

    it('должен использовать пользовательское имя сценария из опций', () => {
      const options: ExportOptions = { scenarioName: 'Пользовательское имя' };
      exportToExcel(mockScenario, 'wildberries', options);
      
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toMatch(/^Пользовательское имя_wildberries_/);
    });

    it('должен корректно обрабатывать маркетплейс Ozon', () => {
      exportToExcel(mockScenario, 'ozon');
      
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toContain('ozon');
    });
  });

  describe('exportAllScenarios', () => {
    const mockScenarios: Scenario[] = [
      mockScenario,
      {
        ...mockScenario,
        id: 'test-scenario-2',
        name: 'Второй сценарий',
        marketplace: 'ozon'
      }
    ];

    it('должен показать алерт если нет сценариев', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      exportAllScenarios([], 'wildberries');
      
      expect(alertSpy).toHaveBeenCalledWith('Нет сценариев для экспорта');
      alertSpy.mockRestore();
    });

    it('должен создать сводный лист со сравнением', () => {
      exportAllScenarios(mockScenarios, 'wildberries');
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Сравнение'
      );
    });

    it('должен создать детальные листы для каждого сценария', () => {
      exportAllScenarios(mockScenarios, 'wildberries');
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Сценарий 1'
      );
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'Сценарий 2'
      );
    });

    it('должен ограничить количество детальных листов до 5', () => {
      const manyScenarios = Array.from({ length: 10 }, (_, i) => ({
        ...mockScenario,
        id: `scenario-${i}`,
        name: `Сценарий ${i}`
      }));
      
      exportAllScenarios(manyScenarios, 'wildberries');
      
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const scenarioCalls = calls.filter((call: any) => call[2].startsWith('Сценарий'));
      expect(scenarioCalls).toHaveLength(5);
    });

    it('должен сохранить файл с корректным именем для сравнения', () => {
      exportAllScenarios(mockScenarios, 'wildberries');
      
      expect(XLSX.writeFile).toHaveBeenCalled();
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toMatch(/^Сравнение_сценариев_wildberries_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.xlsx$/);
    });

    it('должен пропустить сценарии без результатов при создании детальных листов', () => {
      const scenariosWithoutResults = [
        mockScenario,
        { ...mockScenario, id: 'no-results', results: undefined }
      ];
      
      exportAllScenarios(scenariosWithoutResults, 'wildberries');
      
      const calls = (XLSX.utils.book_append_sheet as any).mock.calls;
      const scenarioCalls = calls.filter((call: any) => call[2].startsWith('Сценарий'));
      expect(scenarioCalls).toHaveLength(1); // Только один сценарий с результатами
    });
  });

  describe('Структура данных в листах', () => {
    it('должен включать все основные блоки данных в лист входных данных', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      const aoaCall = (XLSX.utils.aoa_to_sheet as any).mock.calls[0];
      const data = aoaCall[0];
      
      // Проверяем наличие основных блоков
      const dataStr = data.flat().join('');
      expect(dataStr).toContain('БЛОК 1: СЕБЕСТОИМОСТЬ');
      expect(dataStr).toContain('БЛОК 2: РАСХОДЫ МАРКЕТПЛЕЙСА');
      expect(dataStr).toContain('БЛОК 3: ДОПОЛНИТЕЛЬНЫЕ РАСХОДЫ');
      expect(dataStr).toContain('БЛОК 4: НАЛОГИ');
      expect(dataStr).toContain('БЛОК 5: ЦЕНООБРАЗОВАНИЕ');
    });

    it('должен включать правильные значения из входных данных', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      const aoaCall = (XLSX.utils.aoa_to_sheet as any).mock.calls[0];
      const data = aoaCall[0];
      const flatData = data.flat();
      
      expect(flatData).toContain(1000); // purchasePrice
      expect(flatData).toContain(50);   // deliveryToWarehouse
      expect(flatData).toContain(15);   // commission
      expect(flatData).toContain(2000); // retailPrice
    });

    it('должен правильно форматировать маркетплейс в данных', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      const aoaCall = (XLSX.utils.aoa_to_sheet as any).mock.calls[0];
      const data = aoaCall[0];
      const flatData = data.flat();
      
      expect(flatData).toContain('Wildberries');
    });

    it('должен правильно форматировать маркетплейс Ozon', () => {
      exportToExcel({ ...mockScenario, marketplace: 'ozon' }, 'ozon');
      
      const aoaCall = (XLSX.utils.aoa_to_sheet as any).mock.calls[0];
      const data = aoaCall[0];
      const flatData = data.flat();
      
      expect(flatData).toContain('Ozon');
    });

    it('должен включать округленные результаты расчетов', () => {
      exportToExcel(mockScenario, 'wildberries');
      
      // Ищем данные листа результатов (второй вызов aoa_to_sheet)
      const calls = (XLSX.utils.aoa_to_sheet as any).mock.calls;
      const resultsCall = calls.find((_: any, index: number) => {
        // Лист результатов - второй по счету
        return index === 1;
      });
      
      if (resultsCall) {
        const data = resultsCall[0];
        const flatData = data.flat();
        
        expect(flatData).toContain(145);  // cm2 округленное
        expect(flatData).toContain(45);   // netProfit округленная
        expect(flatData).toContain(2.96); // marginPercent округленная
      }
    });
  });

  describe('Обработка ошибок', () => {
    it('должен корректно обрабатывать сценарий без результатов', () => {
      const scenarioWithoutResults = { ...mockScenario, results: undefined };
      
      expect(() => {
        exportToExcel(scenarioWithoutResults, 'wildberries');
      }).not.toThrow();
    });

    it('должен корректно обрабатывать сценарий без имени', () => {
      const scenarioWithoutName = { ...mockScenario, name: '' };
      
      expect(() => {
        exportToExcel(scenarioWithoutName, 'wildberries');
      }).not.toThrow();
      
      const [, fileName] = (XLSX.writeFile as any).mock.calls[0];
      expect(fileName).toMatch(/^Сценарий_wildberries_/);
    });

    it('должен корректно обрабатывать сценарий без описания', () => {
      const scenarioWithoutDescription = { ...mockScenario, description: undefined };
      
      expect(() => {
        exportToExcel(scenarioWithoutDescription, 'wildberries');
      }).not.toThrow();
    });

    it('должен корректно обрабатывать ошибку при записи файла', () => {
      (XLSX.writeFile as any).mockImplementation(() => {
        throw new Error('Ошибка записи файла');
      });
      
      expect(() => {
        exportToExcel(mockScenario, 'wildberries');
      }).toThrow('Ошибка записи файла');
    });
  });

  describe('Форматирование данных', () => {
    beforeEach(() => {
      // Сброс мока writeFile для каждого теста
      (XLSX.writeFile as any).mockClear();
      (XLSX.writeFile as any).mockImplementation(() => {});
    });

    it('должен правильно форматировать налоговые режимы', () => {
      const scenarios = [
        { ...mockScenario, input: { ...mockInput, taxRegime: 'USN_6' as const } },
        { ...mockScenario, input: { ...mockInput, taxRegime: 'USN_15' as const } },
        { ...mockScenario, input: { ...mockInput, taxRegime: 'OSNO' as const } }
      ];
      
      scenarios.forEach(scenario => {
        vi.clearAllMocks();
        exportToExcel(scenario, 'wildberries');
        
        const aoaCall = (XLSX.utils.aoa_to_sheet as any).mock.calls[0];
        const data = aoaCall[0];
        const flatData = data.flat();
        
        if (scenario.input.taxRegime === 'USN_6') {
          expect(flatData).toContain('УСН 6% (с доходов)');
        } else if (scenario.input.taxRegime === 'USN_15') {
          expect(flatData).toContain('УСН 15% (доходы минус расходы)');
        } else if (scenario.input.taxRegime === 'OSNO') {
          expect(flatData).toContain('ОСНО (упрощенно)');
        }
      });
    });

    it('должен правильно форматировать статус прибыльности', () => {
      const statuses = ['profit', 'loss', 'breakeven'] as const;
      const expectedFormats = ['Прибыльный', 'Убыточный', 'Безубыточный'];
      
      statuses.forEach((status, index) => {
        vi.clearAllMocks();
        const scenarioWithStatus = {
          ...mockScenario,
          results: { ...mockResults, status }
        };
        
        exportToExcel(scenarioWithStatus, 'wildberries');
        
        // Ищем данные листа результатов
        const calls = (XLSX.utils.aoa_to_sheet as any).mock.calls;
        const resultsCall = calls.find((_: any, callIndex: number) => callIndex === 1);
        
        if (resultsCall) {
          const data = resultsCall[0];
          const flatData = data.flat();
          expect(flatData).toContain(expectedFormats[index]);
        }
      });
    });

    it('должен включать текущую дату в данные', () => {
      const today = new Date().toLocaleDateString('ru-RU');
      
      exportToExcel(mockScenario, 'wildberries');
      
      const aoaCall = (XLSX.utils.aoa_to_sheet as any).mock.calls[0];
      const data = aoaCall[0];
      const flatData = data.flat();
      
      expect(flatData).toContain(today);
    });
  });
});
