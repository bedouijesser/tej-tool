import { ChangeEvent } from 'react';

interface Props {
  value: 'homme' | 'femme';
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export const GenderSelector = ({ value, onChange }: Props) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      Genre
    </label>
    <select
      name="gender"
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="homme">Homme</option>
      <option value="femme">Femme</option>
    </select>
  </div>
);
