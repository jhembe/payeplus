'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdvancedOptions } from '@/lib/types';
import { DEFAULT_ADVANCED } from '@/lib/types';

interface AdvancedModeProps {
  options: AdvancedOptions;
  onChange: (opts: AdvancedOptions) => void;
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  tooltip?: string;
  onChange: (v: number) => void;
  accentColor?: string;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit = '%',
  tooltip,
  onChange,
  accentColor = '#6366F1',
}: SliderFieldProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-400">{label}</label>
          {tooltip && (
            <div className="group relative">
              <Info size={11} className="text-slate-600 cursor-help" />
              <div className="absolute left-0 bottom-5 w-48 p-2 rounded-lg bg-obsidian-700 border border-white/[0.08] text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
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
              'w-20 text-right bg-transparent text-sm font-mono font-bold',
              'border-b border-dashed border-white/10 focus:border-white/20 outline-none',
              'text-slate-200 pb-0.5 transition-colors'
            )}
          />
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
      </div>

      <div className="relative">
        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}CC)`,
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
          aria-label={label}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-700 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  placeholder?: string;
  tooltip?: string;
}

function NumberField({ label, value, onChange, prefix = 'TZS', placeholder = '0', tooltip }: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-slate-400">{label}</label>
        {tooltip && (
          <div className="group relative">
            <Info size={11} className="text-slate-600 cursor-help" />
            <div className="absolute left-0 bottom-5 w-52 p-2 rounded-lg bg-obsidian-700 border border-white/[0.08] text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 bg-obsidian-800 border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-brand-500/40 transition-colors">
        <span className="text-xs font-bold text-slate-600 font-mono">{prefix}</span>
        <input
          type="number"
          value={value || ''}
          placeholder={placeholder}
          min={0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none text-right font-mono text-sm font-semibold text-slate-200 placeholder:text-slate-700"
        />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-9 h-5 rounded-full transition-colors duration-200',
            checked ? 'bg-brand-500' : 'bg-white/10'
          )}
        />
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-300 group-hover:text-slate-200 transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-slate-600 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

export function AdvancedMode({ options, onChange }: AdvancedModeProps) {
  const update = <K extends keyof AdvancedOptions>(key: K, value: AdvancedOptions[K]) => {
    onChange({ ...options, [key]: value });
  };

  const reset = () => onChange({ ...DEFAULT_ADVANCED });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-glass p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/15 text-brand-400">
            <SlidersHorizontal size={15} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Advanced Options</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Customise deductions &amp; benefits</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-medium"
        >
          Reset defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* NSSF Rate */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-4">
            Social Security
          </p>
          <SliderField
            label="NSSF Employee Rate"
            value={options.nssf_rate_override}
            min={0}
            max={20}
            step={0.5}
            unit="%"
            tooltip="Standard rate is 10%. Override for exempt employees or alternative calculations."
            onChange={(v) => update('nssf_rate_override', v)}
            accentColor="#F59E0B"
          />
          <div className="mt-4">
            <ToggleField
              label="Include benefits in NSSF base"
              checked={options.include_benefits_in_nssf}
              onChange={(v) => update('include_benefits_in_nssf', v)}
              description="When on, non-cash benefits are included in the NSSF calculation base."
            />
          </div>
        </div>

        {/* Custom Deductions */}
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-4">
            Additional Deductions
          </p>
          <ToggleField
              label="HESLB Student Loan Repayment"
              checked={options.heslb_enabled}
              onChange={(v) => update('heslb_enabled', v)}
              description="Higher Education Students' Loans Board (HESLB) repayments are deducted after tax."
            />
            
            {options.heslb_enabled && (
              <SliderField
                label="HESLB Repayment Rate"
                value={options.heslb_rate}
                min={5}
                max={25}
                step={0.5}
                unit="%"
                tooltip="Standard HESLB repayment is 15% of gross salary. This does not reduce taxable income."
                onChange={(v) => update('heslb_rate', v)}
                accentColor="#2563EB"
              />
            )}
          <div className="space-y-4">
            <NumberField
              label="Fixed Deduction (TZS)"
              value={options.custom_fixed_deduction}
              onChange={(v) => update('custom_fixed_deduction', v)}
              tooltip="e.g. loan repayments, HELB, union fees. Applied after NSSF and PAYE."
            />
            <SliderField
              label="Percentage Deduction"
              value={options.custom_percent_deduction}
              min={0}
              max={30}
              step={0.5}
              unit="%"
              tooltip="A % of gross salary deducted after tax. Useful for savings schemes or co-operative deductions."
              onChange={(v) => update('custom_percent_deduction', v)}
              accentColor="#EC4899"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="sm:col-span-2">
          <p className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-4">
            Taxable Benefits (Non-Cash)
          </p>
          <NumberField
            label="Monthly Benefits Value"
            value={options.benefits}
            onChange={(v) => update('benefits', v)}
            tooltip="Non-cash benefits (housing, vehicle, etc.) are added to gross for tax computation. TRA treats these as taxable emoluments."
          />
        </div>
      </div>
    </motion.div>
  );
}
