import { TAX_BRACKETS } from '@/constants/tax';

interface Props {
  annualIncome: number;
}

export const TaxTable = ({ annualIncome }: Props) => {
  const formatNumber = (num: number) =>
    num === Infinity ? '>' : num.toLocaleString('fr-TN');

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tranche</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant max</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {TAX_BRACKETS.map((bracket, i) => {
            const isActive = annualIncome > bracket.min;
            const amount = Math.min(
              Math.max(0, annualIncome - bracket.min),
              bracket.max === Infinity ? annualIncome : bracket.max - bracket.min
            );
            const tax = amount * bracket.rate;

            return (
              <tr
                key={i}
                className={`text-sm transition-colors ${isActive ? 'bg-indigo-50' : ''}`}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                    <span>{formatNumber(bracket.min)} - {formatNumber(bracket.max)} TND</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {(bracket.rate * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {isActive && (
                    <span className="text-xs text-indigo-600">
                      {formatNumber(Math.round(tax))} TND
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
