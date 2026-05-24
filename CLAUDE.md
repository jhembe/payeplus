# PAYE+ — Tanzania Tax Intelligence

A fintech-grade salary calculator **Progressive Web App** for Tanzania. Computes PAYE, NSSF, net pay, employer costs, and supports scenario comparisons powered by a live TRA tax schema. Fully offline-capable.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, `output: 'standalone'`) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Animation | Framer Motion 11 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| PDF export | Puppeteer (server-side via `/api/export/pdf`) |
| Deploy | Docker + Caddy reverse proxy |

## Project Structure

```
app/
├── api/
│   ├── export/pdf/route.ts   # Puppeteer PDF generation
│   └── schema/route.ts       # Tax schema proxy + cache
├── globals.css               # Design tokens, global classes, animations
├── layout.tsx                # Root layout — PWA meta, FOCT prevention, SW registration
└── page.tsx                  # App shell — tab routing, state orchestration

components/
├── Header.tsx                # Slim 48px topbar: logo · schema status · controls
├── TabNavigation.tsx         # Desktop pill bar + mobile bottom nav
├── SalaryInput.tsx           # Formatted TZS/USD input with cursor preservation
├── SalaryBreakdown.tsx       # Metric cards — net pay, PAYE, NSSF, deductions
├── WaterfallChart.tsx        # Gross → deductions → net waterfall (Recharts)
├── DeductionPieChart.tsx     # Salary distribution donut chart
├── AdvancedMode.tsx          # NSSF override, HESLB, custom deductions, benefits
├── ReverseCalculator.tsx     # Binary-search net→gross solver (TZS 1 tolerance)
├── ScenarioComparison.tsx    # Side-by-side salary comparison table (max 8)
├── EmployerCostView.tsx      # Total employer burden: NSSF + SDL + WCF
├── ExportButton.tsx          # PDF / HTML report export modal
├── AnimatedNumber.tsx        # Smooth rollup animation for financial figures
└── GradientBackground.tsx   # Fixed ambient orb background (GPU-safe)

hooks/
├── useSchema.ts              # Fetches/caches schema — remote → cache → fallback
└── useTheme.ts               # Dark/light theme with localStorage + FOCT prevention

lib/
├── calculations.ts           # Core tax math: PAYE, NSSF, employer costs, reverse
├── types.ts                  # TypeScript interfaces and DEFAULT_ADVANCED constant
├── schema.ts                 # Schema fetch, validation, versioning
├── reportGenerator.ts        # HTML report template + PDF download trigger
└── utils.ts                  # cn() classname utility

public/
├── tax_schema.json           # Offline fallback — TRA 2025 rates
├── manifest.json             # PWA app manifest
├── sw.js                     # Service worker — cache-first static, network-first API
└── icon.svg                  # App icon (SVG, used by manifest)
```

## Tax Calculation Logic (TRA 2025)

**PAYE Brackets (monthly)**

| Band | Min TZS | Max TZS | Rate | Cumulative Base |
|------|---------|---------|------|-----------------|
| Nil | 0 | 270,000 | 0% | 0 |
| 8% | 270,001 | 520,000 | 8% | 0 |
| 20% | 520,001 | 760,000 | 20% | 20,000 |
| 25% | 760,001 | 1,000,000 | 25% | 68,000 |
| 30% | 1,000,001+ | — | 30% | 128,000 |

**Statutory Contributions**
- **NSSF**: Employee 10% + Employer 10% of gross
- **SDL**: 4.5% of gross (employers with 4+ staff, payroll ≥ TZS 200k/mo)
- **WCF**: 0.5% of gross (mandatory insurance levy)
- **HESLB**: 15% of gross — optional, post-tax student loan deduction

**Deduction Order**
1. `gross` = salary + taxable benefits (if `include_benefits_in_nssf`)
2. `nssf` = gross × nssf_rate (default 10%, overridable)
3. `taxable_income` = gross − nssf
4. `paye` = bracket formula on taxable_income
5. `heslb` = gross × heslb_rate (if `heslb_enabled`)
6. `custom_fixed` = custom_fixed_deduction (from AdvancedOptions)
7. `custom_percent_amount` = gross × custom_percent_deduction / 100
8. `net` = gross − nssf − paye − heslb − custom_fixed − custom_percent_amount

## Development

```bash
npm run dev          # Dev server on :3000
npm run build        # Production build → .next/standalone
npm run start        # Production server on :3000
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
```

## Docker

```bash
docker compose up -d        # Build + run
docker compose logs -f app  # Stream app logs
```

Caddy config: `caddy-payeplus.conf` (HTTPS termination + reverse proxy).

## PWA

PAYE+ is a full Progressive Web App — installable, offline-capable:

- **`public/manifest.json`** — display: standalone, theme-color, icons
- **`public/sw.js`** — cache-first for static assets; network-first for API routes; offline fallback to cached schema
- **Registration** — inline `<script>` in `app/layout.tsx` registers the SW after hydration
- **Offline** — `useSchema` hook falls back to bundled `tax_schema.json` when network is unavailable

## Design System

All surfaces and colours are CSS custom properties in `globals.css`:

```css
/* Dark (default) */
--bg-base:      #080B14   /* page background */
--bg-surface:   #0E1019   /* card surface */
--bg-elevated:  #13172A   /* input / nested background */
--text-primary: #F1F5F9
--text-secondary:#94A3B8
--text-tertiary: #475569
--text-muted:   #334155
--brand-indigo: #6366F1   /* primary accent */
--brand-cyan:   #06B6D4   /* secondary accent */
```

Light mode overrides live in `.light {}` and are applied by a blocking inline script in `layout.tsx` to prevent flash of wrong theme (FOCT).

**Fonts**: Syne (display/headings) · Outfit (body) · DM Mono (numbers/labels)
**Card style**: `.card-glass` — frosted glass with `backdrop-filter: blur(12px)`
**Mobile nav**: Bottom navigation bar on < 640px; horizontal pill tabs on desktop

## Known Gaps / Roadmap

- [ ] URL-encoded share links (salary params in query string)
- [ ] Local calculation history (last 10, localStorage)
- [ ] Annual tax summary view
- [ ] PPF (Parastatal Pension Fund) calculation option
- [ ] KES / UGX multi-currency support
- [ ] Push notifications for TRA schema version updates
- [ ] Full accessibility audit (WCAG 2.1 AA)
