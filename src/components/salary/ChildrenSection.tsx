import { Child } from '@/types/salary';

interface Props {
  children: Child[];
  onChildChange: (rang: number, field: 'charge' | 'handicape' | 'etudiant') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNumberChange: (value: number) => void;
}

export const ChildrenSection = ({ children, onChildChange, onNumberChange }: Props) => {
  const chargedChildren = children.filter(c => c.charge).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Enfants à charge</h3>
        <select
          value={chargedChildren}
          onChange={(e) => onNumberChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {[0, 1, 2, 3, 4].map(num => (
            <option key={num} value={num}>{num} enfant{num !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => child.charge && (
          <div key={child.rang} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">Enfant {child.rang}</h4>
            <div className="space-y-2">
              <ChildCheckbox
                label="Handicapé"
                checked={child.handicape}
                onChange={onChildChange(child.rang, 'handicape')}
              />
              <ChildCheckbox
                label="Étudiant"
                checked={child.etudiant}
                onChange={onChildChange(child.rang, 'etudiant')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChildCheckbox = ({ label, checked, onChange }: CheckboxProps) => (
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="rounded border-gray-300 text-blue-500"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);
