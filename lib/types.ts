// ─── Tax Schema (remote config) ───────────────────────────────────────────────

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  base: number;
  label: string;
}

export interface TaxSchema {
  version: string;
  year: number;
  last_updated: string;
  currency: string;
  usd_rate: number;
  nssf_employee_rate: number;
  nssf_employer_rate: number;
  sdl_rate: number;
  wcf_rate: number;
  paye_brackets: TaxBracket[];
}

// ─── Calculation Results ──────────────────────────────────────────────────────

export interface SalaryBreakdown {
  gross: number;
  nssf: number;
  taxable_income: number;
  paye: number;

  heslb: number;

  total_deductions: number;
  net: number;
  effective_rate: number;
  marginal_rate: number;

  custom_fixed: number;
  custom_percent_amount: number;
  benefits: number;
}

export interface EmployerCost {
  gross: number;
  employee_nssf: number;
  employer_nssf: number;
  sdl: number;
  wcf: number;
  total_employer_cost: number;
  cost_multiplier: number;
}

export interface ReverseResult {
  required_gross: number;
  breakdown: SalaryBreakdown;
  iterations: number;
}

// ─── Advanced Options ─────────────────────────────────────────────────────────

export interface AdvancedOptions {
export interface AdvancedOptions {
  nssf_rate_override: number;
  custom_fixed_deduction: number;
  custom_percent_deduction: number;
  benefits: number;
  include_benefits_in_nssf: boolean;

  heslb_enabled: boolean;
  heslb_rate: number; // percent, default 15
}

export const DEFAULT_ADVANCED: AdvancedOptions = {
  nssf_rate_override: 10,
  custom_fixed_deduction: 0,
  custom_percent_deduction: 0,
  benefits: 0,
  include_benefits_in_nssf: true,

  heslb_enabled: false,
  heslb_rate: 15,
};
// ─── Scenarios ────────────────────────────────────────────────────────────────

export interface Scenario {
  id: string;
  name: string;
  gross: number;
  breakdown: SalaryBreakdown;
  advanced: AdvancedOptions;
  created_at: number;
  color: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type Currency = 'TZS' | 'USD';
export type AppTab = 'quick' | 'advanced' | 'compare' | 'reverse' | 'employer';
export type Theme = 'dark' | 'light';

// ─── Chart Data Types ─────────────────────────────────────────────────────────

export interface WaterfallEntry {
  name: string;
  invisible: number;
  amount: number;
  fill: string;
  type: 'positive' | 'negative' | 'result';
  tooltip: string;
}

export interface PieEntry {
  name: string;
  value: number;
  fill: string;
  percent: number;
}
