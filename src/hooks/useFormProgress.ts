import { useMemo } from 'react';
import type { CalculationInput } from '../types';

interface FormProgressResult {
  progress: number;
  filledFields: number;
  totalFields: number;
  completedSections: string[];
  missingSections: string[];
  isComplete: boolean;
}

// Определяем поля по секциям с их важностью
const FORM_SECTIONS = {
  cogs: {
    name: 'Себестоимость',
    fields: ['purchasePrice', 'deliveryToWarehouse', 'packaging', 'otherCOGS'],
    required: ['purchasePrice'] // обязательные поля
  },
  marketplace: {
    name: 'Расходы маркетплейса',
    fields: ['commission', 'logistics', 'storage', 'returnProcessing', 'pickupRate', 'returnRate'],
    required: ['commission', 'pickupRate']
  },
  additional: {
    name: 'Дополнительные расходы',
    fields: ['advertising', 'otherVariableCosts', 'fixedCostsPerMonth', 'expectedSalesPerMonth'],
    required: ['expectedSalesPerMonth']
  },
  tax: {
    name: 'Налогообложение',
    fields: ['taxRegime'],
    required: ['taxRegime']
  },
  pricing: {
    name: 'Ценообразование',
    fields: ['retailPrice', 'sellerDiscount', 'additionalPromo'],
    required: ['retailPrice']
  }
};

export const useFormProgress = (input: CalculationInput): FormProgressResult => {
  return useMemo(() => {
    const completedSections: string[] = [];
    const missingSections: string[] = [];
    let totalFields = 0;
    let filledFields = 0;

    // Проверяем каждую секцию
    Object.entries(FORM_SECTIONS).forEach(([sectionKey, section]) => {
      let sectionComplete = true;
      let sectionFilledFields = 0;
      
      section.fields.forEach(field => {
        totalFields++;
        const value = input[field as keyof CalculationInput];
        
        // Проверяем заполненность поля
        const isFilled = value !== undefined && value !== null && value !== '' && value !== 0;
        
        if (isFilled) {
          filledFields++;
          sectionFilledFields++;
        }
        
        // Если поле обязательное и не заполнено, секция не готова
        if (section.required.includes(field) && !isFilled) {
          sectionComplete = false;
        }
      });
      
      // Секция считается завершенной, если заполнены все обязательные поля
      // и хотя бы 50% всех полей секции
      const sectionCompletionRate = sectionFilledFields / section.fields.length;
      const hasRequiredFields = section.required.every(field => {
        const value = input[field as keyof CalculationInput];
        return value !== undefined && value !== null && value !== '' && value !== 0;
      });
      
      if (hasRequiredFields && sectionCompletionRate >= 0.5) {
        completedSections.push(section.name);
      } else {
        missingSections.push(section.name);
      }
    });

    const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    const isComplete = missingSections.length === 0;

    return {
      progress,
      filledFields,
      totalFields,
      completedSections,
      missingSections,
      isComplete
    };
  }, [input]);
};

export default useFormProgress;
