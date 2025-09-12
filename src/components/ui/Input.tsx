import { forwardRef } from 'react';
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (type === 'percentage') {
      // Для процентов ограничиваем от 0 до 100
      const numValue = Math.max(0, Math.min(100, parseFloat(rawValue) || 0));
      onChange(numValue);
    } else {
      const numValue = parseFloat(rawValue) || 0;
      onChange(numValue);
    }
  };

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    if (type === 'percentage' && val > 0) {
      return val.toString();
    }
    return val.toString();
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
              className="text-gray-400 hover:text-gray-600"
              aria-label="Информация"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="number"
          value={formatValue(value)}
          onChange={handleChange}
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
