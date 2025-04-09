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
    label: 'SIVP',
    description: 'Contrat d\'insertion à la vie professionnelle',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '3',
    label: 'KARAMA',
    description: 'Contrat dignité - Programme d\'insertion professionnelle',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '4',
    label: 'CAIP',
    description: 'Contrat d\'adaptation et d\'insertion professionnelle',
    taxExempt: true,
    contractCategory: 'INTERNSHIP'
  },
  {
    id: '5',
    label: 'Autre',
    description: 'Autre type de contrat (freelance, contrat de prestation, etc.)',
    taxExempt: false,
    contractCategory: 'OTHER'
  }
];

export const isTaxExemptContract = (contractId: string): boolean => {
  return contractTypes.find(c => c.id === contractId)?.taxExempt ?? false;
};