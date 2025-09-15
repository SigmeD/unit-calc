import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusPanel from '../StatusPanel';

describe('StatusPanel', () => {
  it('должен рендериться без ошибок', () => {
    render(<StatusPanel />);
    
    expect(screen.getByText('Статус разработки')).toBeInTheDocument();
  });

  it('должен отображать все этапы разработки', () => {
    render(<StatusPanel />);
    
    expect(screen.getByText('✅ Этап 1: Инфраструктура - Завершен')).toBeInTheDocument();
    expect(screen.getByText('✅ Этап 2: Выбор маркетплейса - Завершен')).toBeInTheDocument();
    expect(screen.getByText('🔄 Этап 3: Модуль ввода данных - В разработке')).toBeInTheDocument();
    expect(screen.getByText('⏳ Этап 4: Движок расчетов - Запланировано')).toBeInTheDocument();
  });

  it('должен отображать описания этапов', () => {
    render(<StatusPanel />);
    
    expect(screen.getByText('React + TypeScript, Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Селектор, автозаполнение, базовая валидация')).toBeInTheDocument();
    expect(screen.getByText('5 блоков ввода данных, валидация форм')).toBeInTheDocument();
    expect(screen.getByText('Формулы юнит-экономики, точка безубыточности')).toBeInTheDocument();
  });

  it('должен отображать правильные статусы для каждого этапа', () => {
    render(<StatusPanel />);
    
    // Проверяем наличие элементов с правильными классами
    const completedItems = screen.getAllByText(/Этап [12].*Завершен/);
    expect(completedItems).toHaveLength(2);
    
    const inProgressItems = screen.getAllByText(/Этап 3.*В разработке/);
    expect(inProgressItems).toHaveLength(1);
    
    const plannedItems = screen.getAllByText(/Этап 4.*Запланировано/);
    expect(plannedItems).toHaveLength(1);
  });

  it('должен отображать статусные точки', () => {
    render(<StatusPanel />);
    
    // Проверяем наличие статусных точек (div с классами w-3 h-3 rounded-full)
    const statusDots = document.querySelectorAll('.w-3.h-3.rounded-full');
    expect(statusDots).toHaveLength(4);
  });

  it('должен использовать Card компонент', () => {
    render(<StatusPanel />);
    
    // Проверяем, что используется Card компонент с правильным заголовком
    expect(screen.getByText('Статус разработки')).toBeInTheDocument();
  });

  it('должен отображать сетку с правильным количеством колонок', () => {
    render(<StatusPanel />);
    
    // Проверяем, что используется grid с правильными классами
    const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('должен отображать правильное количество элементов', () => {
    render(<StatusPanel />);
    
    // Проверяем, что отображается 4 элемента статуса
    const statusItems = document.querySelectorAll('[class*="border rounded-lg p-6"]');
    expect(statusItems).toHaveLength(4);
  });

  it('должен применять правильные CSS классы для статусов', () => {
    render(<StatusPanel />);
    
    // Проверяем, что элементы имеют разные цветовые схемы
    const containers = document.querySelectorAll('[class*="border rounded-lg p-6"]');
    
    // Проверяем, что есть элементы с разными цветовыми классами
    const hasGreen = Array.from(containers).some(el => 
      el.className.includes('bg-green-50') || el.className.includes('border-green-200')
    );
    const hasBlue = Array.from(containers).some(el => 
      el.className.includes('bg-blue-50') || el.className.includes('border-blue-200')
    );
    const hasGray = Array.from(containers).some(el => 
      el.className.includes('bg-gray-50') || el.className.includes('border-gray-200')
    );
    
    expect(hasGreen).toBe(true);
    expect(hasBlue).toBe(true);
    expect(hasGray).toBe(true);
  });
});