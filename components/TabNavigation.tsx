'use client';

import { motion } from 'framer-motion';
import {
  Calculator, SlidersHorizontal, GitCompare,
  ArrowLeftRight, Building2,
} from 'lucide-react';
import type { AppTab } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Tab {
  id: AppTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'quick',    label: 'Quick',    shortLabel: 'Quick',    icon: <Calculator size={16} /> },
  { id: 'advanced', label: 'Advanced', shortLabel: 'Advanced', icon: <SlidersHorizontal size={16} /> },
  { id: 'compare',  label: 'Compare',  shortLabel: 'Compare',  icon: <GitCompare size={16} /> },
  { id: 'reverse',  label: 'Reverse',  shortLabel: 'Reverse',  icon: <ArrowLeftRight size={16} /> },
  { id: 'employer', label: 'Employer', shortLabel: 'Employer', icon: <Building2 size={16} /> },
];

interface TabNavigationProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

export function TabNavigation({ active, onChange }: TabNavigationProps) {
  return (
    <>
      {/* ── Desktop tab bar ── */}
      <div
        className="hidden sm:flex items-stretch gap-0 overflow-x-auto no-scrollbar"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
        }}
        role="tablist"
        aria-label="Calculator modes"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 whitespace-nowrap flex-shrink-0',
                'text-[13px] font-medium transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
                isActive
                  ? 'text-gold'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <span className={cn('opacity-70', isActive && 'opacity-100')}>{tab.icon}</span>
              {tab.label}

              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                  style={{ background: 'var(--gold)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-30"
        style={{
          background: 'rgba(12,12,13,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border-subtle)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        role="tablist"
        aria-label="Calculator modes"
      >
        <div className="flex items-center justify-around h-14 px-1">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 flex-1',
                  'min-h-[44px] rounded-xl py-1.5 mx-0.5',
                  'transition-all duration-200 focus:outline-none',
                  isActive ? 'text-gold' : 'text-zinc-600 hover:text-zinc-400',
                )}
              >
                {/* Active dot above icon */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute top-1.5 inset-x-4 h-[2px] rounded-full"
                    style={{ background: 'var(--gold)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={cn('transition-transform duration-200', isActive ? 'scale-110' : 'scale-100')}>
                  {tab.icon}
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.02em' }}
                >
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
