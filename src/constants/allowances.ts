export interface AllowanceType {
  id: string;
  label: string;
  description: string;
  category: 'TRANSPORT' | 'HOUSING' | 'FOOD' | 'BONUS' | 'OTHER';
  isCommon: boolean;
}

export const ALLOWANCE_TYPES: AllowanceType[] = [
  {
    id: 'transport',
    label: 'Transport',
    description: 'Indemnité de transport',
    category: 'TRANSPORT',
    isCommon: true
  },
  {
    id: 'logement',
    label: 'Logement',
    description: 'Indemnité de logement',
    category: 'HOUSING',
    isCommon: true
  },
  {
    id: 'repas',
    label: 'Repas',
    description: 'Indemnité de repas',
    category: 'FOOD',
    isCommon: true
  },
  {
    id: 'deplacement',
    label: 'Déplacement',
    description: 'Indemnité de déplacement',
    category: 'TRANSPORT',
    isCommon: false
  },
  {
    id: 'telephone',
    label: 'Téléphone',
    description: 'Indemnité de téléphone',
    category: 'OTHER',
    isCommon: false
  },
  {
    id: 'carburant',
    label: 'Carburant',
    description: 'Indemnité de carburant',
    category: 'TRANSPORT',
    isCommon: false
  },
  {
    id: 'prime',
    label: 'Prime',
    description: 'Prime exceptionnelle',
    category: 'BONUS',
    isCommon: false
  }
];