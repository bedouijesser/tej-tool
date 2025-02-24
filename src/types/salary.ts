import type { JSX } from "react";
export enum SalaryType {
    BASE = 'BASE',
    GROSS = 'GROSS',
    NET = 'NET'
}

export enum CalculatorMode {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED'
}

export interface Child {
    rang: number;
    charge: boolean;
    handicape: boolean;
    etudiant: boolean;
}

export interface Allowance {
    id: string;
    value: string;
    isAnnual: boolean;
}

// Base interface for salary input data
export interface SalaryInputData {
    cnssCode: string;
    contractType: string;
    isAnnual: boolean;
    isChefFamille: boolean;
    children: Child[];
    otherDeductions: string;
    otherDeductionsIsAnnual: boolean;
}

// Form data extends base input data with UI-specific fields
export interface FormData extends SalaryInputData {
    baseValue: string;
    isSmig: boolean;
    gender: 'homme' | 'femme';
    a5: number;
    salaryType: SalaryType;
    inputValue: string;
    allowances: Allowance[];
    mode: CalculatorMode;
}

// Calculation results interface
export interface SalaryCalculationResult {
    baseSalary: number;
    sectorAllowances: number;
    grossSalary: number;
    cnss: number;
    irpp: number;
    css: number;
    netSalary: number;
    fraisProfessionnels: number;
    revenuImposable: number;
    baseIRP: number;
}

export interface SalaryTabData {
    id: string;
    label: string;
    icon: string;
    description: string;
    tooltip: string;
    value: number;
    formula: string;
    negative?: boolean;
    intermediate?: boolean;
    table?: JSX.Element;
}
