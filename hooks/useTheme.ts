'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/lib/types';

const STORAGE_KEY = 'payeplus__theme';

/**
 * Applies theme by setting CSS custom properties on :root.
 * Called both on initial load and on toggle.
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.setProperty('--bg-base',       '#F0F2FA');
    root.style.setProperty('--bg-surface',    '#FFFFFF');
    root.style.setProperty('--bg-elevated',   '#F8FAFF');
    root.style.setProperty('--border-subtle', 'rgba(0,0,0,0.05)');
    root.style.setProperty('--border-default','rgba(0,0,0,0.08)');
    root.style.setProperty('--text-primary',  '#0F172A');
    root.style.setProperty('--text-secondary','#475569');
    root.style.setProperty('--text-tertiary', '#94A3B8');
    root.style.setProperty('--text-muted',    '#CBD5E1');
    root.style.setProperty('--shadow-card',   '0 4px 24px rgba(0,0,0,0.08)');
    root.style.setProperty('--shadow-glow',   '0 0 30px rgba(99,102,241,0.08)');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.setProperty('--bg-base',       '#080B14');
    root.style.setProperty('--bg-surface',    '#0E1019');
    root.style.setProperty('--bg-elevated',   '#13172A');
    root.style.setProperty('--border-subtle', 'rgba(255,255,255,0.06)');
    root.style.setProperty('--border-default','rgba(255,255,255,0.09)');
    root.style.setProperty('--text-primary',  '#F1F5F9');
    root.style.setProperty('--text-secondary','#94A3B8');
    root.style.setProperty('--text-tertiary', '#475569');
    root.style.setProperty('--text-muted',    '#334155');
    root.style.setProperty('--shadow-card',   '0 4px 24px rgba(0,0,0,0.5)');
    root.style.setProperty('--shadow-glow',   '0 0 30px rgba(99,102,241,0.15)');
  }
}

/**
 * Reads persisted theme synchronously — used to inject a blocking script
 * in layout.tsx to prevent flash of wrong theme on page load.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  // Start with dark as SSR default (matching the inline script in layout.tsx)
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { theme, toggle, mounted };
}
