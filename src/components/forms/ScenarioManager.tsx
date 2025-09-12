import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Card, ExportButton } from '../ui';
import { useScenarios } from '../../hooks/useScenarios';
import { useExport } from '../../hooks/useExport';
import type { Scenario, MarketplaceId, CalculationInput, CalculationResults } from '../../types';

interface ScenarioManagerProps {
  scenarios: Scenario[];
  currentScenarioId: string | null;
  marketplace: MarketplaceId;
  currentInput: CalculationInput;
  currentResults: CalculationResults | null;
  onScenarioLoad: (scenarioId: string) => void;
  onScenarioSave: (scenario: Scenario) => void;
  onScenarioDelete: (scenarioId: string) => void;
  onNewScenario: () => void;
}

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  existingScenario?: Scenario;
  isNameUnique: (name: string, excludeId?: string) => boolean;
}

const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingScenario,
  isNameUnique
}) => {
  const [name, setName] = useState(existingScenario?.name || '');
  const [description, setDescription] = useState(existingScenario?.description || '');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(existingScenario?.name || '');
      setDescription(existingScenario?.description || '');
      setNameError('');
    }
  }, [isOpen, existingScenario]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      setNameError('Название сценария обязательно');
      return;
    }

    if (!isNameUnique(name.trim(), existingScenario?.id)) {
      setNameError('Сценарий с таким названием уже существует');
      return;
    }

    onSave(name.trim(), description.trim() || undefined);
    onClose();
  }, [name, description, onSave, onClose, isNameUnique, existingScenario?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {existingScenario ? 'Редактировать сценарий' : 'Сохранить сценарий'}
        </h3>
        
        <div className="space-y-4">
          <Input
            label="Название сценария *"
            value={name}
            onChange={(value) => {
              setName(String(value));
              setNameError('');
            }}
            placeholder="Введите название сценария"
            error={nameError}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание сценария"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/200 символов
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            {existingScenario ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  currentScenarioId,
  marketplace,
  currentInput,
  currentResults,
  onScenarioLoad,
  onScenarioSave,
  onScenarioDelete,
  onNewScenario
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<Scenario | undefined>();
  const { 
    isNameUnique, 
    generateUniqueName,
    maxScenarios 
  } = useScenarios();
  const { exportMultipleScenarios } = useExport();

  const currentScenario = scenarios.find(s => s.id === currentScenarioId);
  const hasUnsavedChanges = currentScenario && 
    JSON.stringify(currentScenario.input) !== JSON.stringify(currentInput);

  const handleSaveClick = useCallback(() => {
    setScenarioToEdit(undefined);
    setShowSaveModal(true);
  }, []);

  const handleEditClick = useCallback((scenario: Scenario) => {
    setScenarioToEdit(scenario);
    setShowSaveModal(true);
  }, []);

  const handleSaveScenario = useCallback((name: string, description?: string) => {
    if (scenarioToEdit) {
      // Редактирование существующего сценария
      const updatedScenario: Scenario = {
        ...scenarioToEdit,
        name,
        description,
        updatedAt: new Date()
      };
      onScenarioSave(updatedScenario);
    } else {
      // Создание нового сценария
      const newScenario: Scenario = {
        id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        marketplace,
        input: currentInput,
        results: currentResults || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onScenarioSave(newScenario);
    }
  }, [scenarioToEdit, marketplace, currentInput, currentResults, onScenarioSave]);

  const handleCopyScenario = useCallback((scenario: Scenario) => {
    const copiedName = generateUniqueName(`Копия ${scenario.name}`);
    const copiedScenario: Scenario = {
      ...scenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: copiedName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    onScenarioSave(copiedScenario);
  }, [generateUniqueName, onScenarioSave]);

  const handleExportAll = useCallback(() => {
    const scenariosWithResults = scenarios.filter(s => s.results);
    if (scenariosWithResults.length === 0) {
      alert('Нет сценариев с результатами для экспорта');
      return;
    }
    
    const result = exportMultipleScenarios(scenariosWithResults, marketplace);
    if (!result.success) {
      alert(`Ошибка экспорта: ${result.error}`);
    }
  }, [scenarios, marketplace, exportMultipleScenarios]);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const getStatusColor = useCallback((results?: CalculationResults) => {
    if (!results) return 'bg-gray-100 text-gray-600';
    
    switch (results.status) {
      case 'profit':
        return 'bg-green-100 text-green-700';
      case 'loss':
        return 'bg-red-100 text-red-700';
      case 'breakeven':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }, []);

  const getStatusText = useCallback((results?: CalculationResults) => {
    if (!results) return 'Не рассчитано';
    
    switch (results.status) {
      case 'profit':
        return 'Прибыль';
      case 'loss':
        return 'Убыток';
      case 'breakeven':
        return 'Безубыток';
      default:
        return 'Неизвестно';
    }
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Сценарии расчетов</h3>
          <p className="text-sm text-gray-600">
            Сохранено {scenarios.length} из {maxScenarios} сценариев
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={onNewScenario}
            size="sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Новый
          </Button>
          
          {scenarios.filter(s => s.results).length > 1 && (
            <Button
              variant="secondary"
              onClick={handleExportAll}
              size="sm"
              title="Экспортировать все сценарии с результатами в один файл"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Экспорт всех
            </Button>
          )}
          
          <Button
            onClick={handleSaveClick}
            size="sm"
            disabled={scenarios.length >= maxScenarios && !currentScenario}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Сохранить
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              У вас есть несохраненные изменения в текущем сценарии
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mb-2">Нет сохраненных сценариев</p>
            <p className="text-sm">Создайте свой первый сценарий расчета</p>
          </div>
        ) : (
          scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`border rounded-lg p-4 transition-all ${
                scenario.id === currentScenarioId
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {scenario.name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scenario.results)}`}>
                      {getStatusText(scenario.results)}
                    </span>
                  </div>
                  
                  {scenario.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {scenario.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Создан: {formatDate(scenario.createdAt)}</span>
                    {scenario.updatedAt.getTime() !== scenario.createdAt.getTime() && (
                      <span>Изменен: {formatDate(scenario.updatedAt)}</span>
                    )}
                    <span className="capitalize">{scenario.marketplace}</span>
                  </div>
                  
                  {scenario.results && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Прибыль: </span>
                      <span className={`font-medium ${
                        scenario.results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {scenario.results.netProfit.toFixed(0)} ₽
                      </span>
                      <span className="text-gray-600 ml-4">Маржа: </span>
                      <span className="font-medium">
                        {scenario.results.marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  {scenario.id !== currentScenarioId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onScenarioLoad(scenario.id)}
                      title="Загрузить сценарий"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </Button>
                  )}
                  
                  {scenario.results && (
                    <ExportButton
                      scenario={scenario}
                      marketplace={marketplace}
                      size="sm"
                      variant="outline"
                      showDropdown={false}
                      className="!p-1 !min-w-8 border-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                    />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyScenario(scenario)}
                    title="Копировать сценарий"
                    disabled={scenarios.length >= maxScenarios}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(scenario)}
                    title="Редактировать название и описание"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onScenarioDelete(scenario.id)}
                    title="Удалить сценарий"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SaveScenarioModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveScenario}
        existingScenario={scenarioToEdit}
        isNameUnique={isNameUnique}
      />
    </Card>
  );
};

export default ScenarioManager;
