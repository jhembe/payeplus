'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { calculateEmployerCost, formatTZS, formatPercent } from '@/lib/calculations';
import type { TaxSchema, Currency } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface EmployerCostViewProps {
  gross: number;
  schema: TaxSchema;
  currency: Currency;
}

export function EmployerCostView({ gross, schema, currency }: EmployerCostViewProps) {
  const cost = useMemo(() => calculateEmployerCost(gross, schema), [gross, schema]);

  const fmt = (n: number) => formatCurrency(n, currency, schema.usd_rate);

  const lineItems = [
    {
      label: 'Gross Salary',
      value: cost.gross,
      description: 'Agreed remuneration',
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
      positive: true,
    },
    {
      label: 'Employer NSSF (10%)',
      value: cost.employer_nssf,
      description: 'Employer social security contribution',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      positive: false,
    },
    {
      label: 'Skills & Development Levy (4.5%)',
      value: cost.sdl,
      description: 'SDL — paid to TRA monthly',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      positive: false,
    },
    {
      label: "Workers' Compensation Fund (0.5%)",
      value: cost.wcf,
      description: 'WCF — mandatory insurance levy',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      positive: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header card */}
      <div className="card-glass p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 flex-shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Employer Cost View</h3>
            <p className="text-xs text-slate-500 mt-1">
              The total cost of employment to the organisation — gross salary plus statutory
              employer-side levies (NSSF, SDL, WCF) mandated by Tanzanian labour law.
            </p>
          </div>
        </div>

        {/* Big number */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-1">
              Total Monthly Employer Cost
            </p>
            <p
              className="text-4xl sm:text-5xl font-mono font-bold gradient-text"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <AnimatedNumber
                value={cost.total_employer_cost}
                formatter={fmt}
                duration={600}
              />
            </p>
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">
                {cost.cost_multiplier.toFixed(4)}×
              </span>
              <span className="text-xs text-slate-600">of gross</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card-glass overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-white/[0.05]">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Cost Breakdown
          </p>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {lineItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              className="px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('w-1 h-8 rounded-full flex-shrink-0', item.bg)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300 truncate">{item.label}</p>
                  <p className="text-xs text-slate-600">{item.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={cn('font-mono font-bold text-sm tabular-nums', item.color)}>
                  {item.positive ? '' : '+ '}
                  <AnimatedNumber value={item.value} formatter={fmt} duration={500} />
                </p>
                {!item.positive && item.value > 0 && (
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    {formatPercent((item.value / cost.gross) * 100, 1)} of gross
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {/* Total row */}
          <div className="px-5 py-4 flex items-center justify-between bg-brand-500/5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-brand-500/40" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Total Employer Cost</p>
                <p className="text-xs text-slate-600">Monthly obligation to employer</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-base gradient-text-brand tabular-nums">
                <AnimatedNumber
                  value={cost.total_employer_cost}
                  formatter={fmt}
                  duration={600}
                />
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                {formatPercent((cost.total_employer_cost / cost.gross - 1) * 100, 2)} above gross
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="card-glass p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-400/70 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          SDL (Skills &amp; Development Levy) is applicable to employers with 4+ employees paying
          a gross monthly payroll ≥ TZS 200,000. WCF rates may vary by industry sector. Always
          verify current rates with TRA and WCF Board of Tanzania.
        </p>
      </div>
    </motion.div>
  );
}
