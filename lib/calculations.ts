import type {
  TaxBracket,
  TaxSchema,
  SalaryBreakdown,
  EmployerCost,
  AdvancedOptions,
  ReverseResult,
  WaterfallEntry,
  PieEntry,
} from './types';
import { DEFAULT_ADVANCED } from './types';

// ─── Core PAYE Calculation ────────────────────────────────────────────────────

/**
 * Calculates PAYE tax using progressive bracket logic.
 * Applies cumulative base tax from lower brackets.
 */
export function calculatePAYE(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0;

  // Sorted ascending by min (schema should already be sorted, but be safe)
  const sorted = [...brackets].sort((a, b) => a.min - b.min);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const bracket = sorted[i];
    if (taxableIncome > bracket.min) {
      const amountAboveFloor = taxableIncome - bracket.min;
      return Math.round(bracket.base + amountAboveFloor * bracket.rate);
    }
  }

  return 0;
}

/**
 * Returns the marginal PAYE rate (as a percentage) for a given taxable income.
 */
export function getMarginalRate(taxableIncome: number, brackets: TaxBracket[]): number {
  const sorted = [...brackets].sort((a, b) => a.min - b.min);
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (taxableIncome > sorted[i].min) {
      return sorted[i].rate * 100;
    }
  }
  return 0;
}

// ─── Full Salary Breakdown ────────────────────────────────────────────────────

/**
 * Computes the complete salary breakdown for a given gross and schema.
 * Supports advanced options (NSSF override, custom deductions, benefits).
 */
export function calculateBreakdown(
  gross: number,
  schema: TaxSchema,
  advanced: AdvancedOptions = DEFAULT_ADVANCED
): SalaryBreakdown {
if (gross <= 0) {
  return {
    gross: 0,
    nssf: 0,
    taxable_income: 0,
    paye: 0,
    heslb: 0,
    total_deductions: 0,
    net: 0,
    effective_rate: 0,
    marginal_rate: 0,
    custom_fixed: 0,
    custom_percent_amount: 0,
    benefits: 0,
  };
} // ✅ THIS BRACE WAS MISSING


  const benefits = Math.max(0, advanced.benefits);
  const grossWithBenefits = gross + benefits;

  // NSSF base — whether benefits are included depends on the toggle
  const nssfBase = advanced.include_benefits_in_nssf ? grossWithBenefits : gross;
  const nssfRate = Math.max(0, Math.min(100, advanced.nssf_rate_override)) / 100;
  const nssf = Math.round(nssfBase * nssfRate);

  // PAYE is on taxable income (gross + benefits - NSSF)
  const taxable_income = Math.max(0, grossWithBenefits - nssf);
  const paye = calculatePAYE(taxable_income, schema.paye_brackets);
  const heslb = advanced.heslb_enabled
  ? Math.round(grossWithBenefits * (advanced.heslb_rate / 100))
  : 0;

  // Custom deductions
  const custom_fixed = Math.max(0, advanced.custom_fixed_deduction);
  const custom_percent_amount = Math.round(
    Math.max(0, grossWithBenefits * (advanced.custom_percent_deduction / 100))
  );

  const total_deductions = nssf + paye + heslb + custom_fixed + custom_percent_amount;
  const net = Math.max(0, grossWithBenefits - total_deductions);

  const effective_rate = grossWithBenefits > 0
    ? parseFloat(((total_deductions / grossWithBenefits) * 100).toFixed(2))
    : 0;

  const marginal_rate = getMarginalRate(taxable_income, schema.paye_brackets);

  return {
    gross,
    nssf,
    taxable_income,
    paye,
    heslb,
    total_deductions,
    net,
    effective_rate,
    marginal_rate,
    custom_fixed,
    custom_percent_amount,
    benefits,
  };
}

// ─── Employer Cost ────────────────────────────────────────────────────────────

/**
 * Computes the total employer cost of an employee with the given gross salary.
 * Includes employer NSSF (10%), SDL (4.5%), and WCF (0.5%).
 */
export function calculateEmployerCost(gross: number, schema: TaxSchema): EmployerCost {
  if (gross <= 0) {
    return {
      gross: 0, employee_nssf: 0, employer_nssf: 0, sdl: 0, wcf: 0,
      total_employer_cost: 0, cost_multiplier: 1,
    };
  }

  const employee_nssf = Math.round(gross * schema.nssf_employee_rate);
  const employer_nssf = Math.round(gross * schema.nssf_employer_rate);
  const sdl = Math.round(gross * schema.sdl_rate);
  const wcf = Math.round(gross * schema.wcf_rate);
  const total_employer_cost = gross + employer_nssf + sdl + wcf;
  const cost_multiplier = parseFloat((total_employer_cost / gross).toFixed(4));

  return { gross, employee_nssf, employer_nssf, sdl, wcf, total_employer_cost, cost_multiplier };
}

// ─── Reverse Calculator ───────────────────────────────────────────────────────

/**
 * Given a desired net salary, finds the required gross using binary search.
 * Monotonically increasing net-to-gross relationship guarantees convergence.
 */
export function calculateGrossFromNet(
  targetNet: number,
  schema: TaxSchema,
  advanced: AdvancedOptions = DEFAULT_ADVANCED,
  toleranceTZS = 1,
  maxIterations = 120
): ReverseResult {
  if (targetNet <= 0) {
    return {
      required_gross: 0,
      breakdown: calculateBreakdown(0, schema, advanced),
      iterations: 0,
    };
  }

  // Initial bounds — upper bound: assume worst case ~60% total deductions
  let low = targetNet;
  let high = targetNet * 3;
  let iterations = 0;

  // Expand upper bound if needed
  while (calculateBreakdown(high, schema, advanced).net < targetNet && iterations < 20) {
    high *= 2;
    iterations++;
  }

  // Binary search
  while (high - low > toleranceTZS && iterations < maxIterations) {
    const mid = Math.round((low + high) / 2);
    const breakdown = calculateBreakdown(mid, schema, advanced);

    if (Math.abs(breakdown.net - targetNet) <= toleranceTZS) {
      return { required_gross: mid, breakdown, iterations };
    }

    if (breakdown.net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
  }

  const required_gross = Math.round((low + high) / 2);
  return {
    required_gross,
    breakdown: calculateBreakdown(required_gross, schema, advanced),
    iterations,
  };
}

// ─── Chart Data Builders ──────────────────────────────────────────────────────

/**
 * Builds waterfall chart data for Recharts stacked bar approach.
 * The invisible bar creates the floating effect for each segment.
 */
export function buildWaterfallData(breakdown: SalaryBreakdown): WaterfallEntry[] {
  const { gross, nssf, paye, net, custom_fixed, custom_percent_amount, benefits } = breakdown;
  const hasCustom = custom_fixed + custom_percent_amount > 0;
  const hasbenefits = benefits > 0;

  const entries: WaterfallEntry[] = [];

  if (hasbenefits) {
    entries.push({
      name: 'Base',
      invisible: 0,
      amount: gross,
      fill: '#6366F1',
      type: 'positive',
      tooltip: `Base Gross: ${fmtNum(gross)}`,
    });
    entries.push({
      name: 'Benefits',
      invisible: gross,
      amount: benefits,
      fill: '#A78BFA',
      type: 'positive',
      tooltip: `Benefits: ${fmtNum(benefits)}`,
    });
  } else {
    entries.push({
      name: 'Gross',
      invisible: 0,
      amount: gross + benefits,
      fill: '#6366F1',
      type: 'positive',
      tooltip: `Gross Salary: ${fmtNum(gross + benefits)}`,
    });
  }

  entries.push({
    name: 'NSSF',
    invisible: net + paye + (hasCustom ? custom_fixed + custom_percent_amount : 0),
    amount: nssf,
    fill: '#F59E0B',
    type: 'negative',
    tooltip: `NSSF (${breakdown.gross > 0 ? ((nssf / (gross + benefits)) * 100).toFixed(1) : 0}%): ${fmtNum(nssf)}`,
  });

  entries.push({
    name: 'PAYE',
    invisible: net + (hasCustom ? custom_fixed + custom_percent_amount : 0),
    amount: paye,
    fill: '#EF4444',
    type: 'negative',
    tooltip: `PAYE Tax: ${fmtNum(paye)}`,
  });

  if (hasCustom) {
    entries.push({
      name: 'Other',
      invisible: net,
      amount: custom_fixed + custom_percent_amount,
      fill: '#EC4899',
      type: 'negative',
      tooltip: `Custom Deductions: ${fmtNum(custom_fixed + custom_percent_amount)}`,
    });
  }

  entries.push({
    name: 'Net Pay',
    invisible: 0,
    amount: net,
    fill: '#10B981',
    type: 'result',
    tooltip: `Net Pay: ${fmtNum(net)}`,
  });

  return entries;
}

/**
 * Builds pie/donut chart data for the deductions breakdown.
 */
export function buildPieData(breakdown: SalaryBreakdown): PieEntry[] {
  const { nssf, paye, net, custom_fixed, custom_percent_amount } = breakdown;
  const total = breakdown.gross + breakdown.benefits;
  if (total <= 0) return [];

  const entries: PieEntry[] = [
    { name: 'Net Pay', value: net, fill: '#10B981', percent: (net / total) * 100 },
    { name: 'PAYE Tax', value: paye, fill: '#EF4444', percent: (paye / total) * 100 },
    { name: 'NSSF', value: nssf, fill: '#F59E0B', percent: (nssf / total) * 100 },
  ];

  if (custom_fixed + custom_percent_amount > 0) {
    const customTotal = custom_fixed + custom_percent_amount;
    entries.push({
      name: 'Other',
      value: customTotal,
      fill: '#EC4899',
      percent: (customTotal / total) * 100,
    });
  }

  return entries.filter(e => e.value > 0);
}

// ─── Formatting Utilities ─────────────────────────────────────────────────────

export function formatTZS(amount: number): string {
  return `TZS ${new Intl.NumberFormat('en-TZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount))}`;
}

export function formatUSD(amount: number, rate: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / rate);
}

export function formatCurrency(amount: number, currency: 'TZS' | 'USD', rate: number): string {
  return currency === 'TZS' ? formatTZS(amount) : formatUSD(amount, rate);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Internal compact number formatter for chart tooltips
function fmtNum(n: number): string {
  return new Intl.NumberFormat('en-TZ').format(Math.round(n));
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}
