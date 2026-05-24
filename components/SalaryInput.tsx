'use client';

import { useRef, useCallback, useEffect } from 'react';
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

function formatWithCommas(n: number): string {
  if (!n || isNaN(n)) return '';
  return new Intl.NumberFormat('en-US').format(n);
}

function parseRawDigits(str: string): number {
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return isNaN(n) ? 0 : n;
}

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
  placeholder = '',
  prefix = 'TZS',
  className,
  autoFocus = false,
}: SalaryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || isFocused.current) return;
    el.value = value > 0 ? formatWithCommas(value) : '';
  }, [value]);

  const handleFocus = useCallback(() => { isFocused.current = true; }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    const el = inputRef.current;
    if (!el) return;
    const numeric = parseRawDigits(el.value);
    el.value = numeric > 0 ? formatWithCommas(numeric) : '';
    onChange(numeric);
  }, [onChange]);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const oldFormatted = el.value;
    const oldCursor = el.selectionStart ?? oldFormatted.length;
    const numeric = parseRawDigits(oldFormatted);
    const newFormatted = numeric > 0 ? formatWithCommas(numeric) : '';

    if (el.value !== newFormatted) {
      const newCursor = computeNewCursor(oldFormatted, newFormatted, oldCursor);
      el.value = newFormatted;
      requestAnimationFrame(() => {
        try { el.setSelectionRange(newCursor, newCursor); } catch { /* Safari */ }
      });
    }
    onChange(numeric);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const nav = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    const isDigit = /^[0-9]$/.test(e.key);
    const isModifier = e.ctrlKey || e.metaKey || e.altKey;
    if (!isDigit && !nav.includes(e.key) && !isModifier) e.preventDefault();
  }, []);

  const initialDisplay = value > 0 ? formatWithCommas(value) : '';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          className="block mb-2"
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </label>
      )}

      <div
        className="relative flex items-center rounded-xl border cursor-text transition-all duration-150 focus-within:border-gold/50"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border-default)',
          minHeight: '54px',
          boxShadow: 'var(--shadow-input)',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Currency prefix */}
        <div
          className="flex-shrink-0 flex items-center self-stretch px-3.5"
          style={{ borderRight: '1px solid var(--border-hair)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--gold)',
            }}
          >
            {prefix}
          </span>
        </div>

        {/* Number input — font-size ≥ 16px prevents iOS auto-zoom */}
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
          className="flex-1 min-w-0 bg-transparent outline-none text-right px-4 truncate"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {/* Sub-label */}
      <p
        className="mt-1.5 text-right"
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-ghost)',
        }}
      >
        {value > 0
          ? `${(value / 1_000_000).toFixed(3)}M · ${(value * 12 / 1_000_000).toFixed(2)}M / yr`
          : 'Enter monthly gross salary'}
      </p>
    </div>
  );
}
