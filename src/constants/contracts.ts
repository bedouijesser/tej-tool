interface ContractType {
  id: string;
  label: string;
  description: string;
  taxExempt: boolean;
  contractCategory: 'PERMANENT' | 'TEMPORARY' | 'INTERNSHIP' | 'OTHER';
}

export const contractTypes: ContractType[] = [
  {
    id: '1',
    label: 'CDI',
    description: 'Contrat à durée indéterminée - Contrat standard sans durée limitée',
    taxExempt: false,
    contractCategory: 'PERMANENT'
  },
  {
    id: '2',
    label: 'CDD',
    description: 'Contrat à durée déterminée - Contrat avec une date de fin fixée',
    taxExempt: false,
    contractCategory: 'TEMPORARY'
  },
  {
    id: '3',
    label: 'SIVP',
    description: 'Stage d\'initiation à la vie professionnelle - Programme pour les nouveaux diplômés',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '4',
    label: 'KARAMA',
    description: 'Contrat dignité - Programme d\'insertion professionnelle',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '5',
    label: 'Stage',
    description: 'Stage conventionné - Formation pratique en entreprise',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '6',
    label: 'CAIP',
    description: 'Contrat d\'adaptation et d\'insertion professionnelle',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '7',
    label: 'CIVP',
    description: 'Contrat d\'insertion à la vie professionnelle',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '8',
    label: 'Autre',
    description: 'Autre type de contrat (freelance, contrat de prestation, etc.)',
    taxExempt: false,
    contractCategory: 'OTHER'
  }
];

export const isTaxExemptContract = (contractId: string): boolean => {
  return contractTypes.find(c => c.id === contractId)?.taxExempt ?? false;
};