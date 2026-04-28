'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';

import { GradientBackground } from '@/components/GradientBackground';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { SalaryInput } from '@/components/SalaryInput';
import { SalaryBreakdown } from '@/components/SalaryBreakdown';
import { WaterfallChart } from '@/components/WaterfallChart';
import { DeductionPieChart } from '@/components/DeductionPieChart';
import { AdvancedMode } from '@/components/AdvancedMode';
import { ReverseCalculator } from '@/components/ReverseCalculator';
import { ScenarioComparison } from '@/components/ScenarioComparison';
import { EmployerCostView } from '@/components/EmployerCostView';
import { ExportButton } from '@/components/ExportButton';

import { useSchema } from '@/hooks/useSchema';
import { useTheme } from '@/hooks/useTheme';
import { calculateBreakdown } from '@/lib/calculations';
import type { AppTab, Currency, AdvancedOptions } from '@/lib/types';
import { DEFAULT_ADVANCED } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Animated tab panel wrapper ───────────────────────────────────────────────

function TabPanel({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton rounded-2xl', className)} />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PayePlusApp() {
  const { schema, source, loading, error, refresh } = useSchema();
  const { theme, toggle: toggleTheme } = useTheme();

  const [gross, setGross] = useState(0);
  const [activeTab, setActiveTab] = useState<AppTab>('quick');
  const [currency, setCurrency] = useState<Currency>('TZS');
  const [advanced, setAdvanced] = useState<AdvancedOptions>({ ...DEFAULT_ADVANCED });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleCurrency = useCallback(() => {
    setCurrency((c) => (c === 'TZS' ? 'USD' : 'TZS'));
  }, []);

  const breakdown = useMemo(() => {
    if (!schema || gross === 0) {
      return {
        gross: 0, nssf: 0, taxable_income: 0, paye: 0,
        total_deductions: 0, net: 0, effective_rate: 0, marginal_rate: 0,
        custom_fixed: 0, custom_percent_amount: 0, benefits: 0,
      };
    }
    return calculateBreakdown(gross, schema, advanced);
  }, [gross, schema, advanced]);

  const usdRate = schema?.usd_rate ?? 2650;

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="relative" style={{ minHeight: "100dvh" }}
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <GradientBackground />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 space-y-4">
          <SkeletonCard className="h-16 w-72" />
          <SkeletonCard className="h-32" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} className="h-28" />
            ))}
          </div>
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  // ─── Schema error (hard fail) ───────────────────────────────────────────────
  if (!schema) {
    return (
      <div
        className="flex items-center justify-center p-8" style={{ minHeight: "100dvh" }}
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <GradientBackground />
        <div className="relative z-10 card-glass max-w-sm w-full p-8 text-center space-y-4">
          <AlertTriangle size={32} className="mx-auto text-amber-400" />
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            Schema failed to load
          </h2>
          <p className="text-sm text-slate-500">
            {error || 'Could not fetch the tax schema. Please check your connection.'}
          </p>
          <button
            onClick={refresh}
            className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <div
      className="relative transition-colors duration-300" style={{ minHeight: "100dvh" }}
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <GradientBackground />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <Header
          schemaVersion={schema.version}
          schemaLastUpdated={schema.last_updated}
          schemaSource={source}
          currency={currency}
          theme={theme}
          onCurrencyToggle={toggleCurrency}
          onThemeToggle={toggleTheme}
          onSchemaRefresh={refresh}
        />

        {/* ── Hero section ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="px-4 sm:px-8 pt-4 pb-6"
        >
          {/* Headline */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text leading-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Tanzania Salary<br className="sm:hidden" /> Intelligence
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                PAYE · NSSF · Net Pay · Reverse Calculator — powered by live TRA schema
              </p>
            </div>

            {/* Export button — always visible when there's a result */}
            {breakdown.gross > 0 && (
              <ExportButton
                breakdown={breakdown}
                schema={schema}
                advanced={advanced}
                currency={currency}
              />
            )}
          </div>

          {/* Tab navigation */}
          <div className="mb-6">
            <TabNavigation active={activeTab} onChange={setActiveTab} />
          </div>

          {/* ── Tab content ──────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeTab === 'quick' && (
              <TabPanel id="quick">
                <div className="space-y-5">
                  {/* Input card */}
                  <div className="card-glass p-5 sm:p-6">
                    <SalaryInput
                      value={gross}
                      onChange={setGross}
                      prefix={currency}
                      autoFocus
                    />

                    {/* Advanced toggle inline */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setShowAdvanced((v) => !v)}
                        className={cn(
                          'flex items-center gap-2 text-xs font-semibold',
                          'px-3 py-1.5 rounded-lg border transition-all duration-200',
                          showAdvanced
                            ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
                            : 'border-white/[0.07] bg-transparent text-slate-500 hover:text-slate-300'
                        )}
                      >
                        <Zap size={11} className={cn(showAdvanced && 'fill-brand-400')} />
                        {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
                      </button>

                      {gross > 0 && (
                        <p className="text-xs text-slate-600 font-mono">
                          Annual: TZS {((breakdown.gross + breakdown.benefits) * 12).toLocaleString('en-TZ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Advanced panel (conditional) */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <AdvancedMode options={advanced} onChange={setAdvanced} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Results */}
                  <AnimatePresence>
                    {breakdown.gross > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <SalaryBreakdown
                          breakdown={breakdown}
                          currency={currency}
                          usdRate={usdRate}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                          <div className="lg:col-span-3">
                            <WaterfallChart breakdown={breakdown} />
                          </div>
                          <div className="lg:col-span-2">
                            <DeductionPieChart
                              breakdown={breakdown}
                              currency={currency}
                              usdRate={usdRate}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty state */}
                  {breakdown.gross === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="card-glass p-12 text-center"
                    >
                      <div className="relative inline-flex mb-4">
                        <div className="text-5xl">🇹🇿</div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                          <Zap size={9} className="text-white" />
                        </div>
                      </div>
                      <h3
                        className="text-lg font-bold text-slate-300 mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        Enter your salary above
                      </h3>
                      <p className="text-sm text-slate-600 max-w-xs mx-auto">
                        PAYE+ will instantly compute PAYE, NSSF, net pay and generate
                        a beautiful breakdown — no data leaves your browser.
                      </p>
                    </motion.div>
                  )}
                </div>
              </TabPanel>
            )}

            {activeTab === 'advanced' && (
              <TabPanel id="advanced">
                <div className="space-y-5">
                  <div className="card-glass p-5 sm:p-6">
                    <SalaryInput
                      value={gross}
                      onChange={setGross}
                      prefix={currency}
                    />
                  </div>
                  <AdvancedMode options={advanced} onChange={setAdvanced} />
                  {breakdown.gross > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <SalaryBreakdown
                        breakdown={breakdown}
                        currency={currency}
                        usdRate={usdRate}
                      />
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-3">
                          <WaterfallChart breakdown={breakdown} />
                        </div>
                        <div className="lg:col-span-2">
                          <DeductionPieChart
                            breakdown={breakdown}
                            currency={currency}
                            usdRate={usdRate}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </TabPanel>
            )}

            {activeTab === 'compare' && (
              <TabPanel id="compare">
                <ScenarioComparison
                  schema={schema}
                  currency={currency}
                  currentGross={gross}
                  currentAdvanced={advanced}
                />
              </TabPanel>
            )}

            {activeTab === 'reverse' && (
              <TabPanel id="reverse">
                <ReverseCalculator
                  schema={schema}
                  currency={currency}
                  advanced={advanced}
                />
              </TabPanel>
            )}

            {activeTab === 'employer' && (
              <TabPanel id="employer">
                <div className="space-y-5">
                  <div className="card-glass p-5 sm:p-6">
                    <SalaryInput
                      value={gross}
                      onChange={setGross}
                      prefix={currency}
                    />
                  </div>
                  {gross > 0 ? (
                    <EmployerCostView gross={gross} schema={schema} currency={currency} />
                  ) : (
                    <div className="card-glass p-10 text-center">
                      <p className="text-sm text-slate-600">
                        Enter an employee gross salary above to calculate the full employer burden.
                      </p>
                    </div>
                  )}
                </div>
              </TabPanel>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="px-8 py-6 border-t border-white/[0.04]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>
              <span
                className="font-bold text-slate-500"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                PAYE+
              </span>{' '}
              · Tanzania Tax Intelligence · Schema v{schema.version}
            </p>
            <p>
              Rates per TRA {schema.year}. For reference only — consult a tax professional.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
