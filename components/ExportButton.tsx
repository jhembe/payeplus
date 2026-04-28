'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, FileText, Printer, X, Check,
  Building2, ChevronDown,
} from 'lucide-react';
import { downloadReport, downloadHTMLFile } from '@/lib/reportGenerator';
import type {
  SalaryBreakdown, TaxSchema, AdvancedOptions, Currency,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  breakdown: SalaryBreakdown;
  schema: TaxSchema;
  advanced: AdvancedOptions;
  currency: Currency;
  disabled?: boolean;
}

export function ExportButton({
  breakdown,
  schema,
  advanced,
  currency,
  disabled = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [includeEmployer, setIncludeEmployer] = useState(true);
  const [exported, setExported] = useState<'pdf' | 'html' | null>(null);

  const input = { breakdown, schema, advanced, currency, includeEmployer };

  const handleExport = (type: 'pdf' | 'html') => {
    if (type === 'pdf') {
      downloadReport(input);
    } else {
      downloadHTMLFile(input);
    }
    setExported(type);
    setTimeout(() => {
      setExported(null);
      setOpen(false);
    }, 1800);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        disabled={disabled || breakdown.gross === 0}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl',
          'font-semibold text-sm transition-all duration-200',
          'border border-white/[0.08] hover:border-brand-500/40',
          'bg-white/[0.03] hover:bg-brand-500/10',
          'text-slate-400 hover:text-brand-300',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'group'
        )}
      >
        <Download
          size={15}
          className="group-hover:translate-y-0.5 transition-transform duration-200"
        />
        <span>Export Report</span>
        <ChevronDown size={12} className="opacity-50" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'w-[90vw] max-w-[420px]',
                'card-glass border border-white/[0.1] rounded-2xl overflow-hidden',
                'shadow-[0_24px_80px_rgba(0,0,0,0.7)]'
              )}
            >
              {/* Modal header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Export Salary Report</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Fintech-grade PDF · Printable
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="px-6 py-5 space-y-4">
                {/* Report preview info */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                    Report includes
                  </p>
                  {[
                    'Key salary metrics & net pay hero card',
                    'Horizontal salary waterfall chart',
                    'Full line-by-line deduction table',
                    'PAYE bracket analysis with active band',
                    ...(includeEmployer ? ['Employer cost view (NSSF + SDL + WCF)'] : []),
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check size={11} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Employer cost toggle */}
                <label className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-colors group">
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-300">
                      Include employer cost section
                    </span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={includeEmployer}
                      onChange={(e) => setIncludeEmployer(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      'w-8 h-4.5 rounded-full transition-colors duration-200',
                      includeEmployer ? 'bg-brand-500' : 'bg-white/10'
                    )} style={{ height: '18px' }} />
                    <div className={cn(
                      'absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white shadow',
                      'transition-transform duration-200',
                      includeEmployer ? 'translate-x-[18px] left-[2px]' : 'left-[2px]'
                    )} />
                  </div>
                </label>
              </div>

              {/* Export buttons */}
              <div className="px-6 pb-6 space-y-2.5">
                {/* Print to PDF */}
                <button
                  onClick={() => handleExport('pdf')}
                  className={cn(
                    'w-full flex items-center justify-center gap-2.5 py-3 rounded-xl',
                    'font-semibold text-sm transition-all duration-200',
                    exported === 'pdf'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-brand-500 to-electric-500 text-white hover:opacity-90 active:scale-[0.98]',
                    'shadow-brand-sm'
                  )}
                >
                  {exported === 'pdf' ? (
                    <>
                      <Check size={16} />
                      Opened for print!
                    </>
                  ) : (
                    <>
                      <Printer size={16} />
                      Open &amp; Print as PDF
                    </>
                  )}
                </button>

                {/* Download HTML */}
                <button
                  onClick={() => handleExport('html')}
                  className={cn(
                    'w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl',
                    'font-semibold text-sm transition-all duration-200',
                    'border border-white/[0.09] bg-white/[0.03] hover:bg-white/[0.06]',
                    exported === 'html'
                      ? 'text-emerald-400 border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {exported === 'html' ? (
                    <>
                      <Check size={15} />
                      Downloading…
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      Download as HTML
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-600">
                  PDF: opens in new tab → Save as PDF via browser print dialog
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
