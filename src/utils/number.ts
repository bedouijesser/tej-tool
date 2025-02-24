// Utility functions for number formatting
const NUMBER_FORMAT_OPTIONS = {
  fr: new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    useGrouping: true
  }),
  frCurrency: new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  })
} as const;

export const formatCurrency = (value: number): string => {
  return NUMBER_FORMAT_OPTIONS.frCurrency.format(value);
};

export const standardizeNumber = (value: string): string => {
  return value.replace(/[^0-9.,]/g, '').replace(',', '.');
};

export const formatInputValue = (value: string): string => {
  if (!value) return '';
  const num = parseFloat(standardizeNumber(value));
  return isNaN(num) ? '' : NUMBER_FORMAT_OPTIONS.fr.format(num);
};

export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  const standardized = standardizeNumber(value);
  const num = parseFloat(standardized);
  return isNaN(num) ? 0 : num;
};

export const getNumericValue = (value: string): number => {
  return parseFormattedNumber(value);
};
