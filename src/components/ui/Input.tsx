import React, { useState, useEffect } from 'react';
import type { InputFieldProps } from '../../types';
import Tooltip from './Tooltip';

interface InputProps extends Omit<InputFieldProps, 'onChange'> {
  onChange: (value: number) => void;
  className?: string;
  id?: string;
  name?: string;
}

function SafeNumberInput({ value, onChange, id, placeholder, className }: any) {
  // хранить как строку – безопасно при вводе
  const [inner, setInner] = useState(value == null ? '' : String(value));

  // если value извне изменился (набор сценариев: загрузка, ресет), синхронизируем
  useEffect(() => {
    setInner(value == null ? '' : String(value));
  }, [value]);

  return (
    <input
      id={id}
      inputMode="numeric"
      value={inner}
      placeholder={placeholder}
      className={className}
      onChange={(e) => {
        // Разрешаем только цифры и запятую/точку; не парсим в число пока пользователь печатает
        const v = e.target.value;
        if (/^[\d\s.,-]*$/.test(v)) setInner(v);
      }}
      onBlur={() => {
        // На blur — чистим и передаём число наружу
        const normalized = inner.replace(/\s+/g, '').replace(',', '.');
        const num = Number(normalized);
        onChange(isNaN(num) ? 0 : num);
      }}
    />
  );
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = 'number',
  placeholder,
  tooltip,
  error,
  required = false,
  disabled = false,
  className = '',
  id
}) => {
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
          <Tooltip content={tooltip} placement="top">
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
          </Tooltip>
        )}
      </div>
      
      <div className="relative">
        <SafeNumberInput
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            input-field
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${type === 'percentage' ? 'pr-8' : ''}
            ${type === 'currency' ? 'pr-8' : ''}
          `}
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
};

export default Input;