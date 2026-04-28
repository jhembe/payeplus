'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GitCompare, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateBreakdown, formatTZS, formatPercent } from '@/lib/calculations';
import type { TaxSchema, Scenario, AdvancedOptions, Currency } from '@/lib/types';
import { DEFAULT_ADVANCED } from '@/lib/types';
import { SalaryInput } from './SalaryInput';
import { cn } from '@/lib/utils';

interface ScenarioComparisonProps {
  schema: TaxSchema;
  currency: Currency;
  currentGross: number;
  currentAdvanced: AdvancedOptions;
}

const SCENARIO_COLORS = [
  '#6366F1', '#06B6D4', '#10B981', '#F59E0B',
  '#EC4899', '#8B5CF6', '#F97316', '#14B8A6',
];

const SCENARIO_NAMES = [
  'Current Role', 'Offer A', 'Offer B', 'Senior',
  'Director', 'Freelance', 'Consulting', 'Remote',
];

/** iOS-safe UUID: crypto.randomUUID() available from iOS 15.4+; fallback for older */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: Math.random-based UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ScenarioComparison({
  schema,
  currency,
  currentGross,
  currentAdvanced,
}: ScenarioComparisonProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [addGross, setAddGross] = useState(currentGross);
  const [addName, setAddName] = useState('');

  const addScenario = () => {
    if (addGross < 1000) return;
    const idx = scenarios.length % SCENARIO_COLORS.length;
    const name = addName.trim() || SCENARIO_NAMES[idx] || `Scenario ${scenarios.length + 1}`;
    const breakdown = calculateBreakdown(addGross, schema, currentAdvanced);
    setScenarios((prev) => [
      ...prev,
      {
        id: generateId(),
        name,
        gross: addGross,
        breakdown,
        advanced: currentAdvanced,
        created_at: Date.now(),
        color: SCENARIO_COLORS[idx],
      },
    ]);
    setAddName('');
    setAddGross(0);
  };

  const removeScenario = (id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id));

  const bestNet = scenarios.length ? Math.max(...scenarios.map((s) => s.breakdown.net)) : 0;

  const metrics: Array<{
    key: keyof Scenario['breakdown'];
    label: string;
    good: 'high' | 'low';
    format: (v: number) => string;
  }> = [
    { key: 'gross',            label: 'Gross',            good: 'high', format: formatTZS },
    { key: 'net',              label: 'Net Pay',          good: 'high', format: formatTZS },
    { key: 'paye',             label: 'PAYE Tax',         good: 'low',  format: formatTZS },
    { key: 'nssf',             label: 'NSSF',             good: 'low',  format: formatTZS },
    { key: 'total_deductions', label: 'Total Deductions', good: 'low',  format: formatTZS },
    { key: 'effective_rate',   label: 'Effective Rate',   good: 'low',  format: (v) => formatPercent(v) },
    { key: 'marginal_rate',    label: 'Marginal Rate',    good: 'low',  format: (v) => formatPercent(v, 0) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Add scenario panel */}
      <div className="card-glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-brand-500/15 text-brand-400">
            <GitCompare size={15} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Scenario Comparison
          </h3>
          <span className="ml-auto text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {scenarios.length}/8 scenarios
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Scenario name (optional)"
            autoComplete="off"
            autoCorrect="off"
            className={cn(
              'rounded-xl px-4 py-3 text-sm outline-none',
              'border transition-colors sm:w-48 flex-shrink-0',
              'focus:border-brand-500/40'
            )}
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
              fontFamily: 'Outfit, sans-serif',
              // iOS zoom prevention
              fontSize: 'max(16px, 0.875rem)',
            }}
          />
          <div className="flex-1">
            <SalaryInput value={addGross} onChange={setAddGross} label="" placeholder="0" />
          </div>
          <button
            onClick={addScenario}
            disabled={addGross < 1000 || scenarios.length >= 8}
            className={cn(
              'flex items-center justify-center gap-2 px-5 rounded-xl font-semibold text-sm',
              'bg-brand-500 text-white hover:bg-brand-600 active:scale-95',
              'transition-all duration-150 flex-shrink-0',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-500',
              // iOS touch target
              'min-h-[44px]'
            )}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <AnimatePresence>
        {scenarios.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-glass p-10 text-center"
          >
            <GitCompare size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Add two or more salary scenarios to compare them side by side.
            </p>
          </motion.div>
        )}

        {scenarios.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-x-auto no-scrollbar"
          >
            <div
              className="card-glass overflow-hidden"
              style={{ minWidth: `${180 + scenarios.length * 160}px` }}
            >
              {/* Scenario headers */}
              <div
                className="grid border-b"
                style={{
                  gridTemplateColumns: `180px repeat(${scenarios.length}, 1fr)`,
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Metric
                </div>
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    className="px-4 py-3 flex items-center justify-between gap-2"
                    style={{ borderLeft: `2px solid ${s.color}20` }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                        {s.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeScenario(s.id)}
                      className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Metric rows */}
              {metrics.map((metric, mi) => {
                const values = scenarios.map((s) => s.breakdown[metric.key] as number);
                const best = metric.good === 'high' ? Math.max(...values) : Math.min(...values);
                const worst = metric.good === 'high' ? Math.min(...values) : Math.max(...values);
                return (
                  <div
                    key={metric.key}
                    className="grid border-b last:border-0"
                    style={{
                      gridTemplateColumns: `180px repeat(${scenarios.length}, 1fr)`,
                      borderColor: 'var(--border-subtle)',
                      background: mi % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    }}
                  >
                    <div className="px-4 py-3 text-xs font-medium flex items-center" style={{ color: 'var(--text-muted)' }}>
                      {metric.label}
                    </div>
                    {scenarios.map((s) => {
                      const val = s.breakdown[metric.key] as number;
                      const isBest  = val === best;
                      const isWorst = val === worst && scenarios.length > 1 && worst !== best;
                      return (
                        <div key={s.id} className="px-4 py-3 flex items-center gap-1.5" style={{ borderLeft: `2px solid ${s.color}15` }}>
                          <span className={cn(
                            'font-mono text-xs font-semibold tabular-nums',
                            isBest  && 'text-emerald-400',
                            isWorst && 'text-red-400/70',
                            !isBest && !isWorst && 'text-slate-400'
                          )}>
                            {metric.format(val)}
                          </span>
                          {isBest  && scenarios.length > 1 && <TrendingUp  size={10} className="text-emerald-400 flex-shrink-0" />}
                          {isWorst && scenarios.length > 1 && <TrendingDown size={10} className="text-red-400/60 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Net delta row */}
              {scenarios.length >= 2 && (
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `180px repeat(${scenarios.length}, 1fr)`,
                    background: 'rgba(99,102,241,0.05)',
                    borderTop: '1px solid rgba(99,102,241,0.15)',
                  }}
                >
                  <div className="px-4 py-3 text-xs text-brand-400 font-semibold">vs. Best Net</div>
                  {scenarios.map((s) => {
                    const delta = s.breakdown.net - bestNet;
                    return (
                      <div key={s.id} className="px-4 py-3 font-mono text-xs font-bold tabular-nums" style={{ borderLeft: `2px solid ${s.color}15` }}>
                        {delta === 0
                          ? <span className="text-emerald-400">Best ✓</span>
                          : <span className="text-red-400/80">-{formatTZS(Math.abs(delta))}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
