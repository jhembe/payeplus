'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, Zap } from 'lucide-react';
import { SalaryInput } from './SalaryInput';
import { SalaryBreakdown } from './SalaryBreakdown';
import { calculateGrossFromNet } from '@/lib/calculations';
import type { TaxSchema, AdvancedOptions, Currency } from '@/lib/types';
import { DEFAULT_ADVANCED } from '@/lib/types';
import { formatTZS } from '@/lib/calculations';

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Explainer */}
      <div className="card-glass p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-xl bg-electric-500/15 text-electric-400 flex-shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Reverse Salary Calculator</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the net (take-home) pay you want to receive and PAYE+ will compute the gross
              salary your employer must pay. Uses binary search with TZS 1 tolerance.
            </p>
          </div>
        </div>

        <SalaryInput
          value={targetNet}
          onChange={setTargetNet}
          label="Desired Net Monthly Pay"
          prefix="TZS"
          placeholder="e.g. 1,500,000"
        />
      </div>

      {/* Visual flow indicator */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.required_gross}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Required gross banner */}
            <div className="card-glass p-5 border-brand-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    Required Gross Salary
                  </p>
                  <p
                    className="text-3xl sm:text-4xl font-mono font-bold gradient-text-brand"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {formatTZS(result.required_gross)}
                  </p>
                </div>

                {/* Flow diagram */}
                <div className="flex items-center gap-3 text-sm font-mono">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Gross</p>
                    <div className="px-3 py-1.5 rounded-lg bg-brand-500/15 text-brand-400 font-semibold text-sm">
                      {(result.required_gross / 1_000_000).toFixed(3)}M
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-600 flex-shrink-0" />
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Net</p>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-semibold text-sm">
                      {(targetNet / 1_000_000).toFixed(3)}M
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
                <div className="text-xs text-slate-600">
                  Gross-to-net ratio:{' '}
                  <span className="text-slate-400 font-mono font-semibold">
                    {((targetNet / result.required_gross) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Converged in{' '}
                  <span className="text-slate-400 font-mono font-semibold">
                    {result.iterations}
                  </span>{' '}
                  iterations
                </div>
              </div>
            </div>

            {/* Full breakdown at the required gross */}
            <div className="space-y-2">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold px-1">
                Breakdown at {formatTZS(result.required_gross)} gross
              </p>
              <SalaryBreakdown
                breakdown={result.breakdown}
                currency={currency}
                usdRate={schema.usd_rate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint when empty */}
      {targetNet < 1000 && (
        <div className="card-glass p-6 flex items-center justify-center text-center">
          <div className="space-y-2">
            <Calculator size={28} className="mx-auto text-slate-700" />
            <p className="text-sm text-slate-600">
              Enter a desired net salary above to calculate the required gross.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
