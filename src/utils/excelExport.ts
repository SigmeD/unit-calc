/**
 * Утилиты для экспорта данных в Excel
 * Этап 7: Экспорт данных
 */

import * as XLSX from 'xlsx';
import type { 
  Scenario, 
  CalculationResults, 
  CalculationInput, 
  CostBreakdown, 
  MarketplaceId 
} from '../types';

/**
 * Интерфейс для настроек экспорта
 */
export interface ExportOptions {
  includeFormulas?: boolean;
  includeBreakdown?: boolean;
  includeMetadata?: boolean;
  scenarioName?: string;
}

/**
 * Основная функция экспорта сценария в Excel
 */
export function exportToExcel(
  scenario: Scenario, 
  marketplace: MarketplaceId,
  options: ExportOptions = {}
): void {
  const {
    includeFormulas = true,
    includeBreakdown = true,
    includeMetadata = true,
    scenarioName = scenario.name || 'Сценарий'
  } = options;

  // Создаем новую рабочую книгу
  const workbook = XLSX.utils.book_new();

  // Лист 1: Входные данные
  const inputSheet = createInputDataSheet(scenario.input, marketplace);
  XLSX.utils.book_append_sheet(workbook, inputSheet, 'Входные данные');

  // Лист 2: Рассчитанные метрики
  if (scenario.results) {
    const resultsSheet = createResultsSheet(scenario.results);
    XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Результаты');
  }

  // Лист 3: Детальная раскладка расходов
  if (includeBreakdown && scenario.results) {
    const breakdownSheet = createBreakdownSheet(scenario.results.breakdown, scenario.input);
    XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Расходы');
  }

  // Лист 4: Формулы и допущения
  if (includeFormulas) {
    const formulasSheet = createFormulasSheet();
    XLSX.utils.book_append_sheet(workbook, formulasSheet, 'Формулы');
  }

  // Лист 5: Метаданные
  if (includeMetadata) {
    const metadataSheet = createMetadataSheet(scenario, marketplace);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Информация');
  }

  // Генерируем имя файла
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const fileName = `${scenarioName}_${marketplace}_${timestamp}.xlsx`;

  // Сохраняем файл
  XLSX.writeFile(workbook, fileName);
}

/**
 * Создает лист с входными данными
 */
function createInputDataSheet(input: CalculationInput, marketplace: MarketplaceId): XLSX.WorkSheet {
  const data: (string | number)[][] = [
    ['КАЛЬКУЛЯТОР ЮНИТ-ЭКОНОМИКИ', '', ''],
    ['Маркетплейс:', marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'],
    ['Дата экспорта:', new Date().toLocaleDateString('ru-RU')],
    [''],
    ['БЛОК 1: СЕБЕСТОИМОСТЬ (COGS)', '', ''],
    ['Закупочная цена, ₽', input.purchasePrice],
    ['Доставка до склада, ₽', input.deliveryToWarehouse],
    ['Упаковка и маркировка, ₽', input.packaging],
    ['Прочие расходы COGS, ₽', input.otherCOGS],
    [''],
    ['БЛОК 2: РАСХОДЫ МАРКЕТПЛЕЙСА', '', ''],
    ['Комиссия маркетплейса, %', input.commission],
    ['Логистика до клиента, ₽', input.logistics],
    ['Хранение, ₽', input.storage],
    ['Обработка возврата, %', input.returnProcessing],
    ['Процент выкупа, %', input.pickupRate],
    ['Доля возвратов, %', input.returnRate],
    [''],
    ['БЛОК 3: ДОПОЛНИТЕЛЬНЫЕ РАСХОДЫ', '', ''],
    ['Реклама на 1 продажу, ₽', input.advertising],
    ['Прочие переменные расходы, ₽', input.otherVariableCosts],
    ['Фиксированные расходы в месяц, ₽', input.fixedCostsPerMonth],
    ['Ожидаемые продажи в месяц, шт', input.expectedSalesPerMonth || 0],
    [''],
    ['БЛОК 4: НАЛОГИ', '', ''],
    ['Налоговый режим', formatTaxRegime(input.taxRegime)],
    [''],
    ['БЛОК 5: ЦЕНООБРАЗОВАНИЕ', '', ''],
    ['Розничная цена, ₽', input.retailPrice],
    ['Скидка продавца, %', input.sellerDiscount],
    ['Дополнительные промо, %', input.additionalPromo]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Настройка ширины колонок
  worksheet['!cols'] = [
    { width: 30 },
    { width: 15 },
    { width: 15 }
  ];

  // Применяем стили к заголовкам блоков
  const headerRows = [0, 4, 10, 18, 24, 26];
  headerRows.forEach(row => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } }
      };
    }
  });

  return worksheet;
}

/**
 * Создает лист с результатами расчетов
 */
function createResultsSheet(results: CalculationResults): XLSX.WorkSheet {
  const data: (string | number)[][] = [
    ['РЕЗУЛЬТАТЫ РАСЧЕТОВ', '', ''],
    [''],
    ['ОСНОВНЫЕ МЕТРИКИ', '', ''],
    ['Выручка с учетом скидок, ₽', Math.round(results.revenue * 100) / 100],
    ['Эффективная цена к оплате, ₽', Math.round(results.effectivePrice * 100) / 100],
    ['Эффективный процент выкупа, %', Math.round(results.effectivePickupRate * 100) / 100],
    [''],
    ['МАРЖИНАЛЬНАЯ ПРИБЫЛЬ', '', ''],
    ['CM1 (после MP-затрат), ₽', Math.round(results.cm1 * 100) / 100],
    ['CM2 (после рекламы), ₽', Math.round(results.cm2 * 100) / 100],
    ['Чистая прибыль, ₽', Math.round(results.netProfit * 100) / 100],
    ['Маржинальность, %', Math.round(results.marginPercent * 100) / 100],
    [''],
    ['ROI МЕТРИКИ', '', ''],
    ['Общий ROI, %', Math.round(results.roi * 100) / 100],
    ['ROI на рекламу, %', Math.round(results.adRoi * 100) / 100],
    ['ACOS/ДРР, %', Math.round(results.acos * 100) / 100],
    [''],
    ['ТОЧКА БЕЗУБЫТОЧНОСТИ', '', ''],
    ['Минимальная цена, ₽', Math.round(results.breakEvenPrice * 100) / 100],
    ['Необходимый объем, шт/мес', Math.round(results.breakEvenVolume * 100) / 100],
    [''],
    ['СТАТУС', '', ''],
    ['Прибыльность', formatStatus(results.status)]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Настройка ширины колонок
  worksheet['!cols'] = [
    { width: 30 },
    { width: 15 },
    { width: 15 }
  ];

  // Стили для заголовков
  const headerRows = [0, 2, 7, 13, 18, 22];
  headerRows.forEach(row => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '059669' } }
      };
    }
  });

  // Цветовая индикация для статуса прибыльности
  const statusCell = XLSX.utils.encode_cell({ r: 23, c: 1 });
  if (worksheet[statusCell]) {
    const statusColor = results.status === 'profit' ? '10B981' : 
                       results.status === 'loss' ? 'EF4444' : 'F59E0B';
    worksheet[statusCell].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: statusColor } }
    };
  }

  return worksheet;
}

/**
 * Создает лист с детальной раскладкой расходов
 */
function createBreakdownSheet(breakdown: CostBreakdown, input: CalculationInput): XLSX.WorkSheet {
  const data: (string | number)[][] = [
    ['ДЕТАЛЬНАЯ РАСКЛАДКА РАСХОДОВ', '', ''],
    [''],
    ['БЛОК 1: СЕБЕСТОИМОСТЬ (COGS)', '', ''],
    ['Закупочная цена, ₽', input.purchasePrice],
    ['Доставка до склада, ₽', input.deliveryToWarehouse],
    ['Упаковка и маркировка, ₽', input.packaging],
    ['Прочие расходы COGS, ₽', input.otherCOGS],
    ['ИТОГО COGS, ₽', Math.round(breakdown.totalCOGS * 100) / 100],
    [''],
    ['БЛОК 2: РАСХОДЫ МАРКЕТПЛЕЙСА', '', ''],
    ['Комиссия, ₽', Math.round(breakdown.marketplaceFees.commission * 100) / 100],
    ['Логистика, ₽', Math.round(breakdown.marketplaceFees.logistics * 100) / 100],
    ['Хранение, ₽', Math.round(breakdown.marketplaceFees.storage * 100) / 100],
    ['Возвраты, ₽', Math.round(breakdown.marketplaceFees.returns * 100) / 100],
    ['ИТОГО Маркетплейс, ₽', Math.round(breakdown.marketplaceFees.total * 100) / 100],
    [''],
    ['БЛОК 3: ДОПОЛНИТЕЛЬНЫЕ РАСХОДЫ', '', ''],
    ['Реклама, ₽', Math.round(breakdown.additionalCosts.advertising * 100) / 100],
    ['Прочие переменные, ₽', Math.round(breakdown.additionalCosts.otherVariable * 100) / 100],
    ['Фиксированные на единицу, ₽', Math.round(breakdown.additionalCosts.fixedPerUnit * 100) / 100],
    ['ИТОГО Дополнительные, ₽', Math.round(breakdown.additionalCosts.total * 100) / 100],
    [''],
    ['БЛОК 4: НАЛОГИ', '', ''],
    ['Налоговая база, ₽', Math.round(breakdown.taxes.base * 100) / 100],
    ['Налоговая ставка, %', (breakdown.taxes.rate * 100)],
    ['Сумма налога, ₽', Math.round(breakdown.taxes.amount * 100) / 100],
    [''],
    ['ИТОГО РАСХОДОВ, ₽', Math.round(breakdown.totalCosts * 100) / 100]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Настройка ширины колонок
  worksheet['!cols'] = [
    { width: 30 },
    { width: 15 },
    { width: 15 }
  ];

  // Стили для заголовков блоков
  const headerRows = [0, 2, 9, 16, 22];
  headerRows.forEach(row => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'DC2626' } }
      };
    }
  });

  // Стили для итоговых строк
  const totalRows = [7, 14, 20, 25, 27];
  totalRows.forEach(row => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'F3F4F6' } }
      };
    }
  });

  return worksheet;
}

/**
 * Создает лист с формулами и допущениями
 */
function createFormulasSheet(): XLSX.WorkSheet {
  const data: (string | number)[][] = [
    ['ФОРМУЛЫ И ДОПУЩЕНИЯ', '', ''],
    [''],
    ['ОСНОВНЫЕ ФОРМУЛЫ', '', ''],
    ['Эффективная цена', '= Розничная цена × (1 - Скидка продавца / 100) × (1 - Промо / 100)'],
    ['Эффективный выкуп', '= Процент выкупа - Процент возвратов'],
    ['Выручка', '= Эффективная цена × (Эффективный выкуп / 100)'],
    [''],
    ['МАРЖИНАЛЬНАЯ ПРИБЫЛЬ', '', ''],
    ['CM1', '= Выручка - COGS - Расходы маркетплейса'],
    ['CM2', '= CM1 - Реклама'],
    ['Чистая прибыль', '= CM2 - Прочие переменные - Доля фиксированных - Налоги'],
    ['Маржинальность', '= (Чистая прибыль / Выручка) × 100%'],
    [''],
    ['ROI МЕТРИКИ', '', ''],
    ['Общий ROI', '= (Чистая прибыль / COGS) × 100%'],
    ['ROI на рекламу', '= (Чистая прибыль / Реклама) × 100%'],
    ['ACOS/ДРР', '= (Реклама / Выручка) × 100%'],
    [''],
    ['РАСЧЕТ РАСХОДОВ', '', ''],
    ['Комиссия маркетплейса', '= Эффективная цена × (Комиссия % / 100)'],
    ['Возвраты', '= Эффективная цена × (Возвраты % / 100) × (Обработка % / 100)'],
    ['Фиксированные на единицу', '= Фиксированные в месяц / Ожидаемые продажи'],
    [''],
    ['НАЛОГИ', '', ''],
    ['УСН 6%', '= Выручка × 6%'],
    ['УСН 15%', '= (Выручка - Расходы) × 15%'],
    ['ОСНО', '= (Выручка - Расходы) × 20% (упрощенно)'],
    [''],
    ['ДОПУЩЕНИЯ И ОГРАНИЧЕНИЯ', '', ''],
    ['1. Все расчеты приведены на 1 единицу товара'],
    ['2. Фиксированные расходы распределяются равномерно'],
    ['3. Не учитываются сезонность и динамика цен'],
    ['4. Налоги рассчитываются упрощенно'],
    ['5. Возвраты учитываются как потери без возмещения'],
    ['6. Реклама распределяется равномерно на все продажи']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Настройка ширины колонок
  worksheet['!cols'] = [
    { width: 25 },
    { width: 60 },
    { width: 15 }
  ];

  // Стили для заголовков
  const headerRows = [0, 2, 7, 13, 18, 23, 28];
  headerRows.forEach(row => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '7C3AED' } }
      };
    }
  });

  return worksheet;
}

/**
 * Создает лист с метаданными
 */
function createMetadataSheet(scenario: Scenario, marketplace: MarketplaceId): XLSX.WorkSheet {
  const data: (string | number)[][] = [
    ['ИНФОРМАЦИЯ О СЦЕНАРИИ', '', ''],
    [''],
    ['ОСНОВНЫЕ ДАННЫЕ', '', ''],
    ['Название сценария', scenario.name],
    ['Описание', scenario.description || 'Не указано'],
    ['Маркетплейс', marketplace === 'wildberries' ? 'Wildberries' : 'Ozon'],
    ['Дата создания', scenario.createdAt.toLocaleDateString('ru-RU')],
    ['Дата обновления', scenario.updatedAt.toLocaleDateString('ru-RU')],
    ['Дата экспорта', new Date().toLocaleDateString('ru-RU')],
    [''],
    ['СИСТЕМНАЯ ИНФОРМАЦИЯ', '', ''],
    ['Версия калькулятора', 'MVP 0.95'],
    ['ID сценария', scenario.id],
    ['Формат экспорта', 'Excel XLSX'],
    [''],
    ['ПРИМЕЧАНИЯ', '', ''],
    ['Данный файл создан автоматически'],
    ['Калькулятором юнит-экономики для селлеров'],
    ['Все расчеты носят приблизительный характер'],
    ['Перед принятием решений рекомендуется'],
    ['дополнительная проверка всех показателей']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Настройка ширины колонок
  worksheet['!cols'] = [
    { width: 25 },
    { width: 40 },
    { width: 15 }
  ];

  // Стили для заголовков
  const headerRows = [0, 2, 10, 14];
  headerRows.forEach(row => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '6B7280' } }
      };
    }
  });

  return worksheet;
}

/**
 * Форматирует налоговый режим для отображения
 */
function formatTaxRegime(regime: string): string {
  switch (regime) {
    case 'USN_6': return 'УСН 6% (с доходов)';
    case 'USN_15': return 'УСН 15% (доходы минус расходы)';
    case 'OSNO': return 'ОСНО (упрощенно)';
    default: return regime;
  }
}

/**
 * Форматирует статус прибыльности
 */
function formatStatus(status: string): string {
  switch (status) {
    case 'profit': return 'Прибыльный';
    case 'loss': return 'Убыточный';
    case 'breakeven': return 'Безубыточный';
    default: return status;
  }
}

/**
 * Экспорт всех сценариев в один файл
 */
export function exportAllScenarios(scenarios: Scenario[], marketplace: MarketplaceId): void {
  if (scenarios.length === 0) {
    alert('Нет сценариев для экспорта');
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Создаем сводный лист со всеми сценариями
  const summaryData: (string | number)[][] = [
    ['СРАВНЕНИЕ СЦЕНАРИЕВ', '', '', '', '', ''],
    [''],
    ['Название', 'Маркетплейс', 'Чистая прибыль, ₽', 'Маржинальность, %', 'ROI, %', 'Статус']
  ];

  scenarios.forEach(scenario => {
    const results = scenario.results;
    summaryData.push([
      scenario.name,
      scenario.marketplace === 'wildberries' ? 'WB' : 'Ozon',
      results ? Math.round(results.netProfit * 100) / 100 : 'Не рассчитано',
      results ? Math.round(results.marginPercent * 100) / 100 : 'Не рассчитано',
      results ? Math.round(results.roi * 100) / 100 : 'Не рассчитано',
      results ? formatStatus(results.status) : 'Не рассчитано'
    ]);
  });

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { width: 20 },
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 15 },
    { width: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сравнение');

  // Добавляем детальные листы для каждого сценария (максимум 5)
  scenarios.slice(0, 5).forEach((scenario, index) => {
    if (scenario.results) {
      const detailSheet = createResultsSheet(scenario.results);
      XLSX.utils.book_append_sheet(workbook, detailSheet, `Сценарий ${index + 1}`);
    }
  });

  // Генерируем имя файла
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const fileName = `Сравнение_сценариев_${marketplace}_${timestamp}.xlsx`;

  // Сохраняем файл
  XLSX.writeFile(workbook, fileName);
}
