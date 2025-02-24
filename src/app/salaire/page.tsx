'use client';
import { ChangeEvent, useState, useMemo } from 'react';
import { Header } from '@/components/salary/Header';
import { Footer } from '@/components/salary/Footer';
import { ContractOptions } from '@/components/salary/ContractOptions';
import { GenderSelector } from '@/components/salary/GenderSelector';
import { ChildrenSection } from '@/components/salary/ChildrenSection';
import { OtherDeductions } from '@/components/salary/OtherDeductions';
import { AllowancesSection } from '@/components/salary/AllowancesSection';
import { ResultTabs } from '@/components/salary/ResultTabs';
import { SalaryInput } from '@/components/salary/SalaryInput';
import { SalaryType, CalculatorMode, FormData, SalaryTabData } from '@/types/salary';
import { standardizeNumber, getNumericValue } from '@/utils/number';
import { calculateResults, calculateFromNet, calculateFromGross } from '@/utils/salary';
import { TaxTable } from '@/components/salary/TaxTable';

const generateBasicTabs = (results: any, salaryType: SalaryType, isAnnual: boolean): SalaryTabData[] => {
  const isNetSalary = salaryType === SalaryType.NET;
  const multiplier = isAnnual ? 12 : 1;
  const periodLabel = isAnnual ? 'annuel' : 'mensuel';
  const periodDescriptor = isAnnual ? 'par an' : 'par mois';

  return [
    {
      id: isNetSalary ? 'brut' : 'net',
      label: `Salaire ${isNetSalary ? 'brut' : 'net'} ${periodLabel}`,
      icon: isNetSalary ? '💵' : '💰',
      value: (isNetSalary ? results.grossSalary : results.netSalary) * multiplier,
      description: `${isNetSalary ? 'Montant avant déductions' : 'Montant final après déductions'} (${periodDescriptor})`,
      tooltip: isNetSalary 
        ? `Le salaire brut ${periodLabel} comprend le salaire avant toutes les déductions sociales et fiscales.`
        : `Le salaire net ${periodLabel} est le montant que vous recevez effectivement ${periodDescriptor} après toutes les déductions sociales et fiscales.`,
      formula: isNetSalary ? 'Salaire net + Déductions' : 'Salaire brut - Déductions'
    },
    {
      id: 'deductions',
      label: `Déductions ${periodLabel}s`,
      icon: '📊',
      value: (results.cnss + results.irpp + results.css) * multiplier,
      description: `Total des impôts et cotisations (${periodDescriptor})`,
      negative: true,
      tooltip: `Le total des déductions ${periodLabel}s comprend la CNSS, l'IRPP et la CSS.`,
      formula: 'CNSS + IRPP + CSS'
    }
  ];
};

const generateAdvancedTabs = (results: any): SalaryTabData[] => [
  {
    id: 'net',
    label: 'Salaire net',
    icon: '💰',
    value: results.netSalary,
    description: 'Montant final après toutes les déductions',
    tooltip: 'Le salaire net est le montant que vous recevez effectivement après toutes les déductions sociales et fiscales.',
    formula: 'Salaire brut - CNSS - IRPP - CSS'
  },
  {
    id: 'gross',
    label: 'Salaire brut',
    icon: '💵',
    value: results.grossSalary,
    description: 'Salaire de base plus les avantages',
    tooltip: 'Le salaire brut comprend le salaire de base et tous les avantages avant les déductions.',
    formula: 'Salaire de base + Avantages'
  },
  {
    id: 'allowances',
    label: 'Indemnités',
    icon: '🎁',
    value: results.sectorAllowances,
    description: 'Primes et indemnités sectorielles',
    tooltip: 'Les indemnités comprennent:\n- Prime de présence\n- Prime de transport\n- Autres avantages sectoriels',
    formula: 'Salaire de base × 0.1 (10%)'
  },
  {
    id: 'cnss',
    label: 'CNSS',
    icon: '🏥',
    value: results.cnss,
    description: 'Cotisation à la sécurité sociale',
    negative: true,
    tooltip: 'La CNSS est la contribution à la Caisse Nationale de Sécurité Sociale.',
    formula: 'Salaire brut × 9.68%'
  },
  {
    id: 'irpp',
    label: 'IRPP',
    icon: '📊',
    value: results.irpp,
    description: 'Impôt sur le revenu',
    negative: true,
    tooltip: 'L\'IRPP est calculé selon un barème progressif sur le revenu imposable annuel.',
    formula: 'Voir barème',
    table: <TaxTable annualIncome={results.revenuImposable * 12} />
  }
];

const initialFormData: FormData = {
  mode: CalculatorMode.BASIC,
  baseValue: '',
  isAnnual: false,
  isChefFamille: false,
  isSmig: false,
  cnssCode: '',
  contractType: '1',
  gender: 'homme',
  a5: 0,
  otherDeductions: '',
  otherDeductionsIsAnnual: false,
  children: [
    { rang: 1, charge: false, handicape: false, etudiant: false },
    { rang: 2, charge: false, handicape: false, etudiant: false },
    { rang: 3, charge: false, handicape: false, etudiant: false },
    { rang: 4, charge: false, handicape: false, etudiant: false }
  ],
  salaryType: SalaryType.BASE,
  inputValue: '',
  allowances: []
};

const SalarySimulator = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!e.target) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChildChange = (rang: number, field: 'charge' | 'handicape' | 'etudiant') => (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      children: prev.children.map(child =>
        child.rang === rang ? { ...child, [field]: checked } : child
      )
    }));
  };

  const handleNumberOfChildrenChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, index) => ({
        ...child,
        charge: index < value
      }))
    }));
  };

  const handleModeChange = (mode: CalculatorMode) => {
    setFormData(prev => ({ ...prev, mode }));
  };

  const results = useMemo(() => calculateResults(getNumericValue(formData.baseValue), {
    cnssCode: formData.cnssCode,
    contractType: formData.contractType,
    isAnnual: formData.isAnnual,
    isChefFamille: formData.isChefFamille,
    children: formData.children,
    otherDeductions: formData.otherDeductions,
    otherDeductionsIsAnnual: formData.otherDeductionsIsAnnual
  }), [formData]);

  const handleSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const standardized = standardizeNumber(e.target.value);
    const numericValue = getNumericValue(standardized);
    
    let baseValue = standardized;
    if (formData.salaryType === SalaryType.NET) {
      baseValue = calculateFromNet(numericValue, formData).toString();
    } else if (formData.salaryType === SalaryType.GROSS) {
      baseValue = calculateFromGross(numericValue).toString();
    }

    setFormData(prev => ({
      ...prev,
      inputValue: standardized,
      baseValue: baseValue
    }));
  };

  const handleSalaryTypeChange = (type: SalaryType) => {
    const numericValue = getNumericValue(formData.inputValue);
    
    let baseValue = formData.inputValue;
    if (type === SalaryType.NET) {
      baseValue = calculateFromNet(numericValue, formData).toString();
    } else if (type === SalaryType.GROSS) {
      baseValue = calculateFromGross(numericValue).toString();
    }

    setFormData(prev => ({
      ...prev,
      salaryType: type,
      baseValue: baseValue
    }));
  };

  const handleSalaryPeriodChange = (isAnnual: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAnnual
    }));
  };

  const handleOtherDeductionsPeriodChange = (isAnnual: boolean) => {
    setFormData(prev => ({
      ...prev,
      otherDeductionsIsAnnual: isAnnual
    }));
  };

  const handleBasicChildrenChange = (field: 'normal' | 'student' | 'handicapped', value: number) => {
    const updatedChildren = [...formData.children];
    let currentIndex = 0;

    // Reset all children first
    updatedChildren.forEach(child => {
      child.charge = false;
      child.etudiant = false;
      child.handicape = false;
    });

    // Set regular children
    if (field === 'normal') {
      for (let i = 0; i < value && currentIndex < 4; i++) {
        updatedChildren[currentIndex].charge = true;
        currentIndex++;
      }
    }

    // Set student children
    if (field === 'student') {
      for (let i = 0; i < value && currentIndex < 4; i++) {
        updatedChildren[currentIndex].charge = true;
        updatedChildren[currentIndex].etudiant = true;
        currentIndex++;
      }
    }

    // Set handicapped children
    if (field === 'handicapped') {
      for (let i = 0; i < value && currentIndex < 4; i++) {
        updatedChildren[currentIndex].charge = true;
        updatedChildren[currentIndex].handicape = true;
        currentIndex++;
      }
    }

    setFormData(prev => ({
      ...prev,
      children: updatedChildren
    }));
  };

  const getTotalChildren = () => {
    return formData.children.filter(c => c.charge).length;
  };

  const getChildrenByType = () => {
    const normal = formData.children.filter(c => c.charge && !c.etudiant && !c.handicape).length;
    const student = formData.children.filter(c => c.charge && c.etudiant).length;
    const handicapped = formData.children.filter(c => c.charge && c.handicape).length;
    return { normal, student, handicapped };
  };

  const isBasicMode = formData.mode === CalculatorMode.BASIC;

  return (
    <main className="min-h-screen bg-[url('/full-img-bg.png')] bg-bottom bg-cover p-2 md:p-8 pb-20 md:pb-48">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-white/20 p-4 md:p-8 space-y-6 md:space-y-10 animate-fade-in">
        <Header />

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => handleModeChange(CalculatorMode.BASIC)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                isBasicMode 
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => handleModeChange(CalculatorMode.ADVANCED)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                !isBasicMode
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Avancé
            </button>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 bg-white p-3 md:p-6 rounded-lg shadow">
          <div className="space-y-4">
            <SalaryInput
              formData={formData}
              onChange={handleSalaryChange}
              onTypeChange={handleSalaryTypeChange}
              onPeriodChange={handleSalaryPeriodChange}
            />

            {isBasicMode ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        type="checkbox"
                        id="isChefFamille"
                        name="isChefFamille"
                        checked={formData.isChefFamille}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="isChefFamille" className="text-sm text-gray-700">
                        Chef de famille?
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enfants à charge
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <NumberInput
                          label="Enfants standards"
                          value={getChildrenByType().normal}
                          onChange={(value) => handleBasicChildrenChange('normal', value)}
                          max={4 - getChildrenByType().student - getChildrenByType().handicapped}
                        />
                        <NumberInput
                          label="Enfants étudiants"
                          value={getChildrenByType().student}
                          onChange={(value) => handleBasicChildrenChange('student', value)}
                          max={4 - getChildrenByType().normal - getChildrenByType().handicapped}
                        />
                        <NumberInput
                          label="Enfants handicapés"
                          value={getChildrenByType().handicapped}
                          onChange={(value) => handleBasicChildrenChange('handicapped', value)}
                          max={4 - getChildrenByType().normal - getChildrenByType().student}
                        />
                      </div>
                      {getTotalChildren() >= 4 && (
                        <p className="mt-2 text-xs text-yellow-600">
                          Le nombre maximum d'enfants à charge est de 4
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <GenderSelector
                  value={formData.gender}
                  onChange={handleInputChange}
                />

                <ContractOptions
                  contractType={formData.contractType}
                  isChefFamille={formData.isChefFamille}
                  isSmig={formData.isSmig}
                  onChange={handleInputChange}
                />

                <ChildrenSection
                  children={formData.children}
                  onChildChange={handleChildChange}
                  onNumberChange={handleNumberOfChildrenChange}
                />

                <AllowancesSection
                  allowances={formData.allowances}
                  onChange={allowances => setFormData(prev => ({ ...prev, allowances }))}
                />

                <OtherDeductions
                  value={formData.otherDeductions}
                  isAnnual={formData.otherDeductionsIsAnnual}
                  onChange={handleInputChange}
                  onPeriodChange={handleOtherDeductionsPeriodChange}
                />
              </>
            )}

            <ResultTabs
              tabs={isBasicMode ? generateBasicTabs(results, formData.salaryType, formData.isAnnual) : generateAdvancedTabs(results)}
              annualIncome={formData.isAnnual ? getNumericValue(formData.baseValue) : getNumericValue(formData.baseValue) * 12}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
}

const NumberInput = ({ label, value, onChange, max }: NumberInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          -
        </button>
        <span className="w-8 text-center text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default SalarySimulator;