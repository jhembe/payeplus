'use client';

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { buildWaterfallData, compactNumber } from '@/lib/calculations';
import type { SalaryBreakdown } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WaterfallChartProps {
  breakdown: SalaryBreakdown;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      amount: number;
      tooltip: string;
      type: 'positive' | 'negative' | 'result';
      fill: string;
    };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data || data.amount === 0) return null;

  return (
    <div className="bg-obsidian-800 border border-white/10 rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono font-bold text-base" style={{ color: data.fill }}>
        TZS {data.amount.toLocaleString('en-TZ')}
      </p>
      <p className="text-[11px] text-slate-400 mt-1">{data.tooltip}</p>
    </div>
  );
}

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
}

function CustomLabel({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value = 0,
  fill,
}: CustomLabelProps) {
  if (!value) return null;

  const isTall = height >= 24;

  return (
      <text
        x={x + width / 2}
        y={isTall ? y + height / 2 : y - 6}
        textAnchor="middle"
        dominantBaseline={isTall ? 'middle' : 'auto'}
        fill={isTall ? fill ?? '#fff' : '#CBD5F5'}
        fontSize={11}
        fontFamily="DM Mono, monospace"
        fontWeight={600}
        fillOpacity={0.95}
      >
        {compactNumber(value)}
      </text>
    );
  }

export function WaterfallChart({ breakdown, className }: WaterfallChartProps) {
  const data = buildWaterfallData(breakdown);
  const maxValue =
  breakdown.gross +
  breakdown.benefits +
  breakdown.nssf +
  breakdown.paye;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={cn('card-glass p-5', className)}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Salary Waterfall</h3>
          <p className="text-xs text-slate-600 mt-0.5">Gross → deductions → net breakdown</p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 flex-wrap justify-end">
          {[
            { color: '#6366F1', label: 'Income' },
            { color: '#F59E0B', label: 'NSSF' },
            { color: '#EF4444', label: 'PAYE' },
            { color: '#10B981', label: 'Net' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ background: l.color }}
              />
              <span className="text-[11px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={4}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            tick={{
              fill: '#64748B',
              fontSize: 11,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => compactNumber(v)}
            domain={[0, maxValue * 1.15]}
            tick={{
              fill: '#475569',
              fontSize: 10,
              fontFamily: 'DM Mono, monospace',
            }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 6 }}
          />

          {/* Invisible spacer bar — creates floating effect */}
          <Bar dataKey="invisible" stackId="waterfall" fill="transparent" />

          {/* Visible amount bar */}
          <Bar
            dataKey="amount"
            stackId="waterfall"
            radius={[5, 5, 0, 0]}
            maxBarSize={72}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
            ))}
            <LabelList
              dataKey="amount"
              position="inside"
              content={(props) => (
                <CustomLabel
                  {...(props as CustomLabelProps)}
                  fill="rgba(255,255,255,0.85)"
                />
              )}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
