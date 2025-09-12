import { useCallback } from 'react';
import type { Scenario } from '../types';

const STORAGE_KEY = 'unit-calc-scenarios';
const MAX_SCENARIOS = 3;

/**
 * Хук для работы со сценариями в LocalStorage
 */
export const useScenarios = () => {
  // Загрузка сценариев из LocalStorage
  const loadScenariosFromStorage = useCallback((): Scenario[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const scenarios = JSON.parse(stored) as Scenario[];
      
      // Преобразуем строки дат обратно в Date объекты
      return scenarios.map(scenario => ({
        ...scenario,
        createdAt: new Date(scenario.createdAt),
        updatedAt: new Date(scenario.updatedAt)
      }));
    } catch (error) {
      console.error('Ошибка загрузки сценариев из LocalStorage:', error);
      return [];
    }
  }, []);

  // Сохранение сценариев в LocalStorage
  const saveScenariosToStorage = useCallback((scenarios: Scenario[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    } catch (error) {
      console.error('Ошибка сохранения сценариев в LocalStorage:', error);
    }
  }, []);

  // Сохранение нового сценария
  const saveScenario = useCallback((scenario: Scenario) => {
    const existingScenarios = loadScenariosFromStorage();
    
    // Проверяем лимит на количество сценариев
    if (existingScenarios.length >= MAX_SCENARIOS) {
      // Удаляем самый старый сценарий
      existingScenarios.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      existingScenarios.splice(0, 1);
    }
    
    const updatedScenarios = [...existingScenarios, scenario];
    saveScenariosToStorage(updatedScenarios);
    
    return scenario;
  }, [loadScenariosFromStorage, saveScenariosToStorage]);

  // Обновление существующего сценария
  const updateScenario = useCallback((scenarioId: string, updates: Partial<Scenario>) => {
    const scenarios = loadScenariosFromStorage();
    const updatedScenarios = scenarios.map(scenario => 
      scenario.id === scenarioId 
        ? { ...scenario, ...updates, updatedAt: new Date() }
        : scenario
    );
    
    saveScenariosToStorage(updatedScenarios);
    return updatedScenarios.find(s => s.id === scenarioId) || null;
  }, [loadScenariosFromStorage, saveScenariosToStorage]);

  // Удаление сценария
  const deleteScenario = useCallback((scenarioId: string) => {
    const scenarios = loadScenariosFromStorage();
    const filteredScenarios = scenarios.filter(s => s.id !== scenarioId);
    saveScenariosToStorage(filteredScenarios);
    return filteredScenarios;
  }, [loadScenariosFromStorage, saveScenariosToStorage]);

  // Получение сценария по ID
  const getScenario = useCallback((scenarioId: string): Scenario | null => {
    const scenarios = loadScenariosFromStorage();
    return scenarios.find(s => s.id === scenarioId) || null;
  }, [loadScenariosFromStorage]);

  // Проверка уникальности имени сценария
  const isNameUnique = useCallback((name: string, excludeId?: string): boolean => {
    const scenarios = loadScenariosFromStorage();
    return !scenarios.some(s => s.name === name && s.id !== excludeId);
  }, [loadScenariosFromStorage]);

  // Генерация уникального имени сценария
  const generateUniqueName = useCallback((baseName: string): string => {
    let counter = 1;
    let name = baseName;
    
    while (!isNameUnique(name)) {
      name = `${baseName} (${counter})`;
      counter++;
    }
    
    return name;
  }, [isNameUnique]);

  // Копирование сценария
  const copyScenario = useCallback((sourceScenarioId: string, newName?: string): Scenario | null => {
    const sourceScenario = getScenario(sourceScenarioId);
    if (!sourceScenario) return null;
    
    const finalName = newName || generateUniqueName(`Копия ${sourceScenario.name}`);
    
    const copiedScenario: Scenario = {
      ...sourceScenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: finalName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return saveScenario(copiedScenario);
  }, [getScenario, generateUniqueName, saveScenario]);

  // Очистка всех сценариев (для разработки)
  const clearAllScenarios = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    loadScenariosFromStorage,
    saveScenario,
    updateScenario,
    deleteScenario,
    getScenario,
    isNameUnique,
    generateUniqueName,
    copyScenario,
    clearAllScenarios,
    maxScenarios: MAX_SCENARIOS
  };
};

export default useScenarios;
