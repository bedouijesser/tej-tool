import { ChangeEvent, useState } from 'react';
import { contractTypes } from '@/constants/contracts';

interface Props {
  contractType: string;
  isChefFamille: boolean;
  isSmig: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ContractOptions = ({ contractType, isChefFamille, isSmig, onChange }: Props) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleTooltipToggle = (id: string) => {
    setShowTooltip(current => current === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Type de contrat
        </label>
        <div className="relative">
          <select
            name="contractType"
            value={contractType}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {contractTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleTooltipToggle('contract')}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showTooltip === 'contract' && (
            <div className="absolute z-10 w-64 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-sm">
              <h4 className="font-medium mb-2">Types de contrat</h4>
              <div className="space-y-2">
                {contractTypes.map(type => (
                  <div key={type.id}>
                    <span className="font-medium">{type.label}:</span>
                    <p className="text-gray-600 text-xs mt-0.5">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Options supplémentaires
        </label>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                id="isChefFamille"
                name="isChefFamille"
                checked={isChefFamille}
                onChange={onChange}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="isChefFamille" className="text-sm text-gray-700">Chef de famille</label>
              <p className="mt-0.5 text-xs text-gray-500">Déduction annuelle de 300 TND</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                id="isSmig"
                name="isSmig"
                checked={isSmig}
                onChange={onChange}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="isSmig" className="text-sm text-gray-700">SMIG</label>
              <p className="mt-0.5 text-xs text-gray-500">Salaire minimum interprofessionnel garanti</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
