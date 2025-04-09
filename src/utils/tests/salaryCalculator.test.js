import { calculateResultsFromBase, calculateFromNet, calculateFromGross } from '../salary';
import { SalaryType } from '@/types/salary';
import payslipData from './payslip.json';
import {contractTypes} from '../../constants/contracts';

describe('Salary Calculator', () => {
  describe('Basic Mode Calculations', () => {
    const basicFormData = {
      cnssCode: '',
      contractType: '1',
      isAnnual: false,
      isChefFamille: false,
      children: [
        { rang: 1, charge: false, handicape: false, etudiant: false },
        { rang: 2, charge: false, handicape: false, etudiant: false },
        { rang: 3, charge: false, handicape: false, etudiant: false },
        { rang: 4, charge: false, handicape: false, etudiant: false }
      ],
      otherDeductions: '',
      otherDeductionsIsAnnual: false
    };

    test('should calculate net salary from gross salary', () => {
      const result = calculateResultsFromBase(1000, basicFormData);
      expect(result.netSalary).toBeCloseTo(888.70, 2);
      expect(result.cnss).toBeCloseTo(96.80, 2);
      expect(result.irpp).toBeCloseTo(10, 2);
      expect(result.css).toBeCloseTo(4.50, 2);
    });

    test('should calculate with chef de famille deduction', () => {
      const result = calculateResultsFromBase(1000, {
        ...basicFormData,
        isChefFamille: true
      });
      expect(result.netSalary).toBeCloseTo(892.19, 2);
    });

    test('should handle children deductions', () => {
      const result = calculateResultsFromBase(1000, {
        ...basicFormData,
        children: [
          { rang: 1, charge: true, handicape: false, etudiant: false },
          { rang: 2, charge: true, handicape: false, etudiant: true },
          { rang: 3, charge: false, handicape: false, etudiant: false },
          { rang: 4, charge: false, handicape: false, etudiant: false }
        ]
      });
      expect(result.netSalary).toBeCloseTo(899.11, 2);
    });

    test('should handle annual salary input', () => {
      const result = calculateResultsFromBase(12000, {
        ...basicFormData,
        isAnnual: true
      });
      expect(result.netSalary).toBeCloseTo(888.70, 2);
    });
  });

  describe('Advanced Mode Calculations', () => {
    const advancedFormData = {
      cnssCode: '334',
      contractType: '1',
      isAnnual: false,
      isChefFamille: true,
      children: [
        { rang: 1, charge: true, handicape: true, etudiant: false },
        { rang: 2, charge: true, handicape: false, etudiant: true },
        { rang: 3, charge: false, handicape: false, etudiant: false },
        { rang: 4, charge: false, handicape: false, etudiant: false }
      ],
      otherDeductions: '100',
      otherDeductionsIsAnnual: false
    };

    test('should calculate with CNSS code 334', () => {
      const result = calculateResultsFromBase(2000, advancedFormData);
      expect(result.netSalary).toBeCloseTo(1400.78, 2);
      expect(result.cnss).toBeCloseTo(154.88, 2);
    });

    test('should handle tax-exempt contracts', () => {
      const result = calculateResultsFromBase(2000, {
        ...advancedFormData,
        contractType: '2' // Stage contract type
      });
      expect(result.irpp).toBe(0);
    });

    test('should calculate sector allowances', () => {
      const result = calculateResultsFromBase(2000, advancedFormData);
      expect(result.sectorAllowances).toBeCloseTo(160, 2); // 10% of base salary after CNSS code 334 deduction
    });

    test('should handle professional expenses cap', () => {
      const result = calculateResultsFromBase(5000, advancedFormData);
      expect(result.fraisProfessionnels).toBeCloseTo(166.67, 2); // 2000 / 12 (annual cap)
    });
  });

  describe('Salary Type Conversions', () => {
    const basicFormData = {
      cnssCode: '',
      contractType: '1',
      isAnnual: false,
      isChefFamille: false,
      children: [
        { rang: 1, charge: false, handicape: false, etudiant: false },
        { rang: 2, charge: false, handicape: false, etudiant: false },
        { rang: 3, charge: false, handicape: false, etudiant: false },
        { rang: 4, charge: false, handicape: false, etudiant: false }
      ],
      otherDeductions: '',
      otherDeductionsIsAnnual: false
    };

    test('should calculate base value from net salary', () => {
      const netSalary = 1000;
      const baseValue = calculateFromNet(netSalary, basicFormData);
      const result = calculateResultsFromBase(baseValue, basicFormData);
      expect(result.netSalary).toBeCloseTo(netSalary, 0);
    });

    test('should convert between gross and net', () => {
      const grossSalary = 1000;
      const baseValue = calculateFromGross(grossSalary);
      const result = calculateResultsFromBase(baseValue, basicFormData);
      expect(result.grossSalary).toBe(grossSalary);
    });
  });

  describe('Edge Cases', () => {
    const basicFormData = {
      cnssCode: '',
      contractType: '1',
      isAnnual: false,
      isChefFamille: false,
      children: [
        { rang: 1, charge: false, handicape: false, etudiant: false },
        { rang: 2, charge: false, handicape: false, etudiant: false },
        { rang: 3, charge: false, handicape: false, etudiant: false },
        { rang: 4, charge: false, handicape: false, etudiant: false }
      ],
      otherDeductions: '',
      otherDeductionsIsAnnual: false
    };

    test('should handle zero salary', () => {
      const result = calculateResultsFromBase(0, basicFormData);
      expect(result.netSalary).toBe(0);
      expect(result.cnss).toBe(0);
      expect(result.irpp).toBe(0);
      expect(result.css).toBe(0);
    });

    test('should handle very large salaries', () => {
      const result = calculateResultsFromBase(1000000, basicFormData);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.cnss).toBeGreaterThan(0);
      expect(result.irpp).toBeGreaterThan(0);
    });

    test('should handle maximum number of children', () => {
      const result = calculateResultsFromBase(1000, {
        ...basicFormData,
        children: [
          { rang: 1, charge: true, handicape: true, etudiant: false },
          { rang: 2, charge: true, handicape: true, etudiant: false },
          { rang: 3, charge: true, handicape: true, etudiant: false },
          { rang: 4, charge: true, handicape: true, etudiant: false }
        ]
      });
      expect(result.netSalary).toBeGreaterThan(0);
    });
  });

  describe('Payslip Validation', () => {
    const formConfig = {
      cnssCode: '',
      contractType: '1',
      isAnnual: false, 
      isChefFamille: false,
      children: [
        { rang: 1, charge: false, handicape: false, etudiant: false },
        { rang: 2, charge: false, handicape: false, etudiant: false },
        { rang: 3, charge: false, handicape: false, etudiant: false },
        { rang: 4, charge: false, handicape: false, etudiant: false }
      ],
      otherDeductions: '',
      otherDeductionsIsAnnual: false
    };

    const individualPayslips = payslipData;

    individualPayslips.forEach(({ employee, contract, baseSalary, allowances, cnss, irpp, css, netSalary, taxableSalary }) => {
      test(`should match payslip data for ${employee}`, () => {
        formConfig.contractType = contract;
        const result = calculateResultsFromBase(baseSalary, formConfig);

        // Compare monthly values (result is monthly, data is annual)
        expect(result.cnss).toBeCloseTo(cnss, 0);
        expect(result.irpp).toBeCloseTo(irpp, 0);
        expect(result.css).toBeCloseTo(css, 0);
        expect(result.netSalary).toBeCloseTo(netSalary, 0);
        expect(result.baseSalary).toBeCloseTo(baseSalary, 0);
        expect(result.sectorAllowances).toBeCloseTo(allowances, 0);
        expect(result.grossSalary).toBeCloseTo(grossSalary, 0);
        expect(result.netSalary).toBeCloseTo(netSalary, 0);
        expect(result.revenuImposable).toBeCloseTo(taxableSalary, 0);
      });
    });
  });
});