import React, { useState } from 'react';
import { Tooltip, ProgressBar, LoadingSpinner, Button } from './components/ui';
import GlossaryModal from './components/ui/GlossaryModal';

const TestComponents: React.FC = () => {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [progress, setProgress] = useState(45);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Тестирование компонентов</h1>
      
      {/* Tooltip тест */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Tooltip</h2>
        <div className="space-x-4">
          <Tooltip content="Это тест tooltip сверху" placement="top">
            <Button variant="primary">Tooltip сверху</Button>
          </Tooltip>
          
          <Tooltip content="Это тест tooltip снизу" placement="bottom">
            <Button variant="secondary">Tooltip снизу</Button>
          </Tooltip>
          
          <Tooltip content="Это тест tooltip слева" placement="left">
            <Button variant="outline">Tooltip слева</Button>
          </Tooltip>
          
          <Tooltip content="Это тест tooltip справа" placement="right">
            <Button variant="ghost">Tooltip справа</Button>
          </Tooltip>
        </div>
      </div>

      {/* ProgressBar тест */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">ProgressBar</h2>
        <div className="space-y-4">
          <ProgressBar
            progress={progress}
            label="Прогресс заполнения"
            color="blue"
            size="md"
          />
          
          <ProgressBar
            progress={85}
            label="Готовность"
            color="green"
            size="lg"
          />
          
          <ProgressBar
            progress={25}
            color="red"
            size="sm"
          />
          
          <div className="flex space-x-2">
            <Button onClick={() => setProgress(Math.max(0, progress - 10))}>-10%</Button>
            <Button onClick={() => setProgress(Math.min(100, progress + 10))}>+10%</Button>
          </div>
        </div>
      </div>

      {/* LoadingSpinner тест */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">LoadingSpinner</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LoadingSpinner size="sm" text="Малый" />
          <LoadingSpinner size="md" text="Средний" color="blue" />
          <LoadingSpinner size="lg" text="Большой" color="green" />
          <LoadingSpinner size="xl" text="Очень большой" color="gray" />
        </div>
        
        <div className="mt-4">
          <LoadingSpinner inline size="sm" text="Инлайн спиннер" />
        </div>
      </div>

      {/* Глоссарий тест */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">GlossaryModal</h2>
        <Button 
          variant="primary" 
          onClick={() => setIsGlossaryOpen(true)}
        >
          Открыть глоссарий
        </Button>
      </div>

      <GlossaryModal 
        isOpen={isGlossaryOpen} 
        onClose={() => setIsGlossaryOpen(false)} 
      />
    </div>
  );
};

export default TestComponents;
