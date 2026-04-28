# PAYE+ — Tanzania Tax Intelligence

> Production-grade salary & tax calculator for Tanzania. Powered by live TRA schema, built with Next.js 14.

---

## Features

| Feature | Description |
|---|---|
| **Quick Calculator** | Instant PAYE + NSSF + Net Pay from gross salary |
| **Advanced Mode** | Custom NSSF rate, fixed/percentage deductions, non-cash benefits |
| **Scenario Comparison** | Save up to 8 salary setups and compare side-by-side |
| **Reverse Calculator** | Binary-search powered: desired net → required gross |
| **Employer Cost View** | Full employer burden: NSSF + SDL + WCF |
| **Export Report** | Fintech-grade HTML/PDF with waterfall chart, bracket analysis, deduction table |
| **Dark / Light Mode** | Persistent theme with system-preference fallback |
| **Currency Toggle** | TZS ⇄ USD live conversion |
| **Remote Schema** | Tax config fetched from URL, cached 24h, fallback-safe |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, standalone output)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + CSS custom properties
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Fonts**: Syne (display) + Outfit (body) + DM Mono (numbers)

---

## Project Structure

```
payeplus/
├── app/
│   ├── api/schema/route.ts   # Serverless schema API endpoint
│   ├── globals.css            # Design system, CSS vars, utility classes
│   ├── layout.tsx             # Root layout + metadata
│   └── page.tsx               # Main orchestrator page
│
├── components/
│   ├── AnimatedNumber.tsx     # 60fps count-up animation
│   ├── AdvancedMode.tsx       # Power-user options panel
│   ├── DeductionPieChart.tsx  # Donut chart breakdown
│   ├── EmployerCostView.tsx   # SDL/WCF employer burden
│   ├── ExportButton.tsx       # Modal + report download trigger
│   ├── GradientBackground.tsx # Ambient orbs + grid overlay
│   ├── Header.tsx             # Brand, schema indicator, toggles
│   ├── ReverseCalculator.tsx  # Desired net → required gross
│   ├── SalaryBreakdown.tsx    # Animated metric card grid
│   ├── SalaryInput.tsx        # Hero salary input
│   ├── ScenarioComparison.tsx # Multi-scenario comparison table
│   ├── TabNavigation.tsx      # Animated pill tab bar
│   └── WaterfallChart.tsx     # Recharts floating bar waterfall
│
├── hooks/
│   ├── useSchema.ts           # Schema fetch/cache/fallback hook
│   └── useTheme.ts            # Persistent dark/light mode hook
│
├── lib/
│   ├── calculations.ts        # Pure tax calculation functions
│   ├── reportGenerator.ts     # HTML report builder + download trigger
│   ├── schema.ts              # Remote schema fetch with localStorage cache
│   ├── types.ts               # All TypeScript interfaces
│   └── utils.ts               # cn() helper
│
├── public/
│   └── tax_schema.json        # Local fallback schema (also served as static asset)
│
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Docker Compose service definition
├── caddy-payeplus.conf            # Caddy reverse proxy block
└── next.config.mjs            # Next.js config (standalone output)
```

---

## Tax Logic Reference

```
NSSF = gross × 10%  (or override rate)
Taxable Income = gross + benefits - NSSF

PAYE brackets (monthly):
  0        – 270,000  →  0%
  270,001  – 520,000  →  8%          (base: 0)
  520,001  – 760,000  → 20%          (base: 20,000)
  760,001  – 1,000,000 → 25%         (base: 68,000)
  1,000,001+           → 30%         (base: 128,000)

Net Pay = gross + benefits - NSSF - PAYE - custom_deductions

Employer Cost = gross + employer_NSSF(10%) + SDL(4.5%) + WCF(0.5%)
```

---

## Development Setup

```bash
# 1. Clone / copy project to your machine
cd /opt/apps/payeplus

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Type check
npm run type-check

# 5. Lint
npm run lint
```

---

## Production Deployment on Your VPS

### Step 1 — Copy project

```bash
# On your local machine
scp -r ./payeplus user@YOUR_VPS_IP:/opt/apps/payeplus
# or clone from git
```

### Step 2 — Create Caddy network (once)

```bash
docker network create caddy_network
```

Ensure your existing Caddy container is also on `caddy_network`:
```bash
docker network connect caddy_network caddy
```

### Step 3 — Update Caddyfile

```bash
# Append the PAYE+ block to your Caddyfile
cat /opt/apps/payeplus/caddy-payeplus.conf >> /opt/infra/Caddyfile

# Edit domain
nano /opt/infra/Caddyfile
# Replace: paye.mahembega.com → your actual subdomain

# Reload Caddy
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Step 4 — Build and start PAYE+

```bash
cd /opt/apps/payeplus

# Build image
docker compose build --no-cache

# Start service
docker compose up -d

# Check logs
docker compose logs -f payeplus
```

### Step 5 — Verify

```bash
# Health check
curl -f http://localhost:3000

# Via domain (after DNS propagation)
curl -f https://paye.mahembega.com
```

---

## Remote Schema Configuration

By default, PAYE+ loads the schema from `/tax_schema.json` (local public asset).

To serve from a remote URL (e.g. for centralised updates):

```bash
# In docker-compose.yml, add environment variable:
environment:
  - NEXT_PUBLIC_SCHEMA_URL=https://your-cdn.com/tax_schema.json
```

The schema is cached in `localStorage` for 24 hours. The header indicator shows:
- 🟢 **Live** — fetched fresh from remote
- 🔵 **Cached** — served from localStorage (< 24h)
- 🟡 **Offline** — using hardcoded fallback

---

## Updating Tax Rates

Edit `public/tax_schema.json` and update the `version`, `last_updated`, and relevant bracket fields. Rebuild the Docker image:

```bash
docker compose build && docker compose up -d
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Node.js server port |
| `NEXT_PUBLIC_SCHEMA_URL` | `/tax_schema.json` | Remote schema URL |
| `NODE_ENV` | `production` | Node environment |

---

## License

Private — built for production use.
