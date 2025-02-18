'use client';
import React, { ChangeEvent, useState, useMemo } from 'react';

const TAX_BRACKETS = [
    { min: 0, max: 5000, rate: 0 },
    { min: 5000, max: 10000, rate: 0.155 }, // Updated rate
    { min: 10000, max: 20000, rate: 0.255 }, // Updated rate
    { min: 20000, max: 30000, rate: 0.305 }, // Updated rate
    { min: 30000, max: 40000, rate: 0.335 }, // Updated rate
    { min: 40000, max: 50000, rate: 0.365 }, // Updated rate
    { min: 50000, max: 70000, rate: 0.385 }, // Updated rate and bracket
    { min: 70000, max: Infinity, rate: 0.405 }, // New bracket and rate
  ];

const SalarySimulator = () => {
  const [formData, setFormData] = useState({
    baseValue: '',
    isAnnual: false,
    isChefFamille: false,
    isSmig: false,
    cnssCode: '',
    contractType: '1',
    a5: 0, // Other Deductions - A5 field - keep this
    otherDeductions: '', // Renamed from a5 and string type for input handling
    otherDeductionsIsAnnual: false,
    children: [
      { rang: 1, charge: false, handicape: false, etudiant: false },
      { rang: 2, charge: false, handicape: false, etudiant: false },
      { rang: 3, charge: false, handicape: false, etudiant: false },
      { rang: 4, charge: false, handicape: false, etudiant: false }
    ]
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('base');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!e.target) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'otherDeductions' ? value : Number(value)) // Keep otherDeductions as string
    }));
  };

  const formatInputValue = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Convert to number and format with thousands separator
    const number = parseInt(digits, 10);
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('fr-TN').format(number);
  };

  const handleSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Store raw number in state
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      baseValue: numericValue
    }));
  };

  const handleOtherDeductionsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Store raw number in state
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      otherDeductions: numericValue
    }));
  };

  const handleChildChange = (rang: number, field: 'charge'| 'handicape' |'etudiant') => (e: ChangeEvent<HTMLInputElement >) => {
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

  // Helper to get numeric value, also for otherDeductions
  const getNumericValue = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };


  const results = useMemo(() => {
    setIsCalculating(true);

    const baseValue = getNumericValue(formData.baseValue);

    let ch = formData.isChefFamille ? 300 : 0;
    let smig = formData.isSmig ? 2500 : 1500;

    let [e1, e2, e3, e4] = [0, 0, 0, 0];
    formData.children.forEach((child) => {
      if (child.charge) {
        let amount = 0;
        if (!child.handicape && !child.etudiant) amount = 100;
        else if (!child.handicape && child.etudiant) amount = 1000;
        else if (child.handicape && !child.etudiant) amount = 2000;

        switch(child.rang) {
          case 1: e1 = amount; break;
          case 2: e2 = amount; break;
          case 3: e3 = amount; break;
          case 4: e4 = amount; break;
        }
      }
    });

    const si = formData.cnssCode === '334' ?
      (formData.isAnnual ? baseValue / 12 : baseValue) - 400 :
      (formData.isAnnual ? baseValue / 12 : baseValue);

    let fp = Math.min((si * 12) * 0.10, 2000);
    const somme = e1 + e2 + e3 + e4;

    // Convert otherDeductions to monthly if it's annual
    const otherDeductionsValue = formData.otherDeductionsIsAnnual ? 
      getNumericValue(formData.otherDeductions) / 12 : 
      getNumericValue(formData.otherDeductions);

    let a = (si * 12) - fp - ch - somme - (otherDeductionsValue * 12); // Use annual value for calculation
    a = Math.ceil(a);

    let irpp = 0;
    let css = "0"; // Initialize CSS

    // Calculate IRPP and CSS using updated brackets
    if (a > 5000) {
        css = ((a * 0.005) / 12).toFixed(3); // Calculate CSS
    } else {
        css = "0"; // CSS is 0 if taxable base <= 5000
    }

    let remainingIncome = a;
    TAX_BRACKETS.forEach(bracket => {
      if (remainingIncome > bracket.min) {
        const taxableInThisBracket = Math.min(
          remainingIncome - bracket.min,
          bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min
        );
        irpp += taxableInThisBracket * bracket.rate;
        remainingIncome -= taxableInThisBracket; // Correctly decrement remainingIncome
      }
    });


    irpp = Math.max(0, irpp / 12);
    irpp = irpp - parseFloat(css.toString()); // Subtract CSS from IRPP

    const irppf = ['1','2','3','5','6','7'].includes(formData.contractType) ? 0 : irpp;

    const sectorAllowances = si * 0.1;
    const grossSalary = si + sectorAllowances;
    const cnss = grossSalary * 0.0968; // Updated CNSS rate to 9.68%
    const netSalary = grossSalary - cnss - irppf;


    setTimeout(() => {
      setIsCalculating(false);
    }, 500);

    return {
      baseSalary: formData.isAnnual ? baseValue / 12 : baseValue,
      sectorAllowances,
      grossSalary,
      cnss,
      irpp: irppf,
      css: parseFloat(css.toString()), // Include CSS in results
      netSalary
    };
  }, [formData]);

  const renderSalaryInput = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Salaire de base
      </label>
      <div className="relative flex gap-2">
        <div className="relative w-full">
          <input
            type="text"
            name="baseValue"
            value={formatInputValue(formData.baseValue)}
            onChange={handleSalaryChange}
            placeholder="0"
            className="w-full pl-12 pr-20 py-2 border b-r-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            TND
          </span>
        </div>
        <select
          value={formData.isAnnual ? "annual" : "monthly"}
          onChange={(e) => setFormData(prev => ({ ...prev, isAnnual: e.target.value === "annual" }))}
          className="absolute right-1 top-1 h-[calc(100% - 0.25rem)] px-3 py-2  border-l-0 border-gray-300 bg-gray-50 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="monthly">Mensuel</option>
          <option value="annual">Annuel</option>
        </select>
      </div>
    </div>
  );

  const renderChildrenSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Enfants à charge</h3>
        <select
          value={formData.children.filter(c => c.charge).length}
          onChange={(e) => handleNumberOfChildrenChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {[0, 1, 2, 3, 4].map(num => (
            <option key={num} value={num}>{num} enfant{num !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.children.map((child) => (
          child.charge && (
            <div key={child.rang} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2">Enfant {child.rang}</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={child.handicape}
                    onChange={handleChildChange(child.rang, 'handicape')}
                    className="rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">Handicapé</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={child.etudiant}
                    onChange={handleChildChange(child.rang, 'etudiant')}
                    className="rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">Étudiant</span>
                </label>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );

  const renderOtherDeductions = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Autres déductions
      </label>
      <div className="relative">
        <input
          type="text"
          name="otherDeductions"
          value={formatInputValue(formData.otherDeductions)}
          onChange={handleOtherDeductionsChange}
          placeholder="0"
          className="w-full pl-12 pr-20 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          TND
        </span>
        <select
          value={formData.otherDeductionsIsAnnual ? "annual" : "monthly"}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            otherDeductionsIsAnnual: e.target.value === "annual" 
          }))}
          className="absolute right-1 top-1 h-[calc(100%-0.25rem)] px-3 py-2 border-l border-gray-300 bg-gray-50 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="monthly">Mensuel</option>
          <option value="annual">Annuel</option>
        </select>
      </div>
    </div>
  );

  const formatNumber = (num: number) =>
    num === Infinity ? '>' : num.toLocaleString('fr-TN');

  const renderTaxTable = () => {
    const annualIncome = (formData.isAnnual ? getNumericValue(formData.baseValue) : getNumericValue(formData.baseValue) * 12);

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
                  className={`text-sm transition-colors ${
                    isActive ? 'bg-indigo-50' : ''
                  }`}
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
                    {(bracket.rate * 100).toFixed(1)}% {/* Corrected toFixed for decimal rates */}
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

  const tabs = [
    {
      id: 'base',
      label: 'Salaire de base',
      icon: '💰',
      description: 'Votre rémunération mensuelle avant toute déduction',
      tooltip: 'Le salaire brut de base est votre rémunération principale avant ajout des primes et déduction des charges',
      value: results.baseSalary,
      formula: 'Salaire mensuel brut'
    },
    {
      id: 'allowances',
      label: 'Indemnités',
      icon: '🎁',
      description: 'Primes et indemnités sectorielles',
      tooltip: 'Les indemnités comprennent:\n- Prime de présence\n- Prime de transport\n- Autres avantages sectoriels',
      value: results.sectorAllowances,
      formula: 'Salaire de base × 0.1 (10%)'
    },
    {
      id: 'gross',
      label: 'Salaire brut',
      icon: '📊',
      description: 'Total avant prélèvements obligatoires',
      tooltip: 'Le salaire brut est la somme du salaire de base et de toutes les indemnités avant déduction des charges sociales et fiscales',
      value: results.grossSalary,
      formula: 'Salaire de base + Indemnités'
    },
    {
      id: 'cnss',
      label: 'CNSS',
      icon: '🏥',
      description: 'Cotisations sociales (nouveau taux 2025)',
      tooltip: 'La CNSS (Caisse Nationale de Sécurité Sociale) couvre:\n- Assurance maladie\n- Retraite\n- Accidents du travail\n\nNouveau taux de 9.68% applicable à partir du 1er janvier 2025 (ancien taux: 9.18%)',
      value: -results.cnss,
      formula: 'Salaire brut × 9.68%',
      negative: true
    },
    {
      id: 'css', // New tab for CSS
      label: 'CSS',
      icon: '🤝',
      description: 'Contribution Sociale Solidaire',
      tooltip: 'La CSS est une contribution de solidarité prélevée sur les revenus supérieurs à 5000 TND par an.',
      value: -results.css,
      formula: 'Base imposable annuelle × 0.5% / 12',
      negative: true
    },
    {
      id: 'irpp',
      label: 'IRPP',
      icon: '📑',
      description: 'Impôt sur le revenu',
      tooltip: 'L\'IRPP est calculé par tranches progressives sur le revenu annuel:',
      value: -results.irpp,
      formula: 'Calcul progressif par tranches',
      negative: true,
      table: renderTaxTable()
    },
    {
      id: 'net',
      label: 'Salaire net',
      icon: '💵',
      description: 'Montant final perçu',
      tooltip: 'Le salaire net est le montant que vous percevez effectivement après toutes les déductions obligatoires',
      value: results.netSalary,
      formula: 'Salaire brut - CNSS - IRPP'
    }
  ];

  const renderResultsTabs = () => (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 ease-in-out
              ${activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`
              ml-1.5 px-2 py-0.5 rounded-full text-xs
              ${activeTab === tab.id
                ? 'bg-indigo-200 text-indigo-800'
                : 'bg-gray-200 text-gray-700'
              }
            `}>
              {tab.negative ? '-' : '+'}{Math.abs(tab.value).toLocaleString('fr-TN', { maximumFractionDigits: 0 })}
            </span>
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{tab.label}</h3>
                    <p className="text-sm text-gray-500">{tab.description}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${tab.negative ? 'text-red-600' : 'text-indigo-600'}`}>
                  {tab.value.toFixed(2)} TND
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Comment est-ce calculé ?</h4>
                    <p className="mt-1 text-gray-600 whitespace-pre-line">{tab.tooltip}</p>
                    <div className="mt-3 flex items-center gap-2 text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {tab.formula}
                      </span>
                    </div>
                    {tab.table && (
                      <div className="mt-4">
                        {tab.table}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-[url('/full-img-bg.png')] bg-bottom bg-cover p-4 md:p-8 pb-24 md:pb-48 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-white rounded-xl shadow-2xl border border-white/20 p-6 md:p-8 space-y-8 md:space-y-10 animate-fade-in">
        <div className="text-center flex flex-col items-center space-y-4">
          <div className="flex items-center animate-bounce-slow">
            <div className="group relative inline-flex items-center gap-1 px-4 py-2 bg-indigo-100 text-indigo-800 text-sm rounded-full hover:bg-indigo-200 transition-all duration-300 shadow-sm overflow-hidden">
              <div className="absolute inset-0 overflow-hidden rounded-full"></div>
              <div className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(99,102,241,0.3)_0%,rgba(99,102,241,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <span className="relative z-10 flex items-center gap-1">
                <span className="animate-pulse">✨</span>
                <span>Calculez rapidement votre salaire net avec toutes les déductions</span>
              </span>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-indigo-400/0 via-indigo-400/90 to-indigo-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
            </div>
          </div>
          <h1 className="text-xl md:text-3xl font-bold mb-2">Simulateur de Salaire</h1>
          <p className="text-gray-600 text-sm md:text-base">Calculez votre salaire net avec toutes les charges sociales et fiscales</p>
        </div>

        <div className="space-y-6 bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="space-y-4">
            {renderSalaryInput()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type de contrat
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">CDI</option>
                  <option value="2">CDD</option>
                  <option value="3">SIVP</option>
                  <option value="4">Autre</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options supplémentaires
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isChefFamille"
                      checked={formData.isChefFamille}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="text-sm text-gray-700">Chef de famille</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isSmig"
                      checked={formData.isSmig}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-500"
                    />
                    <span className="text-sm text-gray-700">SMIG</span>
                  </label>
                </div>
              </div>
            </div>

            {renderChildrenSection()}
            {renderOtherDeductions()} {/* Render "Other Deductions" input here */}

            {renderResultsTabs()}
          </div>
        </div>
      </div>

      <footer className="relative md:fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t shadow-lg">
        <div className="max-w-2xl mx-auto p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-600 text-center mb-2">
            Ce simulateur est fourni à titre indicatif. Les résultats peuvent varier selon votre situation spécifique.
            <br className="hidden md:block" />
            <span className="block md:inline mt-1">
              Pour plus d'informations, consultez la {' '}
              <a
                href="https://www.cnss.tn"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                CNSS
              </a>
              {' '} ou la {' '}
              <a
                href="https://www.impots.finances.gov.tn"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Direction Générale des Impôts
              </a>
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
};

export default SalarySimulator;