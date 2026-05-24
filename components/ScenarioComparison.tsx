'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GitCompare, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateBreakdown, formatTZS, formatPercent } from '@/lib/calculations';
import type { TaxSchema, Scenario, AdvancedOptions, Currency } from '@/lib/types';
import { SalaryInput } from './SalaryInput';
import { cn } from '@/lib/utils';

interface ScenarioComparisonProps {
  schema: TaxSchema;
  currency: Currency;
  currentGross: number;
  currentAdvanced: AdvancedOptions;
}

const COLORS = ['#F59E0B','#38BDF8','#4ADE80','#FB7185','#A78BFA','#FCD34D','#34D399','#60A5FA'];
const NAMES  = ['Current Role','Offer A','Offer B','Senior','Director','Freelance','Consulting','Remote'];

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function ScenarioComparison({ schema, currency, currentGross, currentAdvanced }: ScenarioComparisonProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [addGross, setAddGross] = useState(currentGross);
  const [addName, setAddName] = useState('');

  const addScenario = () => {
    if (addGross < 1000) return;
    const idx = scenarios.length % COLORS.length;
    const name = addName.trim() || NAMES[idx] || `Scenario ${scenarios.length + 1}`;
    const breakdown = calculateBreakdown(addGross, schema, currentAdvanced);
    setScenarios((prev) => [
      ...prev,
      { id: generateId(), name, gross: addGross, breakdown, advanced: currentAdvanced, created_at: Date.now(), color: COLORS[idx] },
    ]);
    setAddName('');
    setAddGross(0);
  };

  const removeScenario = (id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id));
  const bestNet = scenarios.length ? Math.max(...scenarios.map((s) => s.breakdown.net)) : 0;

  const metrics: Array<{ key: keyof Scenario['breakdown']; label: string; good: 'high' | 'low'; format: (v: number) => string }> = [
    { key: 'gross',            label: 'Gross',          good: 'high', format: formatTZS },
    { key: 'net',              label: 'Net Pay',        good: 'high', format: formatTZS },
    { key: 'paye',             label: 'PAYE Tax',       good: 'low',  format: formatTZS },
    { key: 'nssf',             label: 'NSSF',           good: 'low',  format: formatTZS },
    { key: 'total_deductions', label: 'Deductions',     good: 'low',  format: formatTZS },
    { key: 'effective_rate',   label: 'Effective Rate', good: 'low',  format: (v) => formatPercent(v) },
    { key: 'marginal_rate',    label: 'Marginal Rate',  good: 'low',  format: (v) => formatPercent(v, 0) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2"
    >
      {/* Add scenario */}
      <div
        className="card p-4 sm:p-5"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: 'var(--gold-ghost)', color: 'var(--gold)' }}
          >
            <GitCompare size={13} />
          </div>
          <p
            className="text-[13px] font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
          >
            Scenario Comparison
          </p>
          <span
            className="ml-auto text-[11px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {scenarios.length}/8
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addScenario()}
            placeholder="Label (optional)"
            autoComplete="off"
            autoCorrect="off"
            className="rounded-xl px-3 py-2.5 text-[13px] outline-none border sm:w-40 flex-shrink-0 transition-all focus:border-gold/50"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'max(16px, 0.875rem)',
              boxShadow: 'var(--shadow-input)',
            }}
          />
          <div className="flex-1">
            <SalaryInput value={addGross} onChange={setAddGross} label="" placeholder="0" />
          </div>
          <button
            onClick={addScenario}
            disabled={addGross < 1000 || scenarios.length >= 8}
            className={cn(
              'flex items-center justify-center gap-1.5 px-4 rounded-xl font-semibold text-[13px]',
              'transition-all duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'min-h-[44px] flex-shrink-0',
            )}
            style={{
              background: 'var(--gold)',
              color: '#0C0C0D',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* Table */}
      <AnimatePresence>
        {scenarios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card p-10 text-center"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            <GitCompare size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <p
              className="text-[12px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Add two or more salary scenarios to compare them side by side.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto no-scrollbar"
          >
            <div
              className="card overflow-hidden"
              style={{ minWidth: `${160 + scenarios.length * 148}px`, borderRadius: 'var(--radius-card)' }}
            >
              {/* Scenario headers */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `160px repeat(${scenarios.length}, 1fr)`,
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Metric
                </div>
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    className="px-4 py-3 flex items-center justify-between gap-2"
                    style={{ borderLeft: `1px solid var(--border-hair)` }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span
                        className="text-[12px] font-semibold truncate"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                      >
                        {s.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeScenario(s.id)}
                      className="flex-shrink-0 p-1.5 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--rose)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Metric rows */}
              {metrics.map((metric, mi) => {
                const values = scenarios.map((s) => s.breakdown[metric.key] as number);
                const best  = metric.good === 'high' ? Math.max(...values) : Math.min(...values);
                const worst = metric.good === 'high' ? Math.min(...values) : Math.max(...values);
                return (
                  <div
                    key={metric.key}
                    className="grid"
                    style={{
                      gridTemplateColumns: `160px repeat(${scenarios.length}, 1fr)`,
                      borderBottom: '1px solid var(--border-hair)',
                      background: mi % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    }}
                  >
                    <div
                      className="px-4 py-2.5 text-[11px] font-medium flex items-center"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {metric.label}
                    </div>
                    {scenarios.map((s) => {
                      const val = s.breakdown[metric.key] as number;
                      const isBest  = val === best;
                      const isWorst = val === worst && scenarios.length > 1 && worst !== best;
                      return (
                        <div
                          key={s.id}
                          className="px-4 py-2.5 flex items-center gap-1.5"
                          style={{ borderLeft: '1px solid var(--border-hair)' }}
                        >
                          <span
                            className={cn('font-bold text-[12px] tabular-nums')}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              color: isBest ? 'var(--sage)' : isWorst ? 'var(--rose)' : 'var(--text-secondary)',
                            }}
                          >
                            {metric.format(val)}
                          </span>
                          {isBest  && scenarios.length > 1 && <TrendingUp  size={9} style={{ color: 'var(--sage)' }} />}
                          {isWorst && scenarios.length > 1 && <TrendingDown size={9} style={{ color: 'var(--rose)', opacity: 0.6 }} />}
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
                    gridTemplateColumns: `160px repeat(${scenarios.length}, 1fr)`,
                    background: 'var(--gold-ghost)',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <div
                    className="px-4 py-2.5 text-[11px] font-bold"
                    style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
                  >
                    vs. Best Net
                  </div>
                  {scenarios.map((s) => {
                    const delta = s.breakdown.net - bestNet;
                    return (
                      <div
                        key={s.id}
                        className="px-4 py-2.5 text-[11px] font-bold tabular-nums"
                        style={{ fontFamily: 'var(--font-mono)', borderLeft: '1px solid var(--border-hair)' }}
                      >
                        {delta === 0
                          ? <span style={{ color: 'var(--sage)' }}>Best ✓</span>
                          : <span style={{ color: 'var(--rose)' }}>−{formatTZS(Math.abs(delta))}</span>
                        }
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
