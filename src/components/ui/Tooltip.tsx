import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  disabled = false,
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    setShouldShow(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    setShouldShow(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Позиционирование tooltip
  const getTooltipPosition = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg';
    const arrowClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (placement) {
      case 'top':
        return {
          tooltip: `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`,
          arrow: `${arrowClasses} top-full left-1/2 transform -translate-x-1/2 -mt-1`
        };
      case 'bottom':
        return {
          tooltip: `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`,
          arrow: `${arrowClasses} bottom-full left-1/2 transform -translate-x-1/2 -mb-1`
        };
      case 'left':
        return {
          tooltip: `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`,
          arrow: `${arrowClasses} left-full top-1/2 transform -translate-y-1/2 -ml-1`
        };
      case 'right':
        return {
          tooltip: `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`,
          arrow: `${arrowClasses} right-full top-1/2 transform -translate-y-1/2 -mr-1`
        };
      default:
        return {
          tooltip: `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`,
          arrow: `${arrowClasses} top-full left-1/2 transform -translate-x-1/2 -mt-1`
        };
    }
  };

  const positions = getTooltipPosition();

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {shouldShow && (
        <div
          ref={tooltipRef}
          className={`${positions.tooltip} transition-opacity duration-200 max-w-xs ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } pointer-events-none`}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          <div className={positions.arrow} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
