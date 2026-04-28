'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { buildPieData, formatPercent } from '@/lib/calculations';
import type { SalaryBreakdown, Currency } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface DeductionPieChartProps {
  breakdown: SalaryBreakdown;
  currency: Currency;
  usdRate: number;
  className?: string;
}

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: { value: number; percent: number };
  }>;
  formatter: (n: number) => string;
}

function CustomLegend({ payload = [], formatter }: CustomLegendProps) {
  return (
    <div className="flex flex-col gap-2 mt-3 sm:mt-0">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center justify-between gap-4 min-w-[140px]">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-xs text-slate-400 font-medium">{entry.value}</span>
          </div>
          <span className="font-mono text-xs text-slate-300">
            {formatPercent(entry.payload.percent, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { fill: string; percent: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-obsidian-800 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{d.name}</p>
      <p className="font-mono font-bold text-sm" style={{ color: d.payload.fill }}>
        TZS {Math.round(d.value).toLocaleString('en-TZ')}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        {formatPercent(d.payload.percent, 1)} of gross
      </p>
    </div>
  );
}

export function DeductionPieChart({
  breakdown,
  currency,
  usdRate,
  className,
}: DeductionPieChartProps) {
  const data = buildPieData(breakdown);
  const fmt = (n: number) => formatCurrency(n, currency, usdRate);

  if (!data.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className={cn('card-glass p-5', className)}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-300">Salary Distribution</h3>
        <p className="text-xs text-slate-600 mt-0.5">Proportion of each component</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              animationBegin={100}
              animationDuration={700}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.88} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom legend */}
        <div className="flex flex-col gap-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                  style={{ background: entry.fill }}
                />
                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-semibold text-slate-300">
                  {formatPercent(entry.percent, 1)}
                </p>
                <p className="font-mono text-[10px] text-slate-600">
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
