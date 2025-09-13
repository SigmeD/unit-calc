/**
 * Unit тесты для компонента ExportButton
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportButton } from '../ExportButton';
import type { Scenario, MarketplaceId, CalculationInput } from '../../../types';

// Мок для хука useExport
const mockUseExport = {
  exportCurrentScenario: vi.fn(),
  exportDataOnly: vi.fn(),
  canExport: vi.fn(),
  getExportInfo: vi.fn(),
  exportMultipleScenarios: vi.fn(),
  isExporting: false
};

vi.mock('../../../hooks/useExport', () => ({
  useExport: () => mockUseExport
}));

describe('ExportButton', () => {
  const mockInput: CalculationInput = {
    purchasePrice: 500,
    deliveryToWarehouse: 50,
    packaging: 30,
    otherCOGS: 20,
    commission: 15,
    logistics: 100,
    storage: 50,
    returnProcessing: 10,
    pickupRate: 80,
    returnRate: 10,
    advertising: 150,
    otherVariableCosts: 25,
    fixedCostsPerMonth: 50000,
    expectedSalesPerMonth: 100,
    taxRegime: 'USN_6',
    retailPrice: 2000,
    sellerDiscount: 10,
    additionalPromo: 5,
    specificData: {}
  };

  const mockScenario: Scenario = {
    id: 'test-scenario',
    name: 'Тестовый сценарий',
    input: mockInput,
    results: {
      revenue: 1000,
      totalCosts: 800,
      profit: 200,
      profitMargin: 20,
      breakEvenPoint: 250,
      unitEconomics: {
        effectivePrice: 1800,
        totalCOGS: 600,
        variableCosts: 285,
        fixedCostsPerUnit: 500,
        contributionMargin: 915,
        unitProfit: 200
      },
      costBreakdown: {
        cogs: 600,
        marketplaceFees: 150,
        logistics: 100,
        advertising: 150,
        fixed: 500,
        tax: 108,
        other: 25
      }
    },
    createdAt: new Date().toISOString(),
    marketplace: 'wildberries'
  };

  const marketplace: MarketplaceId = 'wildberries';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Настройка базовых моков
    mockUseExport.canExport.mockReturnValue(true);
    mockUseExport.getExportInfo.mockReturnValue({
      canExportResults: true,
      scenarioName: 'Тестовый сценарий',
      hasResults: true
    });
    mockUseExport.exportCurrentScenario.mockReturnValue({ success: true });
    mockUseExport.exportDataOnly.mockReturnValue({ success: true });
  });

  describe('Базовый рендеринг', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      expect(screen.getByRole('button', { name: /экспорт в excel/i })).toBeInTheDocument();
    });

    it('должен отображать текст "Экспорт в Excel"', () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      expect(screen.getByText('Экспорт в Excel')).toBeInTheDocument();
    });

    it('должен иметь SVG иконку', () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      const mainButton = buttons[0]; // Основная кнопка экспорта
      const svg = mainButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Состояние кнопки', () => {
    it('должен быть активной когда canExport возвращает true', () => {
      mockUseExport.canExport.mockReturnValue(true);
      
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      const mainButton = buttons[0];
      expect(mainButton).not.toBeDisabled();
    });

    it('должен быть неактивной когда canExport возвращает false', () => {
      mockUseExport.canExport.mockReturnValue(false);
      
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      const mainButton = buttons[0];
      expect(mainButton).toBeDisabled();
    });

    it('должен быть неактивной когда disabled=true', () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace} 
          disabled={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      const mainButton = buttons[0];
      expect(mainButton).toBeDisabled();
    });
  });

  describe('Экспорт без результатов', () => {
    it('должен показывать подсказку когда нет результатов для экспорта', () => {
      mockUseExport.getExportInfo.mockReturnValue({
        canExportResults: false,
        scenarioName: 'Тестовый сценарий',
        hasResults: false
      });

      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('title', 'Сначала выполните расчет для экспорта результатов');
    });
  });

  describe('Простая кнопка (без dropdown)', () => {
    it('должен показывать простую кнопку когда showDropdown=false', () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace}
          showDropdown={false}
        />
      );

      // Должна быть только одна кнопка
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      
      // Кнопка должна иметь title
      expect(buttons[0]).toHaveAttribute('title', 'Экспортировать сценарий в Excel');
    });

    it('должен вызывать полный экспорт при клике на простую кнопку', async () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace}
          showDropdown={false}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockUseExport.exportCurrentScenario).toHaveBeenCalledWith(
          mockScenario,
          marketplace,
          true
        );
      });
    });
  });

  describe('Кнопка с dropdown меню', () => {
    it('должен показывать две кнопки когда showDropdown=true', () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('должен показывать dropdown меню при клике на стрелку', async () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      const dropdownButton = buttons[1]; // Вторая кнопка - dropdown

      fireEvent.click(dropdownButton);

      await waitFor(() => {
        expect(screen.getByText('Полный экспорт')).toBeInTheDocument();
        expect(screen.getByText('Только данные')).toBeInTheDocument();
      });
    });

    it('должен скрывать dropdown при клике вне меню', async () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      const dropdownButton = buttons[1];

      // Открываем dropdown
      fireEvent.click(dropdownButton);
      await waitFor(() => {
        expect(screen.getByText('Полный экспорт')).toBeInTheDocument();
      });

      // Кликаем на фон
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(screen.queryByText('Полный экспорт')).not.toBeInTheDocument();
      });
    });
  });

  describe('Функциональность экспорта', () => {
    it('должен вызывать полный экспорт при клике на основную кнопку', async () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const buttons = screen.getAllByRole('button');
      const mainButton = buttons[0];

      fireEvent.click(mainButton);

      await waitFor(() => {
        expect(mockUseExport.exportCurrentScenario).toHaveBeenCalledWith(
          mockScenario,
          marketplace,
          true
        );
      });
    });

    it('должен вызывать полный экспорт при клике на опцию в dropdown', async () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      // Открываем dropdown
      const dropdownButton = screen.getAllByRole('button')[1];
      fireEvent.click(dropdownButton);

      // Кликаем на "Полный экспорт"
      await waitFor(() => {
        const fullExportOption = screen.getByText('Полный экспорт');
        fireEvent.click(fullExportOption);
      });

      await waitFor(() => {
        expect(mockUseExport.exportCurrentScenario).toHaveBeenCalledWith(
          mockScenario,
          marketplace,
          true
        );
      });
    });

    it('должен вызывать экспорт только данных при клике на соответствующую опцию', async () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      // Открываем dropdown
      const dropdownButton = screen.getAllByRole('button')[1];
      fireEvent.click(dropdownButton);

      // Кликаем на "Только данные"
      await waitFor(() => {
        const dataOnlyOption = screen.getByText('Только данные');
        fireEvent.click(dataOnlyOption);
      });

      await waitFor(() => {
        expect(mockUseExport.exportDataOnly).toHaveBeenCalledWith(
          mockScenario,
          marketplace
        );
      });
    });
  });

  describe('Состояние загрузки', () => {
    it('должен показывать "Экспорт..." во время экспорта', async () => {
      // Правильно мокируем async функцию с задержкой
      mockUseExport.exportCurrentScenario.mockImplementation(async () => {
        // Небольшая задержка для имитации реальной работы
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
      });

      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const button = screen.getAllByRole('button')[0];
      fireEvent.click(button);

      // Проверяем, что состояние загрузки появилось
      await waitFor(() => {
        expect(screen.getByText('Экспорт...')).toBeInTheDocument();
      });
      
      // Ждем завершения экспорта
      await waitFor(() => {
        expect(screen.getByText('Экспорт в Excel')).toBeInTheDocument();
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('должен показывать alert при ошибке экспорта', async () => {
      mockUseExport.exportCurrentScenario.mockReturnValue({
        success: false,
        error: 'Ошибка тестирования'
      });

      // Мокаем alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const button = screen.getAllByRole('button')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Ошибка экспорта: Ошибка тестирования');
      });

      alertSpy.mockRestore();
    });

    it('должен обрабатывать исключения при экспорте', async () => {
      mockUseExport.exportCurrentScenario.mockImplementation(() => {
        throw new Error('Неожиданная ошибка');
      });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const button = screen.getAllByRole('button')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Ошибка при экспорте:',
          expect.any(Error)
        );
        expect(alertSpy).toHaveBeenCalledWith('Произошла ошибка при экспорте файла');
      });

      alertSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Варианты и размеры', () => {
    it('должен применять variant primary по умолчанию', () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const button = screen.getAllByRole('button')[0];
      expect(button).toHaveClass('bg-blue-600');
    });

    it('должен применять variant secondary', () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace}
          variant="secondary"
        />
      );

      const button = screen.getAllByRole('button')[0];
      expect(button).toHaveClass('bg-gray-600');
    });

    it('должен применять variant outline', () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace}
          variant="outline"
        />
      );

      const button = screen.getAllByRole('button')[0];
      expect(button).toHaveClass('border', 'border-blue-600', 'text-blue-600');
    });

    it('должен применять размер md по умолчанию', () => {
      render(
        <ExportButton scenario={mockScenario} marketplace={marketplace} />
      );

      const button = screen.getAllByRole('button')[0];
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('должен применять размер lg', () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace}
          size="lg"
        />
      );

      const button = screen.getAllByRole('button')[0];
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });
  });

  describe('Пользовательские CSS классы', () => {
    it('должен применять пользовательские CSS классы', () => {
      render(
        <ExportButton 
          scenario={mockScenario} 
          marketplace={marketplace}
          className="custom-export-button"
        />
      );

      const button = screen.getAllByRole('button')[0];
      expect(button).toHaveClass('custom-export-button');
    });
  });
});
