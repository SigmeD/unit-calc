import { forwardRef, useState, useRef, useEffect } from 'react';
import type { InputFieldProps } from '../../types';

interface InputProps extends Omit<InputFieldProps, 'onChange'> {
  onChange: (value: number) => void;
  className?: string;
  id?: string;
  name?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  value,
  onChange,
  type = 'number',
  placeholder,
  tooltip,
  error,
  required = false,
  min,
  max,
  step = 1,
  disabled = false,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  // Локальное состояние для отображения значения во время редактирования
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Обновляем локальное значение только когда компонент не в фокусе
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    
    // Валидируем и отправляем изменения
    const numValue = parseFloat(rawValue) || 0;
    
    if (type === 'percentage') {
      // Для процентов ограничиваем от 0 до 100
      const clampedValue = Math.max(0, Math.min(100, numValue));
      onChange(clampedValue);
    } else {
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // При потере фокуса синхронизируем отображаемое значение с реальным
    setDisplayValue(value.toString());
  };

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && (
          <div className="group relative">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Информация"
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Tooltip - только при hover на иконку */}
            <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
              <div className="relative">
                {tooltip}
                {/* Стрелочка tooltip */}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <input
          ref={ref || inputRef}
          id={inputId}
          name={name}
          type="number"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            input-field
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${type === 'percentage' ? 'pr-8' : ''}
            ${type === 'currency' ? 'pr-8' : ''}
          `}
          {...props}
        />
        
        {/* Суффикс для процентов */}
        {type === 'percentage' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">%</span>
          </div>
        )}
        
        {/* Суффикс для валюты */}
        {type === 'currency' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">₽</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
