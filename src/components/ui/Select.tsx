import { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  value,
  onChange,
  options,
  placeholder,
  tooltip,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    // Пытаемся преобразовать в число, если это возможно
    const numValue = Number(selectedValue);
    onChange(isNaN(numValue) ? selectedValue : numValue);
  };

  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={selectId}
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
      
      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          input-field appearance-none bg-white
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
