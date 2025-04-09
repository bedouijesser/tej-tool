"use client";
import { Allowance } from '@/types/salary';
import { ALLOWANCE_TYPES } from '@/constants/allowances';
import { formatInputValue, standardizeNumber } from '@/utils/number';

interface Props {
  allowances: Allowance[];
  onChangeAction: (allowances: Allowance[]) => void;
}

export const AllowancesSection = ({ allowances, onChangeAction }: Props) => {
  const handleAllowanceChange = (id: string, field: keyof Allowance, value: string | boolean) => {
    const updatedAllowances = allowances.map(allowance => {
      if (allowance.id === id) {
        if (field === 'value') {
          return { ...allowance, value: standardizeNumber(value as string) };
        }
        if (field === 'isAnnual') {
          return { ...allowance, isAnnual: Boolean(value) };
        }
        return allowance;
      }
      return allowance;
    });
    onChangeAction(updatedAllowances);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Indemnités et primes</h3>
      </div>

      <div className="space-y-3">
        {allowances.map((allowance) => {
          const type = ALLOWANCE_TYPES.find(t => t.id === allowance.id);
          if (!type) return null;

          return (
            <AllowanceInput
              key={allowance.id}
              allowance={allowance}
              type={type}
              onChange={handleAllowanceChange}
            />
          );
        })}
      </div>
    </div>
  );
};

interface AllowanceInputProps {
  allowance: Allowance;
  type: { id: string; label: string; description?: string };
  onChange: (id: string, field: keyof Allowance, value: string | boolean) => void;
}

const AllowanceInput = ({ allowance, type, onChange }: AllowanceInputProps) => (
  <div className="flex gap-3">
    <div className="flex-1">
      <div className="relative">
        <input
          type="text"
          value={formatInputValue(allowance.value)}
          onChange={(e) => onChange(allowance.id, 'value', e.target.value)}
          placeholder="0"
          className="w-full pl-12 pr-20 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          TND
        </span>
        <select
          value={allowance.isAnnual ? "annual" : "monthly"}
          onChange={(e) => onChange(allowance.id, 'isAnnual', e.target.value === "annual")}
          className="absolute right-1 top-1 h-[calc(100%-0.25rem)] px-3 py-2 border-l border-gray-300 bg-gray-50 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="monthly">Mens.</option>
          <option value="annual">Ann.</option>
        </select>
      </div>
      <div className="mt-1">
        <label className="text-xs text-gray-500">{type.label}</label>
        {type.description && (
          <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
        )}
      </div>
    </div>
  </div>
);