'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { buildPieData, formatPercent, formatCurrency } from '@/lib/calculations';
import type { SalaryBreakdown, Currency } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeductionPieChartProps {
  breakdown: SalaryBreakdown;
  currency: Currency;
  usdRate: number;
  className?: string;
}

function CustomTooltip({
  active, payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string; percent: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      className="rounded-xl px-3.5 py-3"
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
        {d.name}
      </p>
      <p
        className="font-bold text-[13px] tabular-nums"
        style={{ color: d.payload.fill, fontFamily: 'var(--font-mono)' }}
      >
        TZS {Math.round(d.value).toLocaleString('en-TZ')}
      </p>
      <p
        className="text-[11px] mt-0.5"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {formatPercent(d.payload.percent, 1)} of gross
      </p>
    </div>
  );
}

export function DeductionPieChart({ breakdown, currency, usdRate, className }: DeductionPieChartProps) {
  const data = buildPieData(breakdown);
  const fmt = (n: number) => formatCurrency(n, currency, usdRate);

  if (!data.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
      className={cn('card p-4 sm:p-5', className)}
    >
      {/* Title */}
      <p
        className="text-[11px] font-semibold uppercase tracking-widest mb-4"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Distribution
      </p>

      <div className="flex items-center gap-3 sm:flex-col sm:items-start">
        {/* Donut */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                animationBegin={80}
                animationDuration={600}
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} fillOpacity={0.88} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0 sm:w-full">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-2 w-2 rounded-sm flex-shrink-0" style={{ background: entry.fill }} />
                <span
                  className="text-[11px] truncate"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  {entry.name}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="font-bold text-[11px] tabular-nums"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {formatPercent(entry.percent, 1)}
                </p>
                <p
                  className="text-[10px] tabular-nums"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {fmt(entry.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
