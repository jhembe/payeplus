'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { calculateEmployerCost, formatPercent, formatCurrency } from '@/lib/calculations';
import type { TaxSchema, Currency } from '@/lib/types';

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
      sublabel: 'Agreed remuneration',
      value: cost.gross,
      accent: 'var(--gold)',
      positive: true,
    },
    {
      label: 'Employer NSSF',
      sublabel: '10% of gross',
      value: cost.employer_nssf,
      accent: 'var(--sky)',
      positive: false,
    },
    {
      label: 'Skills & Development Levy',
      sublabel: '4.5% of gross',
      value: cost.sdl,
      accent: 'var(--rose)',
      positive: false,
    },
    {
      label: "Workers' Compensation Fund",
      sublabel: '0.5% of gross',
      value: cost.wcf,
      accent: 'var(--rose)',
      positive: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2"
    >
      {/* Hero cost card */}
      <div
        className="card-gold p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{ background: 'linear-gradient(135deg, var(--gold-ghost) 0%, transparent 50%)' }}
        />
        <p
          className="relative text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Total Monthly Employer Cost
        </p>
        <p
          className="relative leading-none mb-3"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(24px, 4.5vw, 32px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'var(--gold)',
          }}
        >
          <AnimatedNumber value={cost.total_employer_cost} formatter={fmt} duration={600} />
        </p>

        <div className="relative flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <TrendingUp size={11} style={{ color: 'var(--sage)' }} />
            <span
              className="text-[12px] font-bold tabular-nums"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
            >
              {cost.cost_multiplier.toFixed(4)}×
            </span>
            <span
              className="text-[11px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              of gross
            </span>
          </div>
          <p
            className="text-[11px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            {formatPercent((cost.total_employer_cost / cost.gross - 1) * 100, 2)} above gross salary
          </p>
        </div>
      </div>

      {/* Line items */}
      <div
        className="card overflow-hidden"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        <div
          className="px-4 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--border-hair)' }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Cost Breakdown
          </p>
        </div>

        <div
          className="divide-y"
          style={{ borderColor: 'var(--border-hair)' }}
        >
          {lineItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 + i * 0.05, duration: 0.3 }}
              className="px-4 py-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-0.5 h-6 rounded-full flex-shrink-0"
                  style={{ background: item.accent, opacity: 0.7 }}
                />
                <div className="min-w-0">
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {item.sublabel}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="font-bold text-[13px] tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: item.accent }}
                >
                  {item.positive ? '' : '+ '}
                  <AnimatedNumber value={item.value} formatter={fmt} duration={450} />
                </p>
                {!item.positive && item.value > 0 && (
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {formatPercent((item.value / cost.gross) * 100, 1)} of gross
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {/* Total row */}
          <div
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ background: 'var(--gold-ghost)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-0.5 h-6 rounded-full"
                style={{ background: 'var(--gold)' }}
              />
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
                >
                  Total Employer Cost
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Monthly obligation
                </p>
              </div>
            </div>
            <p
              className="font-bold text-[14px] tabular-nums"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}
            >
              <AnimatedNumber value={cost.total_employer_cost} formatter={fmt} duration={600} />
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="card flex items-start gap-3 p-4"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        <AlertCircle
          size={12}
          className="flex-shrink-0 mt-0.5"
          style={{ color: 'var(--gold)', opacity: 0.5 }}
        />
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          SDL applies to employers with 4+ staff paying gross payroll ≥ TZS 200,000/mo.
          WCF rates vary by industry. Verify current rates with TRA and WCF Board of Tanzania.
        </p>
      </div>
    </motion.div>
  );
}
