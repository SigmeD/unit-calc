import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'md',
  className = '',
  animated = false
}) => {
  // Ограничиваем прогресс от 0 до 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
    gray: 'bg-gray-600'
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Заголовок и процент */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
              {Math.round(normalizedProgress)}%
            </span>
          )}
        </div>
      )}

      {/* Прогресс-бар */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`
            ${colorClasses[color]} 
            ${sizeClasses[size]} 
            rounded-full 
            transition-all 
            duration-500 
            ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${normalizedProgress}%`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
