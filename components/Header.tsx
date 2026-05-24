'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Sun, Moon, Share2 } from 'lucide-react';
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
  onShare?: () => void;
  shareLabel?: string;
}

const SOURCE_DOT: Record<SchemaSource, string> = {
  loading:  'bg-zinc-500',
  remote:   'bg-sage-400',
  cache:    'bg-sky-400',
  fallback: 'bg-gold-400',
};

const SOURCE_LABEL: Record<SchemaSource, string> = {
  loading:  'loading',
  remote:   'live',
  cache:    'cached',
  fallback: 'offline',
};

export function Header({
  schemaVersion,
  schemaSource,
  currency,
  theme,
  onCurrencyToggle,
  onThemeToggle,
  onSchemaRefresh,
  onShare,
  shareLabel,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-20"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8" style={{ height: '52px' }}>
      {/* ── Wordmark ── */}
      <div className="flex items-center gap-2">
        {/* Icon mark */}
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--gold)',
            }}
          >
            P+
          </span>
        </div>

        {/* Text */}
        <span
          className="font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-primary)' }}
        >
          PAYE<span style={{ color: 'var(--gold)' }}>+</span>
        </span>

        {/* Subtle schema version pill — desktop */}
        <button
          onClick={onSchemaRefresh}
          title={`Schema v${schemaVersion} — click to refresh`}
          className={cn(
            'hidden sm:flex items-center gap-1.5 h-6 px-2 rounded-md ml-1',
            'text-[10px] font-medium transition-all duration-150 group',
          )}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse-glow',
              SOURCE_DOT[schemaSource]
            )}
            style={{ background: schemaSource === 'remote' ? 'var(--sage)' : schemaSource === 'cache' ? 'var(--sky)' : schemaSource === 'fallback' ? 'var(--gold)' : 'var(--text-muted)' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {SOURCE_LABEL[schemaSource]}
          </span>
          <span className="hidden md:inline opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>
            · v{schemaVersion}
          </span>
          <RefreshCw
            size={9}
            className="opacity-0 group-hover:opacity-50 group-hover:rotate-180 transition-all duration-500"
          />
        </button>
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-1">
        {/* Share button */}
        {onShare && (
          <button
            onClick={onShare}
            title="Share this calculation"
            className={cn(
              'flex items-center gap-1.5 h-7 px-2.5 rounded-md',
              'text-[11px] font-semibold transition-all duration-150',
              'border hover:border-gold/30',
            )}
            style={{
              borderColor: 'var(--border-subtle)',
              background: shareLabel ? 'var(--gold-ghost)' : 'transparent',
              color: shareLabel ? 'var(--gold)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Share2 size={11} />
            <span className="hidden sm:inline">{shareLabel || 'Share'}</span>
          </button>
        )}

        {/* Currency toggle */}
        <button
          onClick={onCurrencyToggle}
          title={`Switch to ${currency === 'TZS' ? 'USD' : 'TZS'}`}
          className="flex items-center h-7 px-2.5 rounded-md border transition-all duration-150 hover:border-gold/30"
          style={{
            borderColor: 'var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: 'var(--gold)',
          }}
        >
          {currency}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={`${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="flex items-center justify-center h-7 w-7 rounded-md border transition-all duration-150 hover:border-gold/30"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>
      </div>
    </motion.header>
  );
}
