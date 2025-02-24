import { ChangeEvent } from 'react';
import { formatInputValue, standardizeNumber } from '@/utils/number';

interface Props {
  value: string;
  isAnnual: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPeriodChange: (isAnnual: boolean) => void;
}

export const OtherDeductions = ({ value, isAnnual, onChange, onPeriodChange }: Props) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...e,
      target: {
        ...e.target,
        value: standardizeNumber(e.target.value)
      }
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Autres déductions
      </label>
      <div className="relative">
        <input
          type="text"
          name="otherDeductions"
          value={formatInputValue(value)}
          onChange={handleInputChange}
          placeholder="0"
          className="w-full pl-12 pr-20 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          TND
        </span>
        <select
          value={isAnnual ? "annual" : "monthly"}
          onChange={(e) => onPeriodChange(e.target.value === "annual")}
          className="absolute right-1 top-1 h-[calc(100%-0.25rem)] text-xs md:text-sm  border-gray-300 bg-gray-50 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="monthly">Mensuel</option>
          <option value="annual">Annuel</option>
        </select>
        
      </div>
    </div>
  );
};
