'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategorySpend } from '@/lib/utils/calculations'
import { formatAmount } from '@/lib/utils/currency'

interface Props {
  data: CategorySpend[]
}

const FALLBACK_COLORS = [
  '#FF7056', '#3BE8D0', '#F5A623', '#7B68EE', '#50C878',
  '#FF69B4', '#87CEEB', '#DDA0DD', '#98FB98', '#F0E68C',
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategorySpend
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
      <div className="font-semibold mb-1" style={{ color: '#E4E3D9' }}>
        {d.category.name}
      </div>
      <div style={{ color: '#4a5565' }}>
        {formatAmount(d.spent)} ₽ · {d.pct.toFixed(1)}%
      </div>
    </div>
  )
}

export default function CategoryPieChart({ data }: Props) {
  const top = data.slice(0, 8)

  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="mb-4">
        <div
          className="text-[15px] font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
        >
          По категориям
        </div>
        <div
          className="text-[10px] mt-0.5 tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
        >
          Расходы текущего месяца
        </div>
      </div>

      {top.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
          <div className="text-3xl">🧮</div>
          <div className="text-[12px]" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
            Нет расходов
          </div>
        </div>
      ) : (
        <>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="spent"
                  strokeWidth={0}
                >
                  {top.map((entry, i) => (
                    <Cell
                      key={entry.category.id}
                      fill={entry.category.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 flex-1">
            {top.map((d, i) => (
              <div key={d.category.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: d.category.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                />
                <span
                  className="flex-1 text-[11px] truncate"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}
                >
                  {d.category.name}
                </span>
                <span
                  className="text-[11px] tabular-nums shrink-0"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                >
                  {d.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
