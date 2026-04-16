'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { deleteTransaction } from '@/app/actions/transactions'
import { showToast } from '@/components/ui/Toast'
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

export default function TransactionList({ transactions, categories }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteTransaction(id)
      if (result.success) {
        showToast('Транзакция удалена', 'success')
      } else {
        showToast(result.error, 'error')
      }
      router.refresh()
    })
  }

  if (transactions.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="text-4xl mb-3">💳</div>
        <div
          className="text-[14px] font-medium mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
        >
          Нет транзакций
        </div>
        <div
          className="text-[12px]"
          style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
        >
          Добавьте первую транзакцию через кнопку выше
        </div>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, Transaction[]> = {}
  transactions.forEach(t => {
    const key = t.date
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4">
      {dates.map(date => (
        <div key={date}>
          {/* Date header */}
          <div
            className="text-[10px] tracking-widest uppercase mb-2 px-1"
            style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
          >
            {formatDate(date)}
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {grouped[date].map((t, idx) => {
              const cat = t.category_id ? catMap[t.category_id] : null
              const isIncome = t.type === 'income'
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-white/[0.02]"
                  style={{
                    borderBottom: idx < grouped[date].length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] shrink-0"
                    style={{
                      background: cat
                        ? `${cat.color}20`
                        : isIncome ? 'rgba(59,232,208,0.10)' : 'rgba(255,112,86,0.10)',
                      border: `1px solid ${cat ? cat.color + '30' : isIncome ? 'rgba(59,232,208,0.2)' : 'rgba(255,112,86,0.2)'}`,
                    }}
                  >
                    {isEmoji(cat?.icon) ? cat!.icon : (isIncome ? '💰' : '💸')}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.description || cat?.name || (isIncome ? 'Доход' : 'Расход')}
                    </div>
                    {cat && (
                      <div
                        className="text-[10px] mt-0.5"
                        style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                      >
                        {cat.name}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isIncome
                      ? <ArrowUpRight size={13} style={{ color: 'var(--income)' }} />
                      : <ArrowDownRight size={13} style={{ color: 'var(--expense)' }} />
                    }
                    <span
                      className="text-[14px] font-semibold"
                      style={{
                        color: isIncome ? 'var(--income)' : 'var(--expense)',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {isIncome ? '+' : '−'}{formatRub(Number(t.amount))}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={pending}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.05] disabled:opacity-30 shrink-0"
                    title="Удалить"
                  >
                    <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
