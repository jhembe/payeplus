'use client';

import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  prefix?: string;
  className?: string;
  autoFocus?: boolean;
}

/** Formats an integer as comma-separated: 1500000 → "1,500,000" */
function formatWithCommas(n: number): string {
  if (!n || isNaN(n)) return '';
  return new Intl.NumberFormat('en-US').format(n);
}

/** Strips commas/non-digits and returns the integer value */
function parseRawDigits(str: string): number {
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * After reformatting with commas, compute where the cursor should land.
 * Strategy: count digit characters to the left of oldCursor in oldFormatted,
 * then find that same nth-digit position in newFormatted.
 */
function computeNewCursor(oldFormatted: string, newFormatted: string, oldCursor: number): number {
  let digitsBefore = 0;
  for (let i = 0; i < oldCursor && i < oldFormatted.length; i++) {
    if (/\d/.test(oldFormatted[i])) digitsBefore++;
  }
  let count = 0;
  for (let i = 0; i < newFormatted.length; i++) {
    if (/\d/.test(newFormatted[i])) {
      count++;
      if (count === digitsBefore) return i + 1;
    }
  }
  return newFormatted.length;
}

export function SalaryInput({
  value,
  onChange,
  label = 'Gross Monthly Salary',
  placeholder = '0',
  prefix = 'TZS',
  className,
  autoFocus = false,
}: SalaryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  // Sync display when parent resets value externally (e.g. to 0)
  useEffect(() => {
    const el = inputRef.current;
    if (!el || isFocused.current) return;
    el.value = value > 0 ? formatWithCommas(value) : '';
  }, [value]);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    const el = inputRef.current;
    if (!el) return;
    const numeric = parseRawDigits(el.value);
    el.value = numeric > 0 ? formatWithCommas(numeric) : '';
    onChange(numeric);
  }, [onChange]);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      const oldFormatted = el.value;
      const oldCursor = el.selectionStart ?? oldFormatted.length;

      const numeric = parseRawDigits(oldFormatted);
      const newFormatted = numeric > 0 ? formatWithCommas(numeric) : '';

      if (el.value !== newFormatted) {
        const newCursor = computeNewCursor(oldFormatted, newFormatted, oldCursor);
        el.value = newFormatted;
        // rAF avoids iOS flicker when repositioning cursor
        requestAnimationFrame(() => {
          try {
            el.setSelectionRange(newCursor, newCursor);
          } catch {
            // Safari can throw on setSelectionRange — safe to ignore
          }
        });
      }

      onChange(numeric);
    },
    [onChange]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const navigationKeys = [
      'Backspace','Delete','Tab','Escape','Enter',
      'ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End',
    ];
    const isDigit = /^[0-9]$/.test(e.key);
    const isModifier = e.ctrlKey || e.metaKey || e.altKey;
    if (!isDigit && !navigationKeys.includes(e.key) && !isModifier) {
      e.preventDefault();
    }
  }, []);

  const initialDisplay = value > 0 ? formatWithCommas(value) : '';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          className="block text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </label>
      )}

      <motion.div     
      className={cn(
          'relative flex items-center gap-3 px-4 sm:px-5 py-4 rounded-2xl cursor-text',
          'border transition-all duration-300 overflow-hidden',
          'focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
        )}
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
        whileTap={{ scale: 0.998 }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Currency badge */}
        <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-md font-mono tracking-wider transition-colors duration-200 select-none bg-brand-500/15 text-brand-400">
          {prefix}
        </span>

        {/*
          iOS-safe input:
          · type="text" so we control formatting (type="number" strips commas)
          · inputMode="decimal" → numeric keypad on iOS/Android
          · font-size >= 16px → prevents iOS auto-zoom on focus
          · autoCorrect/autoCapitalize/spellCheck off → no red squiggles
          · pattern hints iOS to show number pad
        */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          pattern="[0-9,]*"
          defaultValue={initialDisplay}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label={label || 'Salary amount'}
          className="
            flex-1 min-w-0
            bg-transparent outline-none
            text-right truncate
            font-mono font-bold tabular-nums
            placeholder:text-slate-700
          "
          style={{
            fontSize: 'max(16px, 1.75rem)',   // iOS zoom prevention
            color: 'var(--text-primary)',
            WebkitAppearance: 'none',          // remove iOS default styling
          }}
        />
      </motion.div>

      <p className="mt-2 text-xs text-right font-mono" style={{ color: 'var(--text-muted)' }}>
        {value > 0
          ? `≈ ${(value / 1_000_000).toFixed(3)}M TZS / month`
          : 'Enter your gross monthly salary'}
      </p>
    </div>
  );
}
