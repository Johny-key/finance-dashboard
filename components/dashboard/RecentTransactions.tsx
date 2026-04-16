import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Transaction, Category } from '@/types/database'
import { formatRub } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'

/** Returns true only if the string starts with an actual emoji/symbol (non-ASCII). */
function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

interface Props {
  transactions: Transaction[]
  categories: Category[]
}

export default function RecentTransactions({ transactions, categories }: Props) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        animation: 'float-up 0.5s 360ms cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div
            className="text-[15px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            Последние операции
          </div>
          <div
            className="text-[10px] mt-0.5 tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
          >
            Текущий месяц
          </div>
        </div>
        <Link
          href="/transactions"
          className="text-[11px] px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
          style={{
            color: '#FF7056',
            background: 'rgba(255,112,86,0.08)',
            border: '1px solid rgba(255,112,86,0.15)',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          Все →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[22px]"
            style={{ background: 'rgba(255,112,86,0.08)', border: '1px solid rgba(255,112,86,0.15)' }}
          >
            💳
          </div>
          <div className="text-center">
            <div
              className="text-[13px] font-medium mb-0.5"
              style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
            >
              Нет транзакций
            </div>
            <div
              className="text-[11px]"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
            >
              Нажмите «Добавить» чтобы начать
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-0.5">
          {transactions.map((t, idx) => {
            const cat = t.category_id ? catMap[t.category_id] : null
            const isIncome = t.type === 'income'

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/[0.025]"
                style={{
                  // subtle separator between items (not last)
                  borderBottom: idx < transactions.length - 1
                    ? '1px solid rgba(228,227,217,0.04)'
                    : 'none',
                }}
              >
                {/* Category icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] shrink-0"
                  style={{
                    background: cat
                      ? `${cat.color}1A`
                      : isIncome ? 'rgba(59,232,208,0.10)' : 'rgba(255,112,86,0.10)',
                    border: `1px solid ${cat
                      ? cat.color + '30'
                      : isIncome ? 'rgba(59,232,208,0.2)' : 'rgba(255,112,86,0.2)'}`,
                  }}
                >
                  {isEmoji(cat?.icon) ? cat!.icon : (isIncome ? '💰' : '💸')}
                </div>

                {/* Description + category + date */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-medium truncate"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                  >
                    {t.description || cat?.name || (isIncome ? 'Доход' : 'Расход')}
                  </div>
                  <div
                    className="text-[10px] mt-0.5 flex items-center gap-1"
                    style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                  >
                    {cat && t.description && (
                      <><span>{cat.name}</span><span>·</span></>
                    )}
                    <span>{formatDate(t.date)}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1 shrink-0">
                  {isIncome
                    ? <ArrowUpRight size={12} color="#3BE8D0" />
                    : <ArrowDownRight size={12} color="#FF7056" />
                  }
                  <span
                    className="text-[13px] font-semibold tabular-nums"
                    style={{
                      color: isIncome ? '#3BE8D0' : '#FF7056',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {isIncome ? '+' : '−'}{formatRub(Number(t.amount))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
