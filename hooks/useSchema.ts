'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TaxSchema } from '@/lib/types';
import { fetchTaxSchema, bustSchemaCache } from '@/lib/schema';

export type SchemaSource = 'cache' | 'remote' | 'fallback' | 'loading';

interface UseSchemaResult {
  schema: TaxSchema | null;
  source: SchemaSource;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSchema(): UseSchemaResult {
  const [schema, setSchema] = useState<TaxSchema | null>(null);
  const [source, setSource] = useState<SchemaSource>('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (bustCache = false) => {
    setLoading(true);
    setError(null);
    setSource('loading');

    if (bustCache) {
      bustSchemaCache();
    }

    try {
      const result = await fetchTaxSchema();
      setSchema(result.schema);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching schema');
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { schema, source, loading, error, refresh };
}
