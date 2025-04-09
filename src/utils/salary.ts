import { TaxBracket } from '@/constants/tax';
import { SalaryCalculationResult, SalaryInputData } from '@/types/salary';
import { getNumericValue } from './number';
import { contractTypes } from '@/constants/contracts';

export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 5000, rate: 0 },
  { min: 5000, max: 10000, rate: 0.15 },
  { min: 10000, max: 20000, rate: 0.25 },
  { min: 20000, max: 30000, rate: 0.30 },
  { min: 30000, max: 40000, rate: 0.33 },
  { min: 40000, max: 50000, rate: 0.36 },
  { min: 50000, max: 70000, rate: 0.38 },
  { min: 70000, max: Infinity, rate: 0.40 },
];

export const calculateFromNet = (netSalary: number, formData: SalaryInputData): number => {
    let baseGuess = netSalary * 1.3;
    let tolerance = 0.01;
    let maxIterations = 20;
    let iteration = 0;

    while (iteration < maxIterations) {
        const testResult = calculateResultsFromBase(baseGuess, formData);
        const diff = testResult.netSalary - netSalary;

        if (Math.abs(diff) < tolerance) {
            return baseGuess;
        }

        baseGuess = baseGuess - (diff * 0.7);
        iteration++;
    }

    return baseGuess;
};

export const calculateFromGross = (grossSalary: number): number => {
    return grossSalary;
};

export const calculateResultsFromBase = (baseSalary: number, formData: SalaryInputData): SalaryCalculationResult => {
    const contract = contractTypes.find((c) => c.id === formData.contractType);
    
    // Convert annual to monthly if needed
    const monthlyBase = formData.isAnnual ? baseSalary / 12 : baseSalary;
    
    // Calculate gross salary (considering CNSS code 334)
    const grossSalary = formData.cnssCode === '334' ? monthlyBase - 400 : monthlyBase;

    // Calculate social security contribution (CNSS)
    const cnss = contract?.taxExempt ? 0 : grossSalary * 0.0968;

    // Calculate annual taxable income base
    const annualGross = grossSalary * 12;

    // Family head deduction
    const familyHeadDeduction = formData.isChefFamille ? 300 : 0;

    // Calculate children deductions
    let childrenDeductions = 0;
    formData.children.forEach((child) => {
        if (child.charge) {
            if (child.handicape) {
                childrenDeductions += 2000;
            } else if (child.etudiant) {
                childrenDeductions += 1000;
            } else {
                childrenDeductions += 100;
            }
        }
    });

    // Calculate annual taxable income
    const revenuImposableAnnuel = annualGross - familyHeadDeduction - childrenDeductions;

    // Professional expenses (10% with cap)
    const fraisProfessionnels = Math.min(revenuImposableAnnuel * 0.10, 2000);

    // Other deductions (monthly or annual)
    const otherDeductionsMonthly = formData.otherDeductionsIsAnnual ?
        getNumericValue(formData.otherDeductions) / 12 :
        getNumericValue(formData.otherDeductions);

    // Calculate IRP base
    const baseIRPAnnuel = revenuImposableAnnuel - fraisProfessionnels - (otherDeductionsMonthly * 12);

    // Calculate CSS (if applicable)
    let css = baseIRPAnnuel > 5000 ? (baseIRPAnnuel * 0.005) / 12 : 0;

    // Calculate IRPP
    let irpp = 0;
    let remainingIncome = baseIRPAnnuel;
    TAX_BRACKETS.forEach(bracket => {
        if (remainingIncome > bracket.min) {
            const taxableInThisBracket = Math.min(
                remainingIncome - bracket.min,
                bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min
            );
            irpp += taxableInThisBracket * bracket.rate;
            remainingIncome -= taxableInThisBracket;
        }
    });

    // Convert annual IRPP to monthly and adjust for CSS
    irpp = Math.max(0, irpp / 12);

    // Check for tax-exempt contracts
    const irppFinal = contract && contract.taxExempt ? 0 :  irpp;

    // Calculate net salary
    const netSalary = grossSalary - cnss - irppFinal - css;

    // Calculate sector allowances (10% of gross)
    const sectorAllowances = grossSalary * 0.1;

    return {
        baseSalary: monthlyBase,
        sectorAllowances,
        grossSalary,
        cnss,
        irpp: irppFinal,
        css,
        netSalary,
        fraisProfessionnels: fraisProfessionnels / 12,
        revenuImposable: revenuImposableAnnuel / 12,
        baseIRP: baseIRPAnnuel / 12
    };
};