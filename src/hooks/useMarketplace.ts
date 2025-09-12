import { useState, useCallback, useEffect } from 'react';
import type { MarketplaceId, Marketplace, CalculationInput } from '../types';
import { 
  loadMarketplaces, 
  getMarketplaceById, 
  applyMarketplacePresets,
  validateMarketplaceValues,
  createInitialInput
} from '../utils/marketplaceConfig';

interface UseMarketplaceReturn {
  // Состояние
  marketplaces: Marketplace[];
  selectedMarketplace: MarketplaceId | null;
  marketplaceData: Marketplace | null;
  errors: Record<string, string>;
  
  // Действия
  selectMarketplace: (id: MarketplaceId) => void;
  applyPresets: (input: Partial<CalculationInput>) => Partial<CalculationInput>;
  validateInput: (input: CalculationInput) => boolean;
  createNewInput: () => Partial<CalculationInput>;
  
  // Утилиты
  isMarketplaceSelected: boolean;
  getSpecificFieldValue: (fieldId: string, specificData?: Record<string, string | number>) => string | number | undefined;
  updateSpecificField: (fieldId: string, value: string | number, specificData: Record<string, string | number>) => Record<string, string | number>;
}

export const useMarketplace = (
  initialMarketplace?: MarketplaceId
): UseMarketplaceReturn => {
  const [marketplaces] = useState<Marketplace[]>(() => loadMarketplaces());
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceId | null>(
    initialMarketplace || null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Получаем данные выбранного маркетплейса
  const marketplaceData = selectedMarketplace ? getMarketplaceById(selectedMarketplace) : null;
  const isMarketplaceSelected = !!selectedMarketplace;

  // Выбор маркетплейса
  const selectMarketplace = useCallback((id: MarketplaceId) => {
    setSelectedMarketplace(id);
    setErrors({}); // Сбрасываем ошибки при смене маркетплейса
  }, []);

  // Применение предустановок маркетплейса
  const applyPresets = useCallback((input: Partial<CalculationInput>): Partial<CalculationInput> => {
    if (!marketplaceData) return input;
    return applyMarketplacePresets(input, marketplaceData);
  }, [marketplaceData]);

  // Валидация входных данных
  const validateInput = useCallback((input: CalculationInput): boolean => {
    if (!marketplaceData) {
      setErrors({ general: 'Маркетплейс не выбран' });
      return false;
    }

    const validationErrors = validateMarketplaceValues(input, marketplaceData);
    setErrors(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  }, [marketplaceData]);

  // Создание начальных данных для нового сценария
  const createNewInput = useCallback((): Partial<CalculationInput> => {
    if (!marketplaceData) {
      return {};
    }
    return createInitialInput(marketplaceData);
  }, [marketplaceData]);

  // Получение значения специфичного поля
  const getSpecificFieldValue = useCallback((
    fieldId: string, 
    specificData?: Record<string, string | number>
  ): string | number | undefined => {
    return specificData?.[fieldId] || '';
  }, []);

  // Обновление специфичного поля
  const updateSpecificField = useCallback((
    fieldId: string, 
    value: string | number, 
    specificData: Record<string, string | number>
  ): Record<string, string | number> => {
    return {
      ...specificData,
      [fieldId]: value
    };
  }, []);

  // Автоматическое применение предустановок при смене маркетплейса
  useEffect(() => {
    if (selectedMarketplace && marketplaceData) {
      // Логирование для отладки (можно убрать в продакшене)
      if (import.meta.env.DEV) {
        console.log(`Маркетплейс изменен на: ${marketplaceData.name}`);
      }
    }
  }, [selectedMarketplace, marketplaceData]);

  return {
    // Состояние
    marketplaces,
    selectedMarketplace,
    marketplaceData,
    errors,
    
    // Действия
    selectMarketplace,
    applyPresets,
    validateInput,
    createNewInput,
    
    // Утилиты
    isMarketplaceSelected,
    getSpecificFieldValue,
    updateSpecificField
  };
};

export default useMarketplace;
