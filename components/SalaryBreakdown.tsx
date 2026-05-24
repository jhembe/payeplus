'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Wallet, Shield, Receipt, ArrowUpRight, GraduationCap } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';
import type { SalaryBreakdown as SalaryBreakdownType, Currency } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';

interface SalaryBreakdownProps {
  breakdown: SalaryBreakdownType;
  currency: Currency;
  usdRate: number;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function SalaryBreakdown({ breakdown, currency, usdRate }: SalaryBreakdownProps) {
  const fmt = (n: number) => formatCurrency(n, currency, usdRate);
  const hasCustom = breakdown.custom_fixed + breakdown.custom_percent_amount > 0;
  const hasHeslb  = breakdown.heslb > 0;
  const grossTotal = breakdown.gross + breakdown.benefits;

  return (
    <motion.div
      key={breakdown.gross}
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full space-y-2"
    >
      {/* ── Row 1: Net (hero) + PAYE + NSSF ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

        {/* ── Net Take-Home — HERO ── */}
        <motion.div
          variants={item}
          className="card-sage col-span-2 sm:col-span-2 p-5 sm:p-6 relative overflow-hidden group"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          {/* Tinted background wash */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{ background: 'linear-gradient(135deg, var(--sage-ghost) 0%, transparent 60%)' }}
          />

          <div className="relative flex items-start justify-between mb-3">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: 'var(--sage-ghost)', color: 'var(--sage)' }}
            >
              <Wallet size={13} />
            </div>
            <ArrowUpRight
              size={13}
              className="group-hover:scale-110 transition-transform duration-200"
              style={{ color: 'var(--sage)', opacity: 0.4 }}
            />
          </div>

          {/* Hero number — Instrument Serif italic */}
          <p
            className="relative leading-none mb-2"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 5vw, 36px)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--sage)',
            }}
          >
            <AnimatedNumber value={breakdown.net} formatter={fmt} duration={700} />
          </p>

          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Net Take-Home
          </p>
          <p
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            {formatPercent((breakdown.net / (grossTotal || 1)) * 100, 1)} of gross
          </p>
        </motion.div>

        {/* ── PAYE ── */}
        <motion.div
          variants={item}
          className="card-rose p-4 relative overflow-hidden group"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{ background: 'linear-gradient(135deg, var(--rose-ghost) 0%, transparent 60%)' }}
          />
          <div
            className="relative p-1.5 rounded-lg mb-3 inline-flex"
            style={{ background: 'var(--rose-ghost)', color: 'var(--rose)' }}
          >
            <Receipt size={13} />
          </div>
          <p
            className="relative font-bold tabular-nums leading-none mb-1.5"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.03em',
              color: 'var(--rose)',
            }}
          >
            <AnimatedNumber value={breakdown.paye} formatter={fmt} duration={550} />
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            PAYE Tax
          </p>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {formatPercent(breakdown.marginal_rate, 0)} marginal
          </p>
        </motion.div>

        {/* ── NSSF ── */}
        <motion.div
          variants={item}
          className="card-sky p-4 relative overflow-hidden group"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{ background: 'linear-gradient(135deg, var(--sky-ghost) 0%, transparent 60%)' }}
          />
          <div
            className="relative p-1.5 rounded-lg mb-3 inline-flex"
            style={{ background: 'var(--sky-ghost)', color: 'var(--sky)' }}
          >
            <Shield size={13} />
          </div>
          <p
            className="relative font-bold tabular-nums leading-none mb-1.5"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.03em',
              color: 'var(--sky)',
            }}
          >
            <AnimatedNumber value={breakdown.nssf} formatter={fmt} duration={550} />
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            NSSF
          </p>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {formatPercent((breakdown.nssf / (grossTotal || 1)) * 100, 1)} of gross
          </p>
        </motion.div>
      </div>

      {/* ── Stats strip ── */}
      <motion.div variants={item}>
        <div
          className="card overflow-hidden"
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          <div
            className={cn(
              'grid divide-x',
              hasHeslb || hasCustom ? 'grid-cols-4' : 'grid-cols-3'
            )}
            style={{ borderColor: 'var(--border-hair)' }}
          >
            {/* Taxable Income */}
            <div className="px-3.5 py-3">
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Taxable
              </p>
              <p
                className="font-bold tabular-nums text-[12px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
              >
                {fmt(breakdown.taxable_income)}
              </p>
            </div>

            {/* Effective Rate */}
            <div className="px-3.5 py-3">
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Effective
              </p>
              <p
                className="font-bold text-[12px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
              >
                {formatPercent(breakdown.effective_rate, 1)}
              </p>
            </div>

            {/* Total Deductions */}
            <div className="px-3.5 py-3">
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                <TrendingDown size={9} />
                Deductions
              </p>
              <p
                className="font-bold tabular-nums text-[12px]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose)' }}
              >
                {fmt(breakdown.total_deductions)}
              </p>
            </div>

            {/* HESLB — when present */}
            {hasHeslb && (
              <div className="px-3.5 py-3">
                <p
                  className="text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  <GraduationCap size={9} />
                  HESLB
                </p>
                <p
                  className="font-bold tabular-nums text-[12px]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--violet)' }}
                >
                  {fmt(breakdown.heslb)}
                </p>
              </div>
            )}

            {/* Custom — when present and no HESLB */}
            {!hasHeslb && hasCustom && (
              <div className="px-3.5 py-3">
                <p
                  className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  Custom
                </p>
                <p
                  className="font-bold tabular-nums text-[12px]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--violet)' }}
                >
                  -{fmt(breakdown.custom_fixed + breakdown.custom_percent_amount)}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
