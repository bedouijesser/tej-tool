import { FormData } from '@/types/salary';
import { contractTypes } from '@/constants/contracts';
import { SMIG } from '@/constants/tax';

export interface ValidationError {
  field: keyof FormData | string;
  message: string;
}

export const validateFormData = (data: FormData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validators: Array<() => ValidationError | null> = [
    // Salary input validator
    () => {
      const inputValue = parseFloat(data.inputValue);
      return isNaN(inputValue) || inputValue < 0
        ? { field: 'inputValue', message: 'Le salaire doit être un nombre positif' }
        : null;
    },

    // Contract type validator
    () => !contractTypes.some(c => c.id === data.contractType)
      ? { field: 'contractType', message: 'Type de contrat invalide' }
      : null,

    // SMIG validator
    () => {
      if (data.isSmig) {
        const minValue = data.isAnnual ? SMIG.MONTHLY_40H * 12 : SMIG.MONTHLY_40H;
        const inputValue = parseFloat(data.inputValue);
        return inputValue < minValue
          ? { field: 'inputValue', message: `Le salaire ne peut pas être inférieur au SMIG (${minValue.toFixed(3)} TND)` }
          : null;
      }
      return null;
    },

    // Children validator
    () => {
      const chargedChildren = (data.children || []).filter(c => c.charge).length;
      return chargedChildren > 4
        ? { field: 'children', message: 'Le nombre maximum d\'enfants à charge est de 4' }
        : null;
    },

    // Allowances validator
    ...(data.allowances || []).map(allowance => () => {
      const value = parseFloat(allowance.value);
      return allowance.value && (isNaN(value) || value < 0)
        ? { field: `allowance_${allowance.id}`, message: `L'indemnité "${allowance.id}" doit être un nombre positif` }
        : null;
    }),

    // Other deductions validator
    () => {
      const otherDeductions = parseFloat(data.otherDeductions);
      return data.otherDeductions && (isNaN(otherDeductions) || otherDeductions < 0)
        ? { field: 'otherDeductions', message: 'Les déductions doivent être un nombre positif' }
        : null;
    }
  ];

  validators.forEach(validate => {
    const error = validate();
    if (error) errors.push(error);
  });

  return errors;
};