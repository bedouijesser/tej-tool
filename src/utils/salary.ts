import { TAX_BRACKETS } from '@/constants/tax';
import { SalaryCalculationResult, SalaryInputData } from '@/types/salary';
import { getNumericValue } from './number';

export const calculateFromNet = (netSalary: number, formData: SalaryInputData): number => {
    let baseGuess = netSalary * 1.3;
    let tolerance = 0.01;
    let maxIterations = 20;
    let iteration = 0;

    while (iteration < maxIterations) {
        const testResult = calculateResults(baseGuess, formData);
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

export const calculateResults = (baseValue: number, formData: SalaryInputData): SalaryCalculationResult => {
    const ch = formData.isChefFamille ? 300 : 0;

    let [e1, e2, e3, e4] = [0, 0, 0, 0];
    formData.children.forEach((child) => {
        if (child.charge) {
            let amount = 0;
            if (!child.handicape && !child.etudiant) amount = 100;
            else if (!child.handicape && child.etudiant) amount = 1000;
            else if (child.handicape && !child.etudiant) amount = 2000;

            switch (child.rang) {
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

    const somme = e1 + e2 + e3 + e4;

    const otherDeductionsValue = formData.otherDeductionsIsAnnual ?
        getNumericValue(formData.otherDeductions) / 12 :
        getNumericValue(formData.otherDeductions);

    const revenuImposableAnnuel = (si * 12) - ch - somme;
    const fp = Math.min(revenuImposableAnnuel * 0.10, 2000);
    const baseIRPAnnuel = revenuImposableAnnuel - fp - (otherDeductionsValue * 12);

    let irpp = 0;
    let css = 0;

    if (baseIRPAnnuel > 5000) {
        css = (baseIRPAnnuel * 0.005) / 12;
    }

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

    irpp = Math.max(0, irpp / 12);
    irpp = irpp - css;

    const irppf = ['1', '2', '3', '5', '6', '7'].includes(formData.contractType) ? 0 : irpp;

    const grossSalary = si;
    const cnss = grossSalary * 0.0968;
    const netSalary = grossSalary - cnss - irppf - css;
    const sectorAllowances = si * 0.1;

    return {
        baseSalary: formData.isAnnual ? baseValue / 12 : baseValue,
        sectorAllowances,
        grossSalary,
        cnss,
        irpp: irppf,
        css,
        netSalary,
        fraisProfessionnels: fp / 12,
        revenuImposable: revenuImposableAnnuel / 12,
        baseIRP: baseIRPAnnuel / 12
    };
};