import type {
  SalaryBreakdown,
  TaxSchema,
  AdvancedOptions,
  Currency,
} from '@/lib/types';
import { formatPercent, calculateEmployerCost } from '@/lib/calculations';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-TZ').format(Math.round(n));
}

function pct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

function usd(n: number, rate: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n / rate);
}

// ─── Report Input ─────────────────────────────────────────────────────────────

export interface ReportInput {
  breakdown: SalaryBreakdown;
  schema: TaxSchema;
  advanced: AdvancedOptions;
  currency: Currency;
  includeEmployer: boolean;
  generatedAt?: Date;
}

// ─── HTML Report Builder ──────────────────────────────────────────────────────

export function generateReportHTML(input: ReportInput): string {
  const { breakdown, schema, advanced, currency, includeEmployer, generatedAt = new Date() } = input;

  const employer = includeEmployer ? calculateEmployerCost(breakdown.gross, schema) : null;

  const grossTotal = breakdown.gross + breakdown.benefits;
  const dateStr = generatedAt.toLocaleDateString('en-TZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = generatedAt.toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' });
  const barOf = (n: number) =>
    grossTotal > 0 ? `${Math.min(100, (n / grossTotal) * 100).toFixed(2)}%` : '0%';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PAYE+ Salary Report — ${dateStr}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
    rel="stylesheet"
  />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 10pt; }
    body {
      background: #ffffff;
      color: #0F172A;
      font-family: 'Outfit', sans-serif;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { max-width: 800px; margin: 0 auto; }

    @media print {
      html, body { margin: 0; padding: 0; background: white; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }

    /* Cover */
    .cover {
      background: linear-gradient(140deg, #0A0D1A 0%, #0F1628 40%, #111827 100%);
      color: white;
      padding: 44px 48px 40px;
      position: relative;
      overflow: hidden;
    }
    .cover::before {
      content: '';
      position: absolute; top: -80px; left: -80px;
      width: 380px; height: 380px; border-radius: 50%;
      background: radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%);
    }
    .cover::after {
      content: '';
      position: absolute; bottom: -60px; right: -60px;
      width: 280px; height: 280px; border-radius: 50%;
      background: radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%);
    }
    .cover-inner { position: relative; z-index: 1; }

    .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .logo-mark {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #6366F1 0%, #06B6D4 100%);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px;
      color: white; flex-shrink: 0; letter-spacing: -0.5px;
    }
    .logo-text {
      font-family: 'Syne', sans-serif; font-weight: 700; font-size: 24px;
      letter-spacing: -0.5px; color: white;
    }
    .logo-text .plus { color: #818CF8; }
    .logo-sub { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.05em; display: block; }

    .cover-title {
      font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
      letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 8px;
      background: linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .cover-subtitle {
      font-size: 12px; color: rgba(255,255,255,0.45);
      letter-spacing: 0.04em; text-transform: uppercase;
    }
    .cover-meta {
      display: flex; gap: 24px; margin-top: 28px; padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap;
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label {
      font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
      color: rgba(255,255,255,0.35); font-weight: 600;
    }
    .meta-value {
      font-family: 'DM Mono', monospace; font-size: 12px;
      color: rgba(255,255,255,0.8); font-weight: 500;
    }
    .schema-badge {
      margin-left: auto; align-self: flex-end;
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 99px;
      background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
      font-size: 10px; color: #34D399; font-weight: 600; white-space: nowrap;
    }
    .schema-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #34D399; }

    /* Content */
    .content { padding: 36px 48px; }

    .section { margin-bottom: 32px; }
    .section-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
      padding-bottom: 10px; border-bottom: 1px solid #E8EDF6;
    }
    .section-icon {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; font-size: 13px;
    }
    .section-title {
      font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
      color: #0F172A; letter-spacing: -0.2px;
    }
    .section-tag {
      margin-left: auto; font-size: 9px; text-transform: uppercase;
      letter-spacing: 0.1em; font-weight: 600; color: #94A3B8;
    }

    /* Metric cards */
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .metric-card {
      border-radius: 12px; padding: 16px 18px;
      position: relative; overflow: hidden;
    }
    .metric-card.primary {
      background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
      border: 1.5px solid #BBF7D0; grid-column: span 2;
    }
    .metric-card.deduction { background: #FAFBFF; border: 1px solid #E8EDF6; }
    .metric-label {
      font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
      font-weight: 700; margin-bottom: 6px;
    }
    .metric-card.primary .metric-label { color: #059669; }
    .metric-card.deduction .metric-label { color: #94A3B8; }
    .metric-value { font-family: 'DM Mono', monospace; font-weight: 700; }
    .metric-card.primary .metric-value { font-size: 28px; color: #059669; line-height: 1.1; }
    .metric-card.deduction .metric-value { font-size: 18px; color: #1E293B; }
    .metric-sub { font-size: 10px; color: #94A3B8; margin-top: 4px; font-family: 'DM Mono', monospace; }

    /* Waterfall */
    .waterfall-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .waterfall-name {
      font-size: 10px; font-weight: 600; color: #475569;
      width: 110px; flex-shrink: 0; text-align: right; padding-right: 4px;
    }
    .waterfall-track {
      flex: 1; height: 24px; background: #F1F5F9; border-radius: 5px;
      overflow: hidden; position: relative;
    }
    .waterfall-bar {
      height: 100%; border-radius: 5px;
      display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;
    }
    .waterfall-bar-label {
      font-family: 'DM Mono', monospace; font-size: 9px;
      font-weight: 700; color: rgba(255,255,255,0.9); white-space: nowrap;
    }
    .waterfall-amount {
      font-family: 'DM Mono', monospace; font-size: 10px;
      font-weight: 600; width: 100px; text-align: right; flex-shrink: 0;
    }

    /* Tables */
    table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 11px; }
    thead th {
      background: #F8FAFF; padding: 8px 14px; text-align: left;
      font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
      font-weight: 700; color: #94A3B8; border-bottom: 1px solid #E8EDF6;
    }
    thead th:last-child { text-align: right; }
    tbody td { padding: 10px 14px; border-bottom: 1px solid #F1F5F9; color: #334155; }
    tbody td:last-child { text-align: right; font-family: 'DM Mono', monospace; font-weight: 600; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #F8FAFF; }
    .row-total td {
      font-weight: 700; color: #0F172A; background: #F0F9FF;
      border-top: 1px solid #BAE6FD; border-bottom: 1px solid #BAE6FD;
    }
    .row-positive td:last-child { color: #059669; }
    .row-negative td:last-child { color: #DC2626; }
    .row-neutral td:last-child { color: #2563EB; }
    .bracket-active { background: linear-gradient(90deg, #EFF6FF 0%, transparent 100%) !important; }
    .bracket-active td { color: #1D4ED8 !important; font-weight: 600; }
    .bracket-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 1px 8px; border-radius: 99px; font-size: 9px; font-weight: 700;
      background: #DBEAFE; color: #2563EB;
    }

    /* Stats strip */
    .stats-strip {
      display: flex; gap: 0; border: 1px solid #E8EDF6;
      border-radius: 12px; overflow: hidden;
    }
    .stat-item { flex: 1; padding: 14px 16px; border-right: 1px solid #E8EDF6; }
    .stat-item:last-child { border-right: none; }
    .stat-label {
      font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
      font-weight: 700; color: #94A3B8; margin-bottom: 4px;
    }
    .stat-value { font-family: 'DM Mono', monospace; font-weight: 700; font-size: 15px; color: #0F172A; }
    .stat-sub { font-size: 9px; color: #CBD5E1; margin-top: 1px; font-family: 'DM Mono', monospace; }

    /* Employer */
    .employer-banner {
      background: linear-gradient(135deg, #EFF6FF 0%, #F0FDFB 100%);
      border: 1.5px solid #BFDBFE; border-radius: 12px;
      padding: 18px 22px; margin-bottom: 16px;
    }
    .employer-total { font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 700; color: #1D4ED8; margin-bottom: 4px; }
    .employer-label { font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
    .multiplier-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 99px; background: #DBEAFE;
      color: #1D4ED8; font-family: 'DM Mono', monospace;
      font-size: 11px; font-weight: 700; margin-top: 6px;
    }

    /* Highlight box */
    .highlight-box {
      background: linear-gradient(135deg, #F8FAFF 0%, #F0F7FF 100%);
      border-left: 3px solid #6366F1; border-radius: 0 8px 8px 0;
      padding: 12px 16px; margin-bottom: 16px;
    }
    .highlight-box p { font-size: 10px; color: #475569; line-height: 1.6; }
    .highlight-box strong { color: #312E81; }

    /* Footer */
    .footer {
      margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8EDF6;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .footer-brand { display: flex; align-items: center; gap: 8px; }
    .footer-logo {
      width: 24px; height: 24px; border-radius: 6px;
      background: linear-gradient(135deg, #6366F1 0%, #06B6D4 100%);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-weight: 800; font-size: 9px; color: white;
      letter-spacing: -0.3px;
    }
    .footer-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #475569; }
    .footer-disclaimer { font-size: 8.5px; color: #CBD5E1; line-height: 1.5; max-width: 380px; text-align: right; }
  </style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-inner">
      <div class="logo-row">
        <div class="logo-mark">P+</div>
        <div>
          <span class="logo-text">PAYE<span class="plus">+</span></span>
          <span class="logo-sub">Tanzania Tax Intelligence</span>
        </div>
      </div>
      <div class="cover-title">Salary &amp; Tax<br/>Analysis Report</div>
      <div class="cover-subtitle">Tanzania Revenue Authority · PAYE &amp; NSSF Computation</div>
      <div class="cover-meta">
        <div class="meta-item">
          <span class="meta-label">Generated</span>
          <span class="meta-value">${dateStr} · ${timeStr}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Tax Year</span>
          <span class="meta-value">${schema.year}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Gross Salary</span>
          <span class="meta-value">TZS ${fmt(grossTotal)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Net Pay</span>
          <span class="meta-value">TZS ${fmt(breakdown.net)}</span>
        </div>
        <div class="schema-badge">
          <div class="dot"></div>
          Schema v${schema.version} · ${schema.last_updated}
        </div>
      </div>
    </div>
  </div>

  <!-- BODY -->
  <div class="content">

    <!-- 1. KEY METRICS -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#F0FDF4;">💰</div>
        <span class="section-title">Key Salary Metrics</span>
        <span class="section-tag">Monthly · TZS</span>
      </div>
      <div class="metrics-grid">
        <div class="metric-card primary">
          <div class="metric-label">Net Take-Home Pay</div>
          <div class="metric-value">TZS ${fmt(breakdown.net)}</div>
          ${currency === 'USD'
            ? `<div class="metric-sub">≈ ${usd(breakdown.net, schema.usd_rate)} (@ ${fmt(schema.usd_rate)} TZS/USD)</div>`
            : `<div class="metric-sub">After NSSF, PAYE${breakdown.custom_fixed + breakdown.custom_percent_amount > 0 ? ' &amp; custom deductions' : ''}</div>`}
        </div>
        <div class="metric-card deduction">
          <div class="metric-label" style="color:#B45309;">NSSF Contribution</div>
          <div class="metric-value" style="color:#D97706;">TZS ${fmt(breakdown.nssf)}</div>
          <div class="metric-sub">${pct((breakdown.nssf / (grossTotal || 1)) * 100)} of gross</div>
        </div>
        <div class="metric-card deduction">
          <div class="metric-label" style="color:#B91C1C;">PAYE Tax</div>
          <div class="metric-value" style="color:#DC2626;">TZS ${fmt(breakdown.paye)}</div>
          <div class="metric-sub">Marginal rate: ${pct(breakdown.marginal_rate, 0)}</div>
        </div>
      </div>
      <div class="stats-strip">
        <div class="stat-item">
          <div class="stat-label">Gross Salary</div>
          <div class="stat-value">TZS ${fmt(grossTotal)}</div>
          <div class="stat-sub">Before deductions</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Taxable Income</div>
          <div class="stat-value">TZS ${fmt(breakdown.taxable_income)}</div>
          <div class="stat-sub">After NSSF</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Effective Rate</div>
          <div class="stat-value">${pct(breakdown.effective_rate)}</div>
          <div class="stat-sub">Total burden</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Marginal Rate</div>
          <div class="stat-value">${pct(breakdown.marginal_rate, 0)}</div>
          <div class="stat-sub">PAYE band</div>
        </div>
      </div>
    </div>

    <!-- 2. WATERFALL -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#EFF6FF;">📊</div>
        <span class="section-title">Salary Waterfall</span>
        <span class="section-tag">Gross → Deductions → Net</span>
      </div>
      <div class="waterfall">
        ${[
          { name: breakdown.benefits > 0 ? 'Base Gross' : 'Gross Salary', value: breakdown.gross, color: '#6366F1' },
          ...(breakdown.benefits > 0
            ? [{ name: 'Benefits', value: breakdown.benefits, color: '#A78BFA' }]
            : []),
          { name: 'NSSF (−)', value: breakdown.nssf, color: '#F59E0B' },
          { name: 'PAYE Tax (−)', value: breakdown.paye, color: '#EF4444' },
          ...(breakdown.heslb > 0
            ? [{ name: 'HESLB (−)', value: breakdown.heslb, color: '#2563EB' }]
            : []),
          ...(breakdown.custom_fixed + breakdown.custom_percent_amount > 0
            ? [{ name: 'Custom Ded. (−)', value: breakdown.custom_fixed + breakdown.custom_percent_amount, color: '#EC4899' }]
            : []),
          { name: 'Net Pay', value: breakdown.net, color: '#10B981' },
        ].map((row) => `
        <div class="waterfall-row">
          <div class="waterfall-name">${row.name}</div>
          <div class="waterfall-track">
            <div class="waterfall-bar" style="width:${barOf(row.value)};background:${row.color};">
              ${row.value > grossTotal * 0.08 ? `<span class="waterfall-bar-label">TZS ${fmt(row.value)}</span>` : ''}
            </div>
          </div>
          <div class="waterfall-amount" style="color:${row.color};">TZS ${fmt(row.value)}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- 3. DEDUCTION DETAIL -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#FFF7ED;">📋</div>
        <span class="section-title">Full Deduction Detail</span>
        <span class="section-tag">Line-by-line</span>
      </div>
      <table>
        <thead>
          <tr><th>Description</th><th>Basis</th><th>Rate / Amount</th><th>Monthly (TZS)</th></tr>
        </thead>
        <tbody>
          <tr class="row-positive">
            <td><strong>Gross Salary</strong></td><td>Employment income</td><td>—</td><td>${fmt(breakdown.gross)}</td>
          </tr>
          ${breakdown.benefits > 0 ? `
          <tr class="row-positive">
            <td>Non-Cash Benefits</td><td>Taxable emoluments (TRA)</td><td>Per assessment</td><td>${fmt(breakdown.benefits)}</td>
          </tr>
          <tr><td><strong>Total Emoluments</strong></td><td>Gross + Benefits</td><td>—</td><td><strong>${fmt(grossTotal)}</strong></td></tr>` : ''}
          <tr class="row-negative">
            <td>NSSF (Employee)</td>
            <td>${advanced.include_benefits_in_nssf ? 'Total emoluments' : 'Base gross only'}</td>
            <td>${pct(advanced.nssf_rate_override)}</td>
            <td>(${fmt(breakdown.nssf)})</td>
          </tr>
          <tr>
            <td><strong>Taxable Income</strong></td><td>Emoluments − NSSF</td><td>—</td><td><strong>${fmt(breakdown.taxable_income)}</strong></td>
          </tr>
          <tr class="row-negative">
            <td>PAYE Tax</td>
            <td>On taxable income</td>
            <td>Progressive (${pct(breakdown.marginal_rate, 0)} marginal)</td>
            <td>(${fmt(breakdown.paye)})</td>
          </tr>
          ${breakdown.heslb > 0 ? `
          <tr class="row-negative">
            <td>HESLB Student Loan</td>
            <td>Post-tax deduction</td>
            <td>${pct(advanced.heslb_rate, 0)} of gross</td>
            <td>(${fmt(breakdown.heslb)})</td>
          </tr>` : ''}
          ${breakdown.custom_fixed > 0 ? `<tr class="row-negative"><td>Fixed Deduction</td><td>Other (loan / fee)</td><td>Fixed amount</td><td>(${fmt(breakdown.custom_fixed)})</td></tr>` : ''}
          ${breakdown.custom_percent_amount > 0 ? `<tr class="row-negative"><td>Percentage Deduction</td><td>${pct(advanced.custom_percent_deduction)} of gross</td><td>${pct(advanced.custom_percent_deduction)}</td><td>(${fmt(breakdown.custom_percent_amount)})</td></tr>` : ''}
          <tr class="row-total">
            <td><strong>Total Deductions</strong></td>
            <td>NSSF + PAYE + HESLB + Other</td>
            <td>${pct(breakdown.effective_rate)} effective</td>
            <td><strong>(${fmt(breakdown.total_deductions)})</strong></td>
          </tr>
          <tr class="row-positive">
            <td><strong style="color:#059669;">NET TAKE-HOME</strong></td>
            <td>After all deductions</td>
            <td>${pct(100 - breakdown.effective_rate)} retained</td>
            <td><strong style="color:#059669;">${fmt(breakdown.net)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. PAYE BRACKET ANALYSIS -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon" style="background:#EFF6FF;">⚖️</div>
        <span class="section-title">PAYE Bracket Analysis</span>
        <span class="section-tag">TRA Progressive Rates · ${schema.year}</span>
      </div>
      <div class="highlight-box">
        <p>
          Tanzania applies a <strong>cumulative progressive PAYE system</strong>. Each bracket taxes only the
          portion of taxable income falling within that band. Your taxable income of
          <strong>TZS ${fmt(breakdown.taxable_income)}</strong> falls in the
          <strong>${pct(breakdown.marginal_rate, 0)} marginal band</strong>, yielding an
          effective rate of <strong>${pct(breakdown.effective_rate)}</strong>.
        </p>
      </div>
      <table>
        <thead>
          <tr><th>Band</th><th>Income Range (TZS)</th><th>Rate</th><th>Base Tax</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${schema.paye_brackets.map((b) => {
            const isActive = breakdown.taxable_income > b.min &&
              (b.max === null || breakdown.taxable_income <= b.max);
            return `
          <tr class="${isActive ? 'bracket-active' : ''}">
            <td>${b.label}</td>
            <td style="font-family:'DM Mono',monospace;font-size:10px;">${fmt(b.min)} – ${b.max !== null ? fmt(b.max) : '∞'}</td>
            <td style="font-family:'DM Mono',monospace;">${pct(b.rate * 100, 0)}</td>
            <td style="font-family:'DM Mono',monospace;">${b.base > 0 ? fmt(b.base) : 'Nil'}</td>
            <td>${isActive ? '<span class="bracket-badge">● Active</span>' : '—'}</td>
          </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    ${employer ? `
    <!-- 5. EMPLOYER COST -->
    <div class="section page-break">
      <div class="section-header">
        <div class="section-icon" style="background:#EFF6FF;">🏢</div>
        <span class="section-title">Employer Cost View</span>
        <span class="section-tag">Total employment burden</span>
      </div>
      <div class="employer-banner">
        <div class="employer-label">Total Monthly Employer Cost</div>
        <div class="employer-total">TZS ${fmt(employer.total_employer_cost)}</div>
        <div class="multiplier-badge">↑ ${employer.cost_multiplier.toFixed(4)}× gross salary</div>
      </div>
      <table>
        <thead><tr><th>Component</th><th>Rate</th><th>Basis</th><th>Monthly (TZS)</th></tr></thead>
        <tbody>
          <tr class="row-neutral"><td><strong>Gross Salary</strong></td><td>—</td><td>Agreed remuneration</td><td>${fmt(employer.gross)}</td></tr>
          <tr class="row-negative"><td>Employer NSSF</td><td>${pct(schema.nssf_employer_rate * 100, 0)}</td><td>Of gross</td><td>${fmt(employer.employer_nssf)}</td></tr>
          <tr class="row-negative"><td>Skills Dev. Levy (SDL)</td><td>${pct(schema.sdl_rate * 100, 1)}</td><td>Of gross payroll</td><td>${fmt(employer.sdl)}</td></tr>
          <tr class="row-negative"><td>Workers' Comp. Fund (WCF)</td><td>${pct(schema.wcf_rate * 100, 1)}</td><td>Of gross payroll</td><td>${fmt(employer.wcf)}</td></tr>
          <tr class="row-total">
            <td><strong>TOTAL EMPLOYER COST</strong></td>
            <td>${pct((employer.total_employer_cost / employer.gross - 1) * 100, 2)} above gross</td>
            <td>Full burden</td>
            <td><strong>${fmt(employer.total_employer_cost)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>` : ''}

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-brand">
        <div class="footer-logo">P+</div>
        <span class="footer-name">PAYE+ Intelligence</span>
      </div>
      <div class="footer-disclaimer">
        This report is generated for informational purposes only. Tax computations follow
        TRA regulations effective ${schema.year}. Verify with a qualified tax professional.
        Schema v${schema.version} · Generated ${dateStr} via paye.mahembega.com
      </div>
    </div>

  </div>
</div>
</body>
</html>`;
}

// ─── Download triggers ─────────────────────────────────────────────────────────

/**
 * Opens the report in a new tab and triggers the browser print dialog.
 * Safari-safe: uses onload event with a longer delay to ensure fonts load.
 */
export function downloadReport(input: ReportInput): void {
  const html = generateReportHTML(input);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (win) {
    // Use both load and a generous timeout — Safari needs ~1200ms for fonts
    const triggerPrint = () => {
      setTimeout(() => {
        try { win.print(); } catch { /* Safari may block — user can Cmd+P */ }
      }, 1200);
    };
    win.addEventListener('load', triggerPrint, { once: true });
    // Fallback: if load never fires (some browsers), trigger after 2s
    setTimeout(triggerPrint, 2000);
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Downloads the report as a standalone HTML file. */
export function downloadHTMLFile(input: ReportInput): void {
  const html = generateReportHTML(input);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `payeplus-salary-report-${dateStr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}


export async function downloadPDF(input: ReportInput): Promise<void> {
  const res = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error('PDF generation failed');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'payeplus-salary-report.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
