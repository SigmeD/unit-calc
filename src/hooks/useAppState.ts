import { useCallback, useReducer, useMemo, useEffect } from 'react';
import { useScenarios } from './useScenarios';
import type { 
  AppState, 
  AppAction, 
  MarketplaceId, 
  CalculationInput, 
  CalculationResults,
  Scenario 
} from '@/types';

// Начальное состояние приложения
const initialState: AppState = {
  selectedMarketplace: 'wildberries' as MarketplaceId,
  currentScenario: null,
  scenarios: [],
  input: {
    purchasePrice: 0,
    deliveryToWarehouse: 0,
    packaging: 0,
    otherCOGS: 0,
    commission: 15,
    logistics: 0,
    storage: 0,
    returnProcessing: 0,
    pickupRate: 70,
    returnRate: 15,
    advertising: 0,
    otherVariableCosts: 0,
    fixedCostsPerMonth: 0,
    expectedSalesPerMonth: 100,
    taxRegime: 'USN_6',
    retailPrice: 1000,
    sellerDiscount: 0,
    additionalPromo: 0,
    specificData: {}
  },
  results: null,
  isCalculating: false,
  errors: {}
};

// Редьюсер для управления состоянием
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_MARKETPLACE':
      return {
        ...state,
        selectedMarketplace: action.payload,
        errors: {} // Сбрасываем ошибки при смене маркетплейса
      };
      
    case 'UPDATE_INPUT':
      return {
        ...state,
        input: {
          ...state.input,
          ...action.payload
        }
        // Не сбрасываем results - пусть показываются старые до получения новых
      };
      
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        isCalculating: false
      };
      
    case 'SAVE_SCENARIO': {
      const newScenario: Scenario = {
        ...action.payload,
        id: `scenario_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return {
        ...state,
        scenarios: [...state.scenarios, newScenario],
        currentScenario: newScenario.id
      };
    }
      
    case 'LOAD_SCENARIO': {
      const scenario = state.scenarios.find(s => s.id === action.payload);
      if (scenario) {
        return {
          ...state,
          currentScenario: action.payload,
          input: scenario.input,
          results: scenario.results || null
        };
      }
      return state;
    }
      
    case 'DELETE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.filter(s => s.id !== action.payload),
        currentScenario: state.currentScenario === action.payload ? null : state.currentScenario
      };

    case 'LOAD_SCENARIOS':
      return {
        ...state,
        scenarios: action.payload
      };

    case 'UPDATE_SCENARIO': {
      return {
        ...state,
        scenarios: state.scenarios.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    }

    case 'NEW_SCENARIO':
      return {
        ...state,
        currentScenario: null,
        input: {
          purchasePrice: 0,
          deliveryToWarehouse: 0,
          packaging: 0,
          otherCOGS: 0,
          commission: state.selectedMarketplace === 'wildberries' ? 17 : 15,
          logistics: state.selectedMarketplace === 'wildberries' ? 0 : 35,
          storage: 0,
          returnProcessing: 0,
          pickupRate: state.selectedMarketplace === 'wildberries' ? 70 : 65,
          returnRate: state.selectedMarketplace === 'wildberries' ? 15 : 20,
          advertising: 0,
          otherVariableCosts: 0,
          fixedCostsPerMonth: 0,
          expectedSalesPerMonth: 100,
          taxRegime: 'USN_6',
          retailPrice: 1000,
          sellerDiscount: 0,
          additionalPromo: 0,
          specificData: {}
        },
        results: null,
        errors: {}
      };
      
    case 'SET_CALCULATING':
      return {
        ...state,
        isCalculating: action.payload
      };
      
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {}
      };
      
    default:
      return state;
  }
};

/**
 * Хук для управления глобальным состоянием приложения
 */
export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    loadScenariosFromStorage,
    saveScenario: saveScenarioToStorage,
    deleteScenario: deleteScenarioFromStorage
  } = useScenarios();

  // Загружаем сценарии из LocalStorage при инициализации
  useEffect(() => {
    const savedScenarios = loadScenariosFromStorage();
    if (savedScenarios.length > 0) {
      dispatch({ type: 'LOAD_SCENARIOS', payload: savedScenarios });
    }
  }, [loadScenariosFromStorage]);
  
  // Действия
  const setMarketplace = useCallback((marketplaceId: MarketplaceId) => {
    dispatch({ type: 'SET_MARKETPLACE', payload: marketplaceId });
  }, []);
  
  const updateInput = useCallback((input: Partial<CalculationInput>) => {
    dispatch({ type: 'UPDATE_INPUT', payload: input });
  }, []);
  
  const setResults = useCallback((results: CalculationResults) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  }, []);
  
  const saveScenario = useCallback((scenario: Scenario) => {
    // Сохраняем в LocalStorage
    saveScenarioToStorage(scenario);
    
    // Обновляем состояние
    if (state.scenarios.find(s => s.id === scenario.id)) {
      dispatch({ type: 'UPDATE_SCENARIO', payload: scenario });
    } else {
      dispatch({ type: 'SAVE_SCENARIO', payload: scenario });
    }
  }, [saveScenarioToStorage, state.scenarios]);
  
  const loadScenario = useCallback((scenarioId: string) => {
    dispatch({ type: 'LOAD_SCENARIO', payload: scenarioId });
  }, []);
  
  const deleteScenario = useCallback((scenarioId: string) => {
    // Удаляем из LocalStorage
    deleteScenarioFromStorage(scenarioId);
    
    // Обновляем состояние
    dispatch({ type: 'DELETE_SCENARIO', payload: scenarioId });
  }, [deleteScenarioFromStorage]);

  const newScenario = useCallback(() => {
    dispatch({ type: 'NEW_SCENARIO' });
  }, []);
  
  const setCalculating = useCallback((isCalculating: boolean) => {
    dispatch({ type: 'SET_CALCULATING', payload: isCalculating });
  }, []);
  
  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);
  
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Вспомогательная функция для сравнения input объектов
  const isInputEqual = useCallback((input1: CalculationInput, input2: CalculationInput): boolean => {
    const keys: (keyof CalculationInput)[] = [
      'purchasePrice', 'retailPrice', 'deliveryToWarehouse', 'packaging', 
      'commission', 'logistics', 'advertising', 'fixedCostsPerMonth'
    ];
    
    return keys.every(key => input1[key] === input2[key]);
  }, []);
  
  // Мемоизированные утилиты для лучшей производительности
  const getCurrentScenario = useMemo((): Scenario | null => {
    if (!state.currentScenario) return null;
    return state.scenarios.find(s => s.id === state.currentScenario) || null;
  }, [state.currentScenario, state.scenarios]);
  
  const hasUnsavedChanges = useMemo((): boolean => {
    const currentScenario = getCurrentScenario;
    if (!currentScenario) return true;
    
    // Глубокое сравнение ключевых полей (более эффективно чем JSON.stringify)
    return !isInputEqual(currentScenario.input, state.input);
  }, [getCurrentScenario, state.input, isInputEqual]);
  
  return {
    // Состояние
    selectedMarketplace: state.selectedMarketplace,
    currentScenario: state.currentScenario,
    scenarios: state.scenarios,
    input: state.input,
    results: state.results,
    isCalculating: state.isCalculating,
    errors: state.errors,
    
    // Действия
    setMarketplace,
    updateInput,
    setResults,
    saveScenario,
    loadScenario,
    deleteScenario,
    newScenario,
    setCalculating,
    setErrors,
    clearErrors,
    
    // Утилиты
    getCurrentScenario,
    hasUnsavedChanges
  };
};

export default useAppState;
