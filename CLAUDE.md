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
└── page.tsx                  # App shell — desktop sidebar layout, tab routing, state orchestration

components/
├── Header.tsx                # Full-width sticky topbar: logo · schema status · controls
├── TabNavigation.tsx         # Exports: TabNavigation (sm–lg horizontal bar), SidebarTabNav (lg+ vertical),
│                             #          MobileTabNav (fixed bottom, sm:hidden), TABS array
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

## Layout Architecture

### Responsive breakpoints
- **< 640px (mobile)**: full-width content + fixed bottom nav (`MobileTabNav`)
- **640px–1023px (sm/md)**: horizontal tab bar at top, no sidebar
- **≥ 1024px (lg/desktop)**: sticky 208px left sidebar (`SidebarTabNav`) + wider content area

### Page structure (`page.tsx`)
```
<div>                          ← full viewport, bg-base
  <GradientBackground />       ← fixed, z-0
  <Header />                   ← full-width sticky, z-20, max-w-6xl inner container
  <div relative z-10>
    <div max-w-6xl mx-auto lg:flex>
      <aside hidden lg:flex>   ← sticky sidebar, top-[52px], h-[calc(100dvh-52px)]
        <SidebarTabNav />
      </aside>
      <main flex-1 min-w-0>
        <TabNavigation />      ← lg:hidden horizontal bar
        <AnimatePresence>      ← tab content (NO motion.div wrapping MobileTabNav)
          {tab panels}
        </AnimatePresence>
      </main>
    </div>
  </div>
  <MobileTabNav />             ← sm:hidden, fixed bottom, z-30 — MUST stay here at root
</div>
```

**Critical:** `MobileTabNav` must be rendered at the root level, outside any `motion.div` with `y` transforms. Framer Motion keeps `transform: translateY(0px)` on animated elements after completion, which creates a new CSS containing block and breaks `position: fixed` on descendants.

## Design System

All surfaces and colours are CSS custom properties in `globals.css`:

```css
/* Dark (default) */
--bg-base:      #0C0C0D   /* page background */
--bg-surface:   #111113   /* card surface */
--bg-elevated:  #1A1A1D   /* input / nested background */
--text-primary:   #F4F4F5
--text-secondary: #C4C4CC  /* high contrast — not dimmed */
--text-tertiary:  #8E8E96
--text-muted:     #6C6C74
--text-ghost:     #48484F
--header-bg:  rgba(12,12,13,0.88)   /* header backdrop */
--nav-bg:     rgba(12,12,13,0.97)   /* mobile bottom nav backdrop */

/* Light */
--bg-base:      #F6F6F4
--bg-surface:   #FFFFFF
--bg-elevated:  #EDEDEB
--text-primary:   #18181B
--text-secondary: #27272A
--text-tertiary:  #52525B
--text-muted:     #71717A
--header-bg:  rgba(246,246,244,0.92)
--nav-bg:     rgba(255,255,255,0.97)
```

Light mode overrides live in `.light {}` and are applied by a blocking inline script in `layout.tsx` to prevent flash of wrong theme (FOCT). **When adding new CSS vars used in immediately-visible chrome (header, nav), also add them to the FOCT script.**

**Fonts**: `Instrument Serif` (not used for hero numbers) · `Epilogue` (body/UI) · `JetBrains Mono` (all numbers and data)
- Hero financial figures (net pay, employer cost, required gross): `var(--font-mono)`, `fontWeight: 700`, `letterSpacing: '-0.04em'` — **no italic, no serif**

**Primary accent**: amber gold `--gold: #F59E0B` (light: `#D97706`)
**Semantic colors**: `--sage` (net pay/positive), `--rose` (PAYE/deductions), `--sky` (NSSF), `--violet` (HESLB)
**Card style**: `.card`, `.card-sage`, `.card-rose`, `.card-sky`, `.card-gold`, `.card-violet` — left accent via `box-shadow: inset 3px 0 0 var(--color)`

**URL sharing**: State encoded as `?g={gross}&nssf={rate}&heslb={0|1}&hrate={rate}&ben={amount}&bni={0|1}&cfix={amount}&cpct={percent}` — synced via `history.replaceState` in page.tsx.

## Known Gaps / Roadmap

- [ ] Local calculation history (last 10, localStorage)
- [ ] Annual tax summary view
- [ ] PPF (Parastatal Pension Fund) calculation option
- [ ] KES / UGX multi-currency support
- [ ] Push notifications for TRA schema version updates
- [ ] Full accessibility audit (WCAG 2.1 AA)
