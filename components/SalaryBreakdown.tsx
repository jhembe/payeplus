'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Wallet, Shield, Receipt, ArrowUpRight, Percent, GraduationCap } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';
import type { SalaryBreakdown as SalaryBreakdownType, Currency } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';

interface SalaryBreakdownProps {
  breakdown: SalaryBreakdownType;
  currency: Currency;
  usdRate: number;
}

interface MetricCard {
  key: keyof SalaryBreakdownType | 'effective_rate_display';
  label: string;
  icon: React.ReactNode;
  value: number;
  description: string;
  variant: 'primary' | 'warning' | 'danger' | 'success' | 'info';
  isPercent?: boolean;
  isMain?: boolean;
}

const VARIANTS = {
  primary: {
    icon: 'bg-brand-500/15 text-brand-400',
    value: 'gradient-text-brand',
    border: 'hover:border-brand-500/25',
    glow: 'hover:shadow-brand-sm',
  },
  warning: {
    icon: 'bg-amber-500/15 text-amber-400',
    value: 'text-amber-400',
    border: 'hover:border-amber-500/25',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
  },
  danger: {
    icon: 'bg-red-500/15 text-red-400',
    value: 'text-red-400',
    border: 'hover:border-red-500/25',
    glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]',
  },
  success: {
    icon: 'bg-emerald-500/15 text-emerald-400',
    value: 'gradient-text-success',
    border: 'hover:border-emerald-500/25',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
  },
  info: {
    icon: 'bg-sky-500/15 text-sky-400',
    value: 'text-sky-400',
    border: 'hover:border-sky-500/20',
    glow: 'hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]',
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function SalaryBreakdown({ breakdown, currency, usdRate }: SalaryBreakdownProps) {
  const metrics: MetricCard[] = [
    {
      key: 'net',
      label: 'Net Take-Home',
      icon: <Wallet size={18} />,
      value: breakdown.net,
      description: 'After all deductions',
      variant: 'success',
      isMain: true,
    },
    {
      key: 'paye',
      label: 'PAYE Tax',
      icon: <Receipt size={18} />,
      value: breakdown.paye,
      description: `Marginal rate: ${formatPercent(breakdown.marginal_rate)}`,
      variant: 'danger',
    },
  
    ...(breakdown.heslb > 0
      ? [{
          key: 'heslb',
          label: 'HESLB Loan',
          icon: <GraduationCap size={18} />,
          value: breakdown.heslb,
          description: 'Post-tax student loan repayment',
          variant: 'info',
        }]
      : []),
  
    {
      key: 'nssf',
      label: 'NSSF Contribution',
      icon: <Shield size={18} />,
      value: breakdown.nssf,
      description: `${formatPercent(
        breakdown.gross > 0
          ? (breakdown.nssf / (breakdown.gross + breakdown.benefits)) * 100
          : 0
      )} of gross`,
      variant: 'warning',
    },
    {
      key: 'total_deductions',
      label: 'Total Deductions',
      icon: <TrendingDown size={18} />,
      value: breakdown.total_deductions,
      description: `Effective rate: ${formatPercent(breakdown.effective_rate)}`,
      variant: 'info',
    },
  ];

  // Append custom deductions row if present
  const hasCustom = breakdown.custom_fixed + breakdown.custom_percent_amount > 0;

  const fmt = (n: number) =>
    formatCurrency(n, currency, usdRate);

  return (
    <motion.div
      key={breakdown.gross}
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const v = VARIANTS[metric.variant];
          return (
            <motion.div
              key={metric.key}
              variants={item}
              className={cn(
                'card-glass p-4 sm:p-5 relative overflow-hidden group cursor-default',
                'border transition-all duration-300',
                v.border,
                v.glow,
                metric.isMain && 'col-span-2 lg:col-span-2'
              )}
            >
              {/* Background accent for main card */}
              {metric.isMain && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              )}

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={cn('p-2 rounded-lg', v.icon)}>
                  {metric.icon}
                </div>
                {metric.isMain && (
                  <ArrowUpRight
                    size={14}
                    className="text-emerald-400/40 group-hover:text-emerald-400 transition-colors"
                  />
                )}
              </div>

              <div className="space-y-1">
                <p className={cn(
                  'font-mono font-bold tabular-nums',
                  metric.isMain ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl',
                  v.value
                )}>
                  <AnimatedNumber
                    value={metric.value}
                    formatter={fmt}
                    duration={550}
                  />
                </p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {metric.label}
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Taxable income row */}
      <motion.div variants={item} className="mt-3">
        <div className="card-glass px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Percent size={13} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Taxable Income</span>
              <span className="font-mono text-sm font-semibold text-slate-300 tabular-nums">
                {fmt(breakdown.taxable_income)}
              </span>
            </div>
            <div className="h-3 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Effective Rate</span>
              <span className="font-mono text-sm font-semibold text-slate-300">
                {formatPercent(breakdown.effective_rate)}
              </span>
            </div>
            <div className="h-3 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Marginal Rate</span>
              <span className="font-mono text-sm font-semibold text-slate-300">
                {formatPercent(breakdown.marginal_rate, 0)}
              </span>
            </div>
          </div>

          {hasCustom && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Custom</span>
              <span className="font-mono text-xs font-semibold text-pink-400">
                -{fmt(breakdown.custom_fixed + breakdown.custom_percent_amount)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
