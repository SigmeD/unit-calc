/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирует число как валюту
 */
export const formatCurrency = (value: number, currency: string = '₽'): string => {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
  
  return `${formatted} ${currency}`;
};

/**
 * Форматирует число как процент
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Форматирует число с разделителями тысяч
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Форматирует дату
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Форматирует размер файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Форматирует время выполнения
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}мс`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}с`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}м ${remainingSeconds}с`;
};

/**
 * Форматирует статус
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'profit': 'Прибыль',
    'loss': 'Убыток',
    'breakeven': 'Безубыточность',
    'completed': 'Завершено',
    'in-progress': 'В работе',
    'planned': 'Запланировано'
  };
  
  return statusMap[status] || status;
};

/**
 * Форматирует название маркетплейса
 */
export const formatMarketplaceName = (id: string): string => {
  const nameMap: Record<string, string> = {
    'wildberries': 'Wildberries',
    'ozon': 'Ozon'
  };
  
  return nameMap[id] || id;
};

