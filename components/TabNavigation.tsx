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
  { id: 'quick',    label: 'Quick Calc',   shortLabel: 'Quick',    icon: <Calculator size={15} /> },
  { id: 'advanced', label: 'Advanced',     shortLabel: 'Advanced', icon: <SlidersHorizontal size={15} /> },
  { id: 'compare',  label: 'Compare',      shortLabel: 'Compare',  icon: <GitCompare size={15} /> },
  { id: 'reverse',  label: 'Reverse',      shortLabel: 'Reverse',  icon: <ArrowLeftRight size={15} /> },
  { id: 'employer', label: 'Employer Cost',shortLabel: 'Employer', icon: <Building2 size={15} /> },
];

interface TabNavigationProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

export function TabNavigation({ active, onChange }: TabNavigationProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-1 p-1 rounded-2xl',
        // no-scrollbar defined in globals.css — includes -webkit-overflow-scrolling: touch
        'overflow-x-auto no-scrollbar',
        'border border-white/[0.07]',
      )}
      style={{ background: 'var(--bg-elevated)' }}
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
              'relative flex items-center gap-2 px-3 sm:px-4 rounded-xl',
              'text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0',
              'transition-colors duration-200 focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-brand-500/50',
              // iOS HIG: minimum 44pt touch target
              'min-h-[44px]',
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/90 to-electric-500/80 shadow-brand-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span className={cn('flex-shrink-0 transition-transform duration-200', isActive && 'scale-110')}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
