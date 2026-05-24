'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, X, Check, Building2, Share2, Link, Printer } from 'lucide-react';
import { downloadPDF, downloadHTMLFile } from '@/lib/reportGenerator';
import type { SalaryBreakdown, TaxSchema, AdvancedOptions, Currency } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  breakdown: SalaryBreakdown;
  schema: TaxSchema;
  advanced: AdvancedOptions;
  currency: Currency;
  disabled?: boolean;
  compact?: boolean;
}

export function ExportButton({
  breakdown,
  schema,
  advanced,
  currency,
  disabled = false,
  compact = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [includeEmployer, setIncludeEmployer] = useState(true);
  const [exported, setExported] = useState<'pdf' | 'html' | null>(null);
  const [copied, setCopied] = useState(false);

  const input = { breakdown, schema, advanced, currency, includeEmployer };

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleExport = async (type: 'pdf' | 'html') => {
    if (isExporting) return;
    setIsExporting(true);
    await new Promise(requestAnimationFrame);
    try {
      if (type === 'pdf') {
        await downloadPDF(input);
      } else {
        downloadHTMLFile(input);
      }
      setExported(type);
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setExported(null);
        setOpen(false);
      }, 1800);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select text */
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        disabled={disabled || breakdown.gross === 0}
        className={cn(
          'flex items-center gap-1.5 rounded-lg',
          'font-semibold transition-all duration-150',
          'border disabled:opacity-40 disabled:cursor-not-allowed',
          compact ? 'text-[11px] px-2.5 h-7' : 'text-sm px-4 py-2.5',
        )}
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
        }}
        onMouseOver={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.color = 'var(--gold)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <Download size={compact ? 11 : 13} />
        {compact ? 'Export' : 'Export Report'}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div
                className="w-full max-w-[400px] pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-popover)',
                }}
              >
                {/* Header */}
                <div
                  className="px-5 pt-5 pb-4"
                  style={{ borderBottom: '1px solid var(--border-hair)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ background: 'var(--gold-ghost)', color: 'var(--gold)' }}
                      >
                        <FileText size={13} />
                      </div>
                      <div>
                        <h3
                          className="text-[13px] font-semibold"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
                        >
                          Export &amp; Share
                        </h3>
                        <p
                          className="text-[11px] mt-0.5"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                        >
                          Download PDF, HTML or share a link
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4 space-y-3">
                  {/* Report includes */}
                  <div
                    className="rounded-xl p-3.5 space-y-2"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                    >
                      Report includes
                    </p>
                    {[
                      'Net pay, PAYE, NSSF breakdown',
                      'Salary waterfall chart',
                      'PAYE bracket analysis',
                      'Full deduction line items',
                      ...(includeEmployer ? ['Employer cost section'] : []),
                    ].map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <Check size={9} style={{ color: 'var(--sage)', flexShrink: 0 }} />
                        <span
                          className="text-[12px]"
                          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                        >
                          {line}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Employer toggle */}
                  <label
                    className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl transition-colors"
                    style={{
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={12} style={{ color: 'var(--text-muted)' }} />
                      <span
                        className="text-[12px] font-medium"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                      >
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
                      <div className={cn('toggle-track', includeEmployer && 'checked')} />
                      <div className={cn('toggle-thumb', includeEmployer && 'checked')} />
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 space-y-2">
                  {/* PDF button */}
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className={cn(
                      'w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl',
                      'font-semibold text-[13px] transition-all duration-150',
                      isExporting ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.99]',
                    )}
                    style={{
                      background: exported === 'pdf' ? 'var(--sage)' : 'var(--gold)',
                      color: '#0C0C0D',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {isExporting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Preparing PDF…
                      </>
                    ) : exported === 'pdf' ? (
                      <><Check size={15} /> Downloaded!</>
                    ) : (
                      <><FileText size={13} /> Download PDF Report</>
                    )}
                  </button>

                  {/* HTML button */}
                  <button
                    onClick={() => handleExport('html')}
                    disabled={isExporting}
                    className={cn(
                      'w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl',
                      'font-semibold text-[13px] transition-all duration-150',
                      'border disabled:opacity-40',
                    )}
                    style={{
                      background: 'transparent',
                      borderColor: exported === 'html' ? 'var(--sage)' : 'var(--border-default)',
                      color: exported === 'html' ? 'var(--sage)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {exported === 'html' ? (
                      <><Check size={13} /> Downloaded!</>
                    ) : (
                      <><Printer size={13} /> Download as HTML</>
                    )}
                  </button>

                  {/* Divider */}
                  <div
                    className="flex items-center gap-3 py-1"
                    style={{ color: 'var(--text-ghost)', fontSize: '10px', fontFamily: 'var(--font-body)' }}
                  >
                    <div className="flex-1 h-px" style={{ background: 'var(--border-hair)' }} />
                    or
                    <div className="flex-1 h-px" style={{ background: 'var(--border-hair)' }} />
                  </div>

                  {/* Share link button */}
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      'w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl',
                      'font-semibold text-[13px] transition-all duration-150',
                      'border',
                    )}
                    style={{
                      background: copied ? 'var(--sage-ghost)' : 'var(--bg-elevated)',
                      borderColor: copied ? 'var(--sage)' : 'var(--border-subtle)',
                      color: copied ? 'var(--sage)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {copied ? (
                      <><Check size={13} /> Link copied!</>
                    ) : (
                      <><Link size={13} /> Copy share link</>
                    )}
                  </button>

                  <p
                    className="text-center text-[10px]"
                    style={{ color: 'var(--text-ghost)', fontFamily: 'var(--font-body)' }}
                  >
                    Generated client-side · nothing uploaded
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
