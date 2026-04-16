'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ChartMonth } from '@/lib/utils/calculations'
import { formatAmount } from '@/lib/utils/currency'

// Actual hex values — CSS var() doesn't work inside SVG attributes
const INCOME_COLOR  = '#3BE8D0'
const EXPENSE_COLOR = '#FF7056'
const GRID_COLOR    = 'rgba(228,227,217,0.07)'
const CURSOR_COLOR  = 'rgba(228,227,217,0.12)'
const TICK_COLOR    = '#4a5565'

interface Props {
  data: ChartMonth[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3 text-[12px]"
      style={{
        background: '#232320',
        border: '1px solid rgba(255,112,86,0.22)',
        fontFamily: "'DM Mono', monospace",
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      }}
    >
      <div className="font-semibold mb-2" style={{ color: '#E4E3D9' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: '#4a5565' }}>
            {p.dataKey === 'income' ? 'Доходы' : 'Расходы'}:
          </span>
          <span style={{ color: p.color }}> {formatAmount(p.value)} ₽</span>
        </div>
      ))}
    </div>
  )
}

export default function SpendingAreaChart({ data }: Props) {
  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div
            className="text-[15px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            Доходы и расходы
          </div>
          <div
            className="text-[10px] mt-0.5 tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
          >
            Последние 6 месяцев
          </div>
        </div>
        <div className="flex items-center gap-4">
          {[
            { color: INCOME_COLOR,  label: 'Доходы' },
            { color: EXPENSE_COLOR, label: 'Расходы' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={INCOME_COLOR}  stopOpacity={0.25} />
                <stop offset="95%" stopColor={INCOME_COLOR}  stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={EXPENSE_COLOR} stopOpacity={0.22} />
                <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: TICK_COLOR, fontSize: 11, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: TICK_COLOR, fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}к` : String(v)}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: CURSOR_COLOR, strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke={INCOME_COLOR}
              strokeWidth={2}
              fill="url(#gradIncome)"
              dot={false}
              activeDot={{ r: 4, fill: INCOME_COLOR, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke={EXPENSE_COLOR}
              strokeWidth={2}
              fill="url(#gradExpense)"
              dot={false}
              activeDot={{ r: 4, fill: EXPENSE_COLOR, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
