"use client";
import { SalaryType, FormData, CalculatorMode } from '@/types/salary';
import { formatInputValue, standardizeNumber } from '@/utils/number';
import { ChangeEvent } from 'react';

interface Props {
  formData: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (type: SalaryType) => void;
  onPeriodChange: (isAnnual: boolean) => void;
}

export const SalaryInput = ({ formData, onChange, onTypeChange, onPeriodChange }: Props) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...e,
      target: {
        ...e.target,
        value: standardizeNumber(e.target.value)
      }
    });
  };

  const isBasicMode = formData.mode === CalculatorMode.BASIC;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {isBasicMode ? 'Salaire' : `Salaire ${formData.salaryType.toLowerCase()}`}
      </label>
      <div className="relative flex gap-2">
        <div className="relative w-full">
          <NumericInput
            name="inputValue"
            value={formData.inputValue}
            onChange={handleInputChange}
            prefix="TND"
          />
          <div className="absolute right-1 top-1 h-[calc(100%-0.5rem)] flex">
            <TypeSelector value={formData.salaryType} onChange={onTypeChange} showBase={!isBasicMode} />
            <PeriodSelector isAnnual={formData.isAnnual} onChange={onPeriodChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

const NumericInput = ({ 
  name, 
  value, 
  onChange, 
  prefix 
}: { 
  name: string; 
  value: string; 
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  prefix: string;
}) => (
  <div className="relative w-full">
    <input
      type="text"
      name={name}
      value={formatInputValue(value)}
      onChange={onChange}
      placeholder="0"
      className="w-full pl-10 md:pl-12 pr-32 md:pr-40 py-2 text-sm md:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm md:text-base">
      {prefix}
    </span>
  </div>
);

const TypeSelector = ({ 
  value, 
  onChange,
  showBase = false
}: { 
  value: SalaryType; 
  onChange: (type: SalaryType) => void;
  showBase?: boolean;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as SalaryType)}
    className="px-2 mr-1 text-xs md:text-sm border border-gray-300 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {showBase && <option value={SalaryType.BASE}>Base</option>}
    <option value={SalaryType.GROSS}>Brut</option>
    <option value={SalaryType.NET}>Net</option>
  </select>
);

const PeriodSelector = ({ 
  isAnnual, 
  onChange 
}: { 
  isAnnual: boolean; 
  onChange: (isAnnual: boolean) => void;
}) => (
  <select
    value={isAnnual ? "annual" : "monthly"}
    onChange={(e) => onChange(e.target.value === "annual")}
    className="px-2 text-xs md:text-sm border-l border-gray-300 bg-gray-50 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="monthly">Mensuel</option>
    <option value="annual">Annuel</option>
  </select>
);
