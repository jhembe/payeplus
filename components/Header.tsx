'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Sun, Moon, DollarSign, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Currency, Theme } from '@/lib/types';
import type { SchemaSource } from '@/hooks/useSchema';

interface HeaderProps {
  schemaVersion: string;
  schemaLastUpdated: string;
  schemaSource: SchemaSource;
  currency: Currency;
  theme: Theme;
  onCurrencyToggle: () => void;
  onThemeToggle: () => void;
  onSchemaRefresh: () => void;
}

const SOURCE_CONFIG: Record<SchemaSource, { label: string; color: string; dot: string }> = {
  loading: { label: 'Loading…',  color: 'text-slate-400',  dot: 'bg-slate-500' },
  remote:  { label: 'Live',      color: 'text-emerald-400', dot: 'bg-emerald-400' },
  cache:   { label: 'Cached',    color: 'text-sky-400',     dot: 'bg-sky-400' },
  fallback:{ label: 'Offline',   color: 'text-amber-400',   dot: 'bg-amber-400' },
};

export function Header({
  schemaVersion,
  schemaLastUpdated,
  schemaSource,
  currency,
  theme,
  onCurrencyToggle,
  onThemeToggle,
  onSchemaRefresh,
}: HeaderProps) {
  const src = SOURCE_CONFIG[schemaSource];

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-electric-500 opacity-90" />
          <div className="absolute inset-0 rounded-xl flex items-center justify-center">
            <span
              className="font-bold text-white leading-none"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', letterSpacing: '-0.5px' }}
            >
              P+
            </span>
          </div>
        </div>
        <div>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}
          >
            PAYE
            <span className="bg-gradient-to-r from-brand-400 to-electric-400 bg-clip-text text-transparent">+</span>
          </span>
          <span className="ml-1.5 text-xs font-medium hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
            Tanzania Tax Intelligence
          </span>
        </div>
      </div>

      {/* Controls — min 44px touch targets on all buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Schema status */}
        <button
          onClick={onSchemaRefresh}
          title={`Schema v${schemaVersion} · click to refresh`}
          className={cn(
            'hidden sm:flex items-center gap-2 px-3 rounded-lg text-xs font-medium',
            'border transition-all duration-200 group min-h-[44px]',
            'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]',
            src.color
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', src.dot)} />
          <span className="hidden md:inline">{schemaLastUpdated} · </span>
          <span>v{schemaVersion}</span>
          <RefreshCw
            size={11}
            className="opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500"
          />
        </button>

        {/* Currency toggle */}
        <button
          onClick={onCurrencyToggle}
          title={`Switch to ${currency === 'TZS' ? 'USD' : 'TZS'}`}
          className={cn(
            'flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold',
            'border transition-all duration-200 font-mono min-h-[44px]',
            'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]',
            currency === 'TZS' ? 'text-brand-400' : 'text-electric-400'
          )}
        >
          {currency === 'TZS' ? <Coins size={13} /> : <DollarSign size={13} />}
          {currency}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className={cn(
            'flex items-center justify-center rounded-lg border',
            'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]',
            'transition-all duration-200 min-h-[44px] min-w-[44px]',
            'text-slate-400 hover:text-slate-200'
          )}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </motion.header>
  );
}
