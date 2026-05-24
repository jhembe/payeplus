'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal, Info, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdvancedOptions } from '@/lib/types';
import { DEFAULT_ADVANCED } from '@/lib/types';

interface AdvancedModeProps {
  options: AdvancedOptions;
  onChange: (opts: AdvancedOptions) => void;
}

function SliderField({
  label, value, min, max, step, unit = '%', tooltip, onChange, accentColor = 'var(--gold)',
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; tooltip?: string; onChange: (v: number) => void; accentColor?: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label
            className="text-[12px] font-medium"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
          >
            {label}
          </label>
          {tooltip && (
            <div className="group relative">
              <Info size={11} style={{ color: 'var(--text-muted)' }} className="cursor-help" />
              <div
                className="absolute left-0 bottom-5 w-52 p-2.5 rounded-lg border text-[11px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none leading-relaxed"
                style={{
                  background: 'var(--bg-overlay)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-popover)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={cn(
              'w-16 text-right bg-transparent text-[13px] font-bold',
              'border-b border-dashed focus:border-solid outline-none pb-0.5 transition-colors'
            )}
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <span
            className="text-[11px]"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {unit}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${percent}%`, background: accentColor }}
          />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1"
          aria-label={label}
        />
      </div>

      <div
        className="flex justify-between text-[10px]"
        style={{ color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}
      >
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberField({
  label, value, onChange, prefix = 'TZS', placeholder = '0', tooltip,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; placeholder?: string; tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label
          className="text-[12px] font-medium"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          {label}
        </label>
        {tooltip && (
          <div className="group relative">
            <Info size={11} style={{ color: 'var(--text-muted)' }} className="cursor-help" />
            <div
              className="absolute left-0 bottom-5 w-52 p-2.5 rounded-lg border text-[11px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none leading-relaxed"
              style={{
                background: 'var(--bg-overlay)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-popover)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors focus-within:border-gold/50"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-input)',
        }}
      >
        <span
          className="text-[11px] font-bold flex-shrink-0"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {prefix}
        </span>
        <input
          type="number"
          value={value || ''}
          placeholder={placeholder}
          min={0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none text-right font-mono text-[13px] font-semibold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'max(16px, 13px)',
          }}
        />
      </div>
    </div>
  );
}

function Toggle({
  label, checked, onChange, description,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={cn('toggle-track', checked && 'checked')} />
        <div className={cn('toggle-thumb', checked && 'checked')} />
      </div>
      <div>
        <p
          className="text-[12px] font-medium transition-colors"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          {label}
        </p>
        {description && (
          <p
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

export function AdvancedMode({ options, onChange }: AdvancedModeProps) {
  const update = <K extends keyof AdvancedOptions>(key: K, value: AdvancedOptions[K]) =>
    onChange({ ...options, [key]: value });

  const reset = () => onChange({ ...DEFAULT_ADVANCED });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="card p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: 'var(--gold-ghost)', color: 'var(--gold)' }}
          >
            <SlidersHorizontal size={13} />
          </div>
          <div>
            <h3
              className="text-[13px] font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            >
              Advanced Options
            </h3>
            <p
              className="text-[11px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              Customise deductions &amp; benefits
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-[11px] transition-colors px-2 py-1 rounded-md"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <RotateCcw size={10} />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Social Security */}
        <div>
          <p
            className="text-[10px] uppercase tracking-widest font-bold mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Social Security
          </p>
          <SliderField
            label="NSSF Employee Rate"
            value={options.nssf_rate_override}
            min={0} max={20} step={0.5} unit="%"
            tooltip="Standard rate is 10%. Override for exempt employees."
            onChange={(v) => update('nssf_rate_override', v)}
            accentColor="var(--sky)"
          />
          <div className="mt-4">
            <Toggle
              label="Include benefits in NSSF base"
              checked={options.include_benefits_in_nssf}
              onChange={(v) => update('include_benefits_in_nssf', v)}
              description="Non-cash benefits included in the NSSF calculation base."
            />
          </div>
        </div>

        {/* Additional Deductions */}
        <div>
          <p
            className="text-[10px] uppercase tracking-widest font-bold mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Additional Deductions
          </p>

          <div className="space-y-4">
            <Toggle
              label="HESLB Student Loan"
              checked={options.heslb_enabled}
              onChange={(v) => update('heslb_enabled', v)}
              description="HESLB repayments are deducted post-tax."
            />

            {options.heslb_enabled && (
              <div className="mt-2">
                <SliderField
                  label="HESLB Rate"
                  value={options.heslb_rate}
                  min={5} max={25} step={0.5} unit="%"
                  tooltip="Standard HESLB repayment is 15% of gross. Does not reduce taxable income."
                  onChange={(v) => update('heslb_rate', v)}
                  accentColor="var(--violet)"
                />
              </div>
            )}

            <NumberField
              label="Fixed Deduction"
              value={options.custom_fixed_deduction}
              onChange={(v) => update('custom_fixed_deduction', v)}
              tooltip="e.g. loan repayments, union fees. Applied after NSSF and PAYE."
            />
            <SliderField
              label="Percentage Deduction"
              value={options.custom_percent_deduction}
              min={0} max={30} step={0.5} unit="%"
              tooltip="% of gross deducted after tax — savings, co-operative schemes."
              onChange={(v) => update('custom_percent_deduction', v)}
              accentColor="var(--rose)"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="sm:col-span-2">
          <p
            className="text-[10px] uppercase tracking-widest font-bold mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Taxable Benefits
          </p>
          <NumberField
            label="Monthly Non-Cash Benefits"
            value={options.benefits}
            onChange={(v) => update('benefits', v)}
            tooltip="Housing, vehicle, etc. Added to gross for PAYE computation (TRA emoluments rule)."
          />
        </div>
      </div>
    </motion.div>
  );
}
