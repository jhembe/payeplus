'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Zap, ChevronDown } from 'lucide-react';

import { GradientBackground } from '@/components/GradientBackground';
import { Header } from '@/components/Header';
import { TabNavigation, SidebarTabNav, MobileTabNav } from '@/components/TabNavigation';
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

// ─── URL param helpers ────────────────────────────────────────────────────────

function encodeShareURL(gross: number, advanced: AdvancedOptions): string {
  const p = new URLSearchParams();
  if (gross > 0) p.set('g', String(gross));
  if (advanced.nssf_rate_override !== 10) p.set('nssf', String(advanced.nssf_rate_override));
  if (advanced.heslb_enabled) {
    p.set('heslb', '1');
    if (advanced.heslb_rate !== 15) p.set('hrate', String(advanced.heslb_rate));
  }
  if (advanced.benefits > 0) p.set('ben', String(advanced.benefits));
  if (!advanced.include_benefits_in_nssf) p.set('bni', '0');
  if (advanced.custom_fixed_deduction > 0) p.set('cfix', String(advanced.custom_fixed_deduction));
  if (advanced.custom_percent_deduction > 0) p.set('cpct', String(advanced.custom_percent_deduction));
  const qs = p.toString();
  return qs ? `${window.location.origin}${window.location.pathname}?${qs}` : window.location.origin + window.location.pathname;
}

function decodeShareURL(): { gross: number; advanced: AdvancedOptions } | null {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  if (!p.has('g')) return null;
  const gross = parseInt(p.get('g') || '0', 10) || 0;
  const advanced: AdvancedOptions = {
    ...DEFAULT_ADVANCED,
    nssf_rate_override: parseFloat(p.get('nssf') || '10') || 10,
    heslb_enabled: p.get('heslb') === '1',
    heslb_rate: parseFloat(p.get('hrate') || '15') || 15,
    benefits: parseFloat(p.get('ben') || '0') || 0,
    include_benefits_in_nssf: p.get('bni') !== '0',
    custom_fixed_deduction: parseFloat(p.get('cfix') || '0') || 0,
    custom_percent_deduction: parseFloat(p.get('cpct') || '0') || 0,
  };
  return { gross, advanced };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabPanel({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function PayePlusApp() {
  const { schema, source, loading, error, refresh } = useSchema();
  const { theme, toggle: toggleTheme } = useTheme();

  const [gross, setGross] = useState(0);
  const [activeTab, setActiveTab] = useState<AppTab>('quick');
  const [currency, setCurrency] = useState<Currency>('TZS');
  const [advanced, setAdvanced] = useState<AdvancedOptions>({ ...DEFAULT_ADVANCED });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [shareLabel, setShareLabel] = useState('');
  const shareLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const decoded = decodeShareURL();
    if (!decoded) return;
    if (decoded.gross > 0) setGross(decoded.gross);
    setAdvanced(decoded.advanced);
    if (decoded.advanced.heslb_enabled || decoded.advanced.custom_fixed_deduction > 0 || decoded.advanced.benefits > 0) {
      setShowAdvanced(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = encodeShareURL(gross, advanced);
    window.history.replaceState(null, '', url);
  }, [gross, advanced]);

  const toggleCurrency = useCallback(() => {
    setCurrency((c) => (c === 'TZS' ? 'USD' : 'TZS'));
  }, []);

  const handleShare = useCallback(async () => {
    const url = encodeShareURL(gross, advanced);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShareLabel('Copied!');
    if (shareLabelTimer.current) clearTimeout(shareLabelTimer.current);
    shareLabelTimer.current = setTimeout(() => setShareLabel(''), 2200);
  }, [gross, advanced]);

  const breakdown = useMemo(() => {
    if (!schema || gross === 0) {
      return {
        gross: 0, nssf: 0, taxable_income: 0, paye: 0, heslb: 0,
        total_deductions: 0, net: 0, effective_rate: 0, marginal_rate: 0,
        custom_fixed: 0, custom_percent_amount: 0, benefits: 0,
      };
    }
    return calculateBreakdown(gross, schema, advanced);
  }, [gross, schema, advanced]);

  const usdRate = schema?.usd_rate ?? 2650;

  if (loading) {
    return (
      <div className="relative" style={{ minHeight: '100dvh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <GradientBackground />
        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-16 space-y-3">
          <SkeletonCard className="h-10 w-40" />
          <SkeletonCard className="h-20" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-24" />)}
          </div>
          <SkeletonCard className="h-52" />
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div
        className="flex items-center justify-center p-8"
        style={{ minHeight: '100dvh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <GradientBackground />
        <div
          className="relative z-10 max-w-sm w-full p-8 text-center space-y-4"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <AlertTriangle size={26} style={{ color: 'var(--gold)', margin: '0 auto' }} />
          <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
            Schema failed to load
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
            {error || 'Could not fetch the tax schema. Check your connection.'}
          </p>
          <button
            onClick={refresh}
            className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
            style={{ background: 'var(--gold)', color: '#0C0C0D', fontFamily: 'var(--font-body)' }}
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative transition-colors duration-300"
      style={{ minHeight: '100dvh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <GradientBackground />

      {/* ── Full-width sticky header ── */}
      <Header
        schemaVersion={schema.version}
        schemaLastUpdated={schema.last_updated}
        schemaSource={source}
        currency={currency}
        theme={theme}
        onCurrencyToggle={toggleCurrency}
        onThemeToggle={toggleTheme}
        onSchemaRefresh={refresh}
        onShare={gross > 0 ? handleShare : undefined}
        shareLabel={shareLabel}
      />

      {/* ── Content area ── */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto lg:flex lg:items-start">

          {/* ── Desktop sidebar nav ── */}
          <aside
            className="hidden lg:flex flex-col w-52 shrink-0 sticky top-[52px]"
            style={{
              height: 'calc(100dvh - 52px)',
              borderRight: '1px solid var(--border-subtle)',
              overflowY: 'auto',
            }}
          >
            <SidebarTabNav active={activeTab} onChange={setActiveTab} />

            {/* Sidebar footer */}
            <div className="mt-auto px-4 py-5 border-t" style={{ borderColor: 'var(--border-hair)' }}>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                TRA {schema.year} rates
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-ghost)', fontFamily: 'var(--font-body)' }}>
                For reference only
              </p>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* Horizontal tab bar — sm to lg */}
            <div className="px-3 sm:px-5 pt-3 sm:pt-4">
              <TabNavigation active={activeTab} onChange={setActiveTab} />
            </div>

            {/* Animated tab content */}
            <div className="px-3 sm:px-5 lg:px-6 pb-nav sm:pb-8 lg:pb-10 pt-3">
              <AnimatePresence mode="wait">

                {/* Quick tab */}
                {activeTab === 'quick' && (
                  <TabPanel id="quick">
                    <div className="space-y-2">
                      <div className="card p-4 sm:p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <SalaryInput value={gross} onChange={setGross} prefix={currency} autoFocus />

                        <div className="mt-3 flex items-center justify-between">
                          <button
                            onClick={() => setShowAdvanced((v) => !v)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all duration-200"
                            style={{
                              borderColor: showAdvanced ? 'var(--gold)' : 'var(--border-subtle)',
                              background: showAdvanced ? 'var(--gold-ghost)' : 'transparent',
                              color: showAdvanced ? 'var(--gold)' : 'var(--text-muted)',
                              fontFamily: 'var(--font-body)',
                            }}
                          >
                            <Zap size={10} />
                            {showAdvanced ? 'Hide options' : 'Advanced options'}
                            <ChevronDown
                              size={10}
                              className="transition-transform duration-200"
                              style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                          </button>

                          {gross > 0 && (
                            <ExportButton
                              breakdown={breakdown}
                              schema={schema}
                              advanced={advanced}
                              currency={currency}
                              compact
                            />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <AdvancedMode options={advanced} onChange={setAdvanced} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {breakdown.gross > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                          >
                            <SalaryBreakdown breakdown={breakdown} currency={currency} usdRate={usdRate} />
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                              <div className="lg:col-span-3">
                                <WaterfallChart breakdown={breakdown} />
                              </div>
                              <div className="lg:col-span-2">
                                <DeductionPieChart breakdown={breakdown} currency={currency} usdRate={usdRate} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {breakdown.gross === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="card p-10 sm:p-14 text-center"
                          style={{ borderRadius: 'var(--radius-card)' }}
                        >
                          <div
                            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-5"
                            style={{ background: 'var(--gold-ghost)', border: '1px solid var(--border-subtle)' }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '14px',
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
                                color: 'var(--gold)',
                              }}
                            >
                              TZS
                            </span>
                          </div>
                          <p
                            className="text-[15px] font-semibold mb-1.5"
                            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                          >
                            Enter your salary to begin
                          </p>
                          <p
                            className="text-xs max-w-xs mx-auto"
                            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                          >
                            PAYE, NSSF, net pay and full breakdown — computed instantly.
                            Nothing leaves your browser.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </TabPanel>
                )}

                {/* Advanced tab */}
                {activeTab === 'advanced' && (
                  <TabPanel id="advanced">
                    <div className="space-y-2">
                      <div className="card p-4 sm:p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <SalaryInput value={gross} onChange={setGross} prefix={currency} />
                      </div>
                      <AdvancedMode options={advanced} onChange={setAdvanced} />
                      {breakdown.gross > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <SalaryBreakdown breakdown={breakdown} currency={currency} usdRate={usdRate} />
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                            <div className="lg:col-span-3">
                              <WaterfallChart breakdown={breakdown} />
                            </div>
                            <div className="lg:col-span-2">
                              <DeductionPieChart breakdown={breakdown} currency={currency} usdRate={usdRate} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </TabPanel>
                )}

                {/* Compare tab */}
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

                {/* Reverse tab */}
                {activeTab === 'reverse' && (
                  <TabPanel id="reverse">
                    <ReverseCalculator schema={schema} currency={currency} advanced={advanced} />
                  </TabPanel>
                )}

                {/* Employer tab */}
                {activeTab === 'employer' && (
                  <TabPanel id="employer">
                    <div className="space-y-2">
                      <div className="card p-4 sm:p-5" style={{ borderRadius: 'var(--radius-card)' }}>
                        <SalaryInput value={gross} onChange={setGross} prefix={currency} />
                      </div>
                      {gross > 0 ? (
                        <EmployerCostView gross={gross} schema={schema} currency={currency} />
                      ) : (
                        <div className="card p-10 text-center" style={{ borderRadius: 'var(--radius-card)' }}>
                          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                            Enter an employee gross salary above to calculate the full employer cost.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabPanel>
                )}

              </AnimatePresence>
            </div>

            {/* Desktop footer */}
            <footer
              className="hidden sm:flex px-5 lg:px-6 py-4 items-center justify-between gap-3"
              style={{ borderTop: '1px solid var(--border-hair)' }}
            >
              <p className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>PAYE+</span>
                {' '}· Tanzania Tax Intelligence · Schema v{schema.version}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                TRA {schema.year} rates · For reference only
              </p>
            </footer>
          </main>
        </div>
      </div>

      {/* ── Mobile bottom nav — rendered OUTSIDE motion.div so CSS transform doesn't break position:fixed ── */}
      <MobileTabNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
