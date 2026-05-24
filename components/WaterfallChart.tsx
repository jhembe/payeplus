'use client';

import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { buildWaterfallData, compactNumber } from '@/lib/calculations';
import type { SalaryBreakdown } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WaterfallChartProps {
  breakdown: SalaryBreakdown;
  className?: string;
}

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ payload: { amount: number; tooltip: string; fill: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data || data.amount === 0) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[150px]"
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-popover)',
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {label}
      </p>
      <p
        className="font-bold text-[13px] tabular-nums"
        style={{ color: data.fill, fontFamily: 'var(--font-mono)' }}
      >
        TZS {data.amount.toLocaleString('en-TZ')}
      </p>
      <p
        className="text-[11px] mt-1"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        {data.tooltip}
      </p>
    </div>
  );
}

function CustomLabel({
  x = 0, y = 0, width = 0, height = 0, value = 0, fill,
}: {
  x?: number; y?: number; width?: number; height?: number; value?: number; fill?: string;
}) {
  if (!value) return null;
  const isTall = height >= 22;
  return (
    <text
      x={x + width / 2}
      y={isTall ? y + height / 2 : y - 5}
      textAnchor="middle"
      dominantBaseline={isTall ? 'middle' : 'auto'}
      fill={isTall ? (fill ?? '#fff') : 'var(--text-muted)'}
      fontSize={10}
      fontFamily="JetBrains Mono, monospace"
      fontWeight={600}
      fillOpacity={0.9}
    >
      {compactNumber(value)}
    </text>
  );
}

export function WaterfallChart({ breakdown, className }: WaterfallChartProps) {
  const data = buildWaterfallData(breakdown);
  const maxValue = breakdown.gross + breakdown.benefits + breakdown.nssf + breakdown.paye;

  const LEGEND = [
    { color: '#F59E0B', label: 'Gross' },
    { color: '#38BDF8', label: 'NSSF' },
    { color: '#FB7185', label: 'PAYE' },
    { color: '#4ADE80', label: 'Net' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
      className={cn('card p-4 sm:p-5', className)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Salary Waterfall
        </p>
        <div className="flex items-center gap-3">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-1.5 w-3 rounded-full" style={{ background: l.color }} />
              <span
                className="text-[10px]"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 16, left: 0 }} barGap={4}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border-hair)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Epilogue, sans-serif', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => compactNumber(v)}
            domain={[0, maxValue * 1.15]}
            tick={{ fill: 'var(--text-ghost)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={46}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(245,158,11,0.03)', radius: 4 }}
          />
          <Bar dataKey="invisible" stackId="waterfall" fill="transparent" />
          <Bar dataKey="amount" stackId="waterfall" radius={[4, 4, 0, 0]} maxBarSize={64}>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.fill} fillOpacity={0.9} />
            ))}
            <LabelList
              dataKey="amount"
              position="inside"
              content={(props) => (
                <CustomLabel {...(props as Parameters<typeof CustomLabel>[0])} fill="rgba(255,255,255,0.9)" />
              )}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
