'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calculator } from 'lucide-react';
import { SalaryInput } from './SalaryInput';
import { SalaryBreakdown } from './SalaryBreakdown';
import { calculateGrossFromNet, formatTZS } from '@/lib/calculations';
import type { TaxSchema, AdvancedOptions, Currency } from '@/lib/types';

interface ReverseCalculatorProps {
  schema: TaxSchema;
  currency: Currency;
  advanced: AdvancedOptions;
}

export function ReverseCalculator({ schema, currency, advanced }: ReverseCalculatorProps) {
  const [targetNet, setTargetNet] = useState(0);

  const result = useMemo(() => {
    if (targetNet < 1000) return null;
    return calculateGrossFromNet(targetNet, schema, advanced);
  }, [targetNet, schema, advanced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2"
    >
      {/* Input panel */}
      <div
        className="card p-4 sm:p-5"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        <div className="mb-4">
          <p
            className="text-[13px] font-semibold mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
          >
            Reverse Calculator
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Enter desired take-home pay — PAYE+ solves the required gross.
          </p>
        </div>
        <SalaryInput
          value={targetNet}
          onChange={setTargetNet}
          label="Desired Net Monthly Pay"
          prefix="TZS"
          placeholder="e.g. 1,500,000"
        />
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.required_gross}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2"
          >
            {/* Required gross banner */}
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
                Required Gross Salary
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
                {formatTZS(result.required_gross)}
              </p>

              <div className="relative flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-[12px]">
                  <span
                    className="px-2.5 py-1 rounded-lg font-bold"
                    style={{
                      background: 'var(--gold-ghost)',
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {(result.required_gross / 1_000_000).toFixed(3)}M
                  </span>
                  <ArrowRight size={11} style={{ color: 'var(--text-muted)' }} />
                  <span
                    className="px-2.5 py-1 rounded-lg font-bold"
                    style={{
                      background: 'var(--sage-ghost)',
                      color: 'var(--sage)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {(targetNet / 1_000_000).toFixed(3)}M
                  </span>
                </div>

                <div
                  className="flex items-center gap-4 text-[11px]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  <span>
                    Ratio{' '}
                    <span
                      className="font-bold"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {((targetNet / result.required_gross) * 100).toFixed(1)}%
                    </span>
                  </span>
                  <span>
                    Iterations{' '}
                    <span
                      className="font-bold"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {result.iterations}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Full breakdown */}
            <p
              className="text-[10px] font-bold uppercase tracking-widest px-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Breakdown at {formatTZS(result.required_gross)} gross
            </p>
            <SalaryBreakdown
              breakdown={result.breakdown}
              currency={currency}
              usdRate={schema.usd_rate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {targetNet < 1000 && (
        <div
          className="card p-10 flex flex-col items-center justify-center text-center gap-3"
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          <Calculator size={22} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <p
            className="text-[12px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Enter a desired net salary to calculate the required gross.
          </p>
        </div>
      )}
    </motion.div>
  );
}
