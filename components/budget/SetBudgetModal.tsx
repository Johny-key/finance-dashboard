'use client'

import { useActionState, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { upsertBudget } from '@/app/actions/budgets'
import CustomSelect from '@/components/ui/CustomSelect'
import type { Budget, Category } from '@/types/database'
import { currentMonthStart } from '@/lib/utils/date'

/** Returns true only if the string starts with an actual emoji/symbol (non-ASCII). */
function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

interface Props {
  categories: Category[]
  existing?: Budget
  preselectedCategoryId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function SetBudgetModal({
  categories, existing, preselectedCategoryId, onClose, onSuccess
}: Props) {
  const [state, action, pending] = useActionState(upsertBudget, undefined)
  const [categoryId, setCategoryId] = useState(
    existing?.category_id ?? preselectedCategoryId ?? ''
  )

  useEffect(() => {
    if (state?.success) onSuccess()
  }, [state, onSuccess])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const defaultMonth = existing?.month ?? currentMonthStart()

  const categoryOptions = [
    { value: '', label: <span style={{ color: 'var(--text-muted)' }}>— Выберите —</span> },
    ...categories.map(c => ({
      value: c.id,
      label: (
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-[13px] shrink-0"
            style={{
              background: `${c.color}22`,
              border: `1px solid ${c.color}44`,
            }}
          >
            {isEmoji(c.icon) ? c.icon : '🏷️'}
          </span>
          <span>{c.name}</span>
        </span>
      ),
    })),
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'float-up 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[18px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            {existing ? 'Изменить лимит' : 'Новый бюджет'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.05]">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="month" value={defaultMonth} />

          {/* Category */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Категория *
            </label>
            <CustomSelect
              name="category_id"
              options={categoryOptions}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="— Выберите —"
              required
            />
          </div>

          {/* Limit */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Лимит ₽ *
            </label>
            <input
              name="limit_amount"
              type="number"
              step="1"
              min="1"
              required
              defaultValue={existing?.limit_amount}
              placeholder="10000"
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: "'DM Mono', monospace",
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {state && !state.success && (
            <div
              className="text-[12px] px-3 py-2 rounded-lg"
              style={{
                color: 'var(--expense)',
                background: 'rgba(255,112,86,0.08)',
                border: '1px solid rgba(255,112,86,0.2)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-98 disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #FF7056, #3BE8D0)',
              color: '#111',
              fontFamily: "'Inter', sans-serif",
              boxShadow: pending ? 'none' : '0 4px 18px rgba(255,112,86,0.35)',
            }}
          >
            {pending ? 'Сохранение...' : existing ? 'Сохранить' : 'Создать бюджет'}
          </button>
        </form>
      </div>
    </div>
  )
}
