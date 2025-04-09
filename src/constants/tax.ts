export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

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

// Standard deduction rates
export const CNSS_RATE = 0.0968; // Social security contribution rate
export const CSS_RATE = 0.005; // Social solidarity contribution rate
export const CSS_THRESHOLD = 5000; // Threshold for CSS application
export const PROFESSIONAL_EXPENSES_RATE = 0.10; // Professional expenses deduction rate
export const PROFESSIONAL_EXPENSES_CAP = 2000; // Maximum professional expenses deduction
export const FAMILY_HEAD_DEDUCTION = 300; // Annual deduction for family head

// Child deduction amounts
export const CHILD_DEDUCTIONS = {
  STANDARD: 100, // Standard deduction per child
  STUDENT: 1000, // Deduction for student child
  DISABLED: 2000, // Deduction for disabled child
  MAX_CHILDREN: 4 // Maximum number of children eligible for deduction
} as const;

// SMIG values (as of 2025)
export const SMIG = {
  HOURLY_48H: 2.540,  
  HOURLY_40H: 2.618, 
  MONTHLY_48H: 528.320, 
  MONTHLY_40H: 448.238
} as const;

// Special CNSS codes
export const SPECIAL_CNSS = {
  DEDUCTION_334: 400 // Special deduction for CNSS code 334
} as const;
