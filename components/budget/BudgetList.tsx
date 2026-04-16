'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, AlertTriangle, TrendingUp } from 'lucide-react'
import { deleteBudget } from '@/app/actions/budgets'
import SetBudgetModal from './SetBudgetModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import type { BudgetStatus } from '@/lib/utils/calculations'
import type { Category } from '@/types/database'
import { formatRub } from '@/lib/utils/currency'

/** Returns true only if the string starts with an actual emoji/symbol (non-ASCII). */
function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

interface Props {
  budgetStatuses: BudgetStatus[]
  categories: Category[]
}

export default function BudgetList({ budgetStatuses, categories }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState<BudgetStatus | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDeleteConfirm = () => {
    if (!confirmId) return
    const id = confirmId
    setConfirmId(null)
    startTransition(async () => {
      await deleteBudget(id)
      router.refresh()
    })
  }

  const handleSuccess = () => {
    setEditing(null)
    setAdding(false)
    router.refresh()
  }

  // Categories without a budget this month
  const existingCatIds = new Set(budgetStatuses.map(b => b.budget.category_id))
  const availableCategories = categories.filter(c => !existingCatIds.has(c.id))

  return (
    <>
      <div className="space-y-3">
        {/* Add new */}
        {availableCategories.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-2xl p-4 flex items-center gap-3 transition-colors"
            style={{
              background: 'transparent',
              border: '1px dashed var(--border)',
              animation: 'float-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,112,86,0.08)', border: '1px solid rgba(255,112,86,0.2)' }}
            >
              <Plus size={16} style={{ color: 'var(--coral)' }} />
            </div>
            <span
              className="text-[13px] font-medium"
              style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              Добавить бюджет
            </span>
          </button>
        )}

        {budgetStatuses.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="text-4xl mb-3">🎯</div>
            <div
              className="text-[14px] font-medium mb-1"
              style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
            >
              Нет бюджетов
            </div>
            <div
              className="text-[12px]"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
            >
              Установите лимиты расходов для категорий
            </div>
          </div>
        )}

        {budgetStatuses.map((bs, i) => {
          const cat      = bs.budget.categories
          const icon     = isEmoji(cat?.icon) ? cat!.icon : '🏷️'
          const pct      = Math.min(bs.pct, 100)
          const barColor = bs.isOver ? 'var(--expense)' : bs.isNear ? '#F5A623' : 'var(--income)'

          return (
            <div
              key={bs.budget.id}
              className="rounded-2xl p-5 group relative"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${bs.isOver ? 'rgba(255,112,86,0.3)' : 'var(--border)'}`,
                animation: `float-up 0.5s ${i * 60}ms cubic-bezier(0.22,1,0.36,1) both`,
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] shrink-0"
                    style={{
                      background: cat ? `${cat.color}20` : 'rgba(255,112,86,0.10)',
                      border: `1px solid ${cat ? cat.color + '33' : 'rgba(255,112,86,0.2)'}`,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div
                      className="text-[14px] font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {cat?.name ?? 'Категория'}
                    </div>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                    >
                      лимит {formatRub(bs.budget.limit_amount)}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {bs.isOver && <AlertTriangle size={13} style={{ color: 'var(--expense)' }} />}
                  {bs.isNear && !bs.isOver && <TrendingUp size={13} style={{ color: '#F5A623' }} />}
                  <span
                    className="text-[12px] font-semibold"
                    style={{
                      color: bs.isOver ? 'var(--expense)' : bs.isNear ? '#F5A623' : 'var(--income)',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {bs.pct.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full mb-2 overflow-hidden"
                style={{ background: 'var(--bg)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>

              {/* Spent / limit row */}
              <div className="flex justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                >
                  потрачено {formatRub(bs.spent)}
                </span>
                <span
                  className="text-[11px]"
                  style={{
                    color: bs.isOver ? 'var(--expense)' : 'var(--text-muted)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {bs.isOver
                    ? `перерасход ${formatRub(bs.spent - bs.budget.limit_amount)}`
                    : `осталось ${formatRub(bs.budget.limit_amount - bs.spent)}`
                  }
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(bs)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.07]"
                >
                  <Pencil size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  onClick={() => setConfirmId(bs.budget.id)}
                  disabled={pending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.07] disabled:opacity-30"
                >
                  <Trash2 size={12} style={{ color: 'var(--expense)' }} />
                </button>
              </div>
            </div>
          )
        })}

        {/* Totals row */}
        {budgetStatuses.length > 0 && (() => {
          const totalLimit = budgetStatuses.reduce((s, b) => s + b.budget.limit_amount, 0)
          const totalSpent = budgetStatuses.reduce((s, b) => s + b.spent, 0)
          const totalPct   = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
          const isOver     = totalPct > 100
          return (
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
              }}
            >
              <div>
                <div
                  className="text-[10px] tracking-widest uppercase mb-1"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                >
                  Итого
                </div>
                <div
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace" }}
                >
                  {formatRub(totalSpent)}
                  <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                    {' / '}{formatRub(totalLimit)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[20px] font-bold tabular-nums"
                  style={{
                    color: isOver ? '#FF7056' : totalPct > 80 ? '#F5A623' : '#3BE8D0',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {totalPct.toFixed(0)}%
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                >
                  {isOver
                    ? `перерасход ${formatRub(totalSpent - totalLimit)}`
                    : `остаток ${formatRub(totalLimit - totalSpent)}`}
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {adding && (
        <SetBudgetModal
          categories={availableCategories}
          onClose={() => setAdding(false)}
          onSuccess={handleSuccess}
        />
      )}
      {editing && (
        <SetBudgetModal
          categories={categories}
          existing={editing.budget}
          onClose={() => setEditing(null)}
          onSuccess={handleSuccess}
        />
      )}
      {confirmId && (
        <ConfirmModal
          message="Удалить этот бюджет? Данные о расходах останутся в транзакциях."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  )
}
