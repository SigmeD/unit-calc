import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  formatFileSize,
  formatDuration,
  formatStatus,
  formatMarketplaceName
} from '../formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1000)).toContain('1 000');
      expect(formatCurrency(1000)).toContain('₽');
      expect(formatCurrency(1500.50)).toContain('1 501');
      expect(formatCurrency(0)).toContain('0');
    });

    it('formats currency with custom symbol', () => {
      expect(formatCurrency(1000, '$')).toContain('1 000');
      expect(formatCurrency(1000, '$')).toContain('$');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage correctly', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('formats percentage with custom decimals', () => {
      expect(formatPercentage(25.567, 2)).toBe('25.57%');
      expect(formatPercentage(25.567, 0)).toBe('26%');
    });
  });

  describe('formatNumber', () => {
    it('formats number correctly', () => {
      expect(formatNumber(1000)).toContain('1 000');
      expect(formatNumber(1000.5, 1)).toContain('1 000');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('15 января 2024');
      expect(formatted).toContain('10:30');
    });
  });

  describe('formatFileSize', () => {
    it('formats file size correctly', () => {
      expect(formatFileSize(0)).toBe('0 Б');
      expect(formatFileSize(1024)).toContain('1');
      expect(formatFileSize(1024)).toContain('КБ');
      expect(formatFileSize(1048576)).toContain('1');
      expect(formatFileSize(1048576)).toContain('МБ');
      expect(formatFileSize(1073741824)).toContain('1');
      expect(formatFileSize(1073741824)).toContain('ГБ');
    });
  });

  describe('formatDuration', () => {
    it('formats duration correctly', () => {
      expect(formatDuration(500)).toBe('500мс');
      expect(formatDuration(1500)).toBe('1с');
      expect(formatDuration(65000)).toBe('1м 5с');
    });
  });

  describe('formatStatus', () => {
    it('formats status correctly', () => {
      expect(formatStatus('profit')).toBe('Прибыль');
      expect(formatStatus('loss')).toBe('Убыток');
      expect(formatStatus('completed')).toBe('Завершено');
      expect(formatStatus('unknown')).toBe('unknown');
    });
  });

  describe('formatMarketplaceName', () => {
    it('formats marketplace name correctly', () => {
      expect(formatMarketplaceName('wildberries')).toBe('Wildberries');
      expect(formatMarketplaceName('ozon')).toBe('Ozon');
      expect(formatMarketplaceName('unknown')).toBe('unknown');
    });
  });
});
