import type { TaxSchema } from './types';

// ─── Fallback schema (inline, used when remote and local fetch both fail) ─────
const FALLBACK_SCHEMA: TaxSchema = {
  version: '2025.1.0',
  year: 2025,
  last_updated: '2025-01-01',
  currency: 'TZS',
  usd_rate: 2650,
  nssf_employee_rate: 0.1,
  nssf_employer_rate: 0.1,
  sdl_rate: 0.045,
  wcf_rate: 0.005,
  paye_brackets: [
    { min: 0, max: 270000, rate: 0, base: 0, label: 'Nil Band' },
    { min: 270000, max: 520000, rate: 0.08, base: 0, label: '8% Band' },
    { min: 520000, max: 760000, rate: 0.20, base: 20000, label: '20% Band' },
    { min: 760000, max: 1000000, rate: 0.25, base: 68000, label: '25% Band' },
    { min: 1000000, max: null, rate: 0.30, base: 128000, label: '30% Band' },
  ],
};

const CACHE_KEY = 'payeplus__tax_schema_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEnvelope {
  schema: TaxSchema;
  cached_at: number;
}

function readCache(): TaxSchema | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const envelope: CacheEnvelope = JSON.parse(raw);
    if (Date.now() - envelope.cached_at > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return envelope.schema;
  } catch {
    return null;
  }
}

function writeCache(schema: TaxSchema): void {
  if (typeof window === 'undefined') return;
  try {
    const envelope: CacheEnvelope = { schema, cached_at: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage quota or private mode — silently ignore
  }
}

/**
 * Fetches the tax schema from:
 *   1. localStorage cache (if valid, < 24h old)
 *   2. Remote URL (NEXT_PUBLIC_SCHEMA_URL or /tax_schema.json)
 *   3. Hardcoded fallback (offline resilience)
 *
 * Returns the schema and a flag indicating whether the remote fetch succeeded.
 */
export async function fetchTaxSchema(): Promise<{ schema: TaxSchema; source: 'cache' | 'remote' | 'fallback' }> {
  // 1. Try cache
  const cached = readCache();
  if (cached) {
    return { schema: cached, source: 'cache' };
  }

  // 2. Try remote / local asset
  const schemaUrl =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SCHEMA_URL) ||
    '/tax_schema.json';

  try {
    const res = await fetch(schemaUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const schema: TaxSchema = await res.json();
    writeCache(schema);
    return { schema, source: 'remote' };
  } catch {
    // 3. Offline fallback
    return { schema: FALLBACK_SCHEMA, source: 'fallback' };
  }
}

/** Busts the local cache, forcing re-fetch on next load. */
export function bustSchemaCache(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
