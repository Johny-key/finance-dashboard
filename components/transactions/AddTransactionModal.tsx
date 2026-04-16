'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { createTransaction } from '@/app/actions/transactions'
import { showToast } from '@/components/ui/Toast'
import CustomSelect from '@/components/ui/CustomSelect'
import type { Category, Account } from '@/types/database'

/** Returns true only if the string starts with an actual emoji/symbol (non-ASCII). */
function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

type TxType = 'expense' | 'income' | 'transfer'

interface Props {
  categories: Category[]
  accounts: Account[]
  onClose: () => void
}

export default function AddTransactionModal({ categories, accounts, onClose }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createTransaction, undefined)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [txType, setTxType] = useState<TxType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')

  // Close on success
  useEffect(() => {
    if (state?.success) {
      showToast('Транзакция добавлена', 'success')
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const today = new Date().toISOString().slice(0, 10)

  const categoryOptions = [
    { value: '', label: <span style={{ color: 'var(--text-muted)' }}>— Без категории —</span> },
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

  const accountOptions = [
    { value: '', label: <span style={{ color: 'var(--text-muted)' }}>— Без счёта —</span> },
    ...accounts.map(a => ({
      value: a.id,
      label: (
        <span className="flex items-center gap-2">
          <span className="text-[13px]">{isEmoji(a.icon) ? a.icon : '💳'}</span>
          <span>{a.name}</span>
        </span>
      ),
    })),
  ]

  const fromAccountOptions = accounts.map(a => ({
    value: a.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="text-[13px]">{isEmoji(a.icon) ? a.icon : '💳'}</span>
        <span>{a.name}</span>
      </span>
    ),
  }))

  const toAccountOptions = accounts.map(a => ({
    value: a.id,
    label: (
      <span className="flex items-center gap-2">
        <span className="text-[13px]">{isEmoji(a.icon) ? a.icon : '💳'}</span>
        <span>{a.name}</span>
      </span>
    ),
  }))

  const showTransfer = accounts.length >= 2

  const TYPE_TABS: { value: TxType; label: string }[] = [
    { value: 'expense',  label: '↓ Расход' },
    { value: 'income',   label: '↑ Доход' },
    ...(showTransfer ? [{ value: 'transfer' as TxType, label: '⇄ Перевод' }] : []),
  ]

  const typeColors: Record<TxType, { color: string; bg: string; border: string }> = {
    expense:  { color: 'var(--expense)',  bg: 'rgba(255,112,86,0.08)',  border: 'rgba(255,112,86,0.3)' },
    income:   { color: 'var(--income)',   bg: 'rgba(59,232,208,0.08)',  border: 'rgba(59,232,208,0.3)' },
    transfer: { color: 'var(--coral)',    bg: 'rgba(255,112,86,0.06)',  border: 'rgba(255,112,86,0.2)' },
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'float-up 0.3s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[18px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            Новая транзакция
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.05]"
          >
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form action={action} className="space-y-4">
          {/* Hidden type field */}
          <input type="hidden" name="type" value={txType} />

          {/* Type toggle */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Тип
            </label>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${TYPE_TABS.length + (showTransfer ? 0 : 1)}, 1fr)` }}
            >
              {TYPE_TABS.map(tab => {
                const isActive = txType === tab.value
                const colors = typeColors[tab.value]
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setTxType(tab.value)}
                    className="text-center py-2.5 rounded-xl text-[13px] font-semibold transition-all border"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: isActive ? colors.color : 'var(--text-muted)',
                      background: isActive ? colors.bg : 'transparent',
                      borderColor: isActive ? colors.border : 'var(--border)',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
              {/* Dimmed "Перевод" hint when < 2 accounts */}
              {!showTransfer && (
                <div
                  title="Создайте 2 счёта, чтобы делать переводы"
                  className="text-center py-2.5 rounded-xl text-[13px] border cursor-not-allowed select-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: 'var(--text-muted)',
                    borderColor: 'var(--border)',
                    opacity: 0.4,
                  }}
                >
                  ⇄ Перевод
                </div>
              )}
            </div>
            {!showTransfer && (
              <p className="text-[11px] mt-1.5"
                style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                Добавьте 2+ счёта на главной, чтобы делать переводы
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Сумма ₽ *
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-colors"
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

          {/* Transfer: from/to accounts */}
          {txType === 'transfer' ? (
            <>
              <div>
                <label className="block text-[10px] tracking-widest uppercase mb-2"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                  Откуда *
                </label>
                <CustomSelect
                  name="from_account_id"
                  options={fromAccountOptions}
                  value={fromAccountId}
                  onChange={setFromAccountId}
                  placeholder="— Выберите счёт —"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase mb-2"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                  Куда *
                </label>
                <CustomSelect
                  name="to_account_id"
                  options={toAccountOptions}
                  value={toAccountId}
                  onChange={setToAccountId}
                  placeholder="— Выберите счёт —"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Category */}
              <div>
                <label className="block text-[10px] tracking-widest uppercase mb-2"
                  style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                  Категория
                </label>
                <CustomSelect
                  name="category_id"
                  options={categoryOptions}
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="— Без категории —"
                />
              </div>

              {/* Account */}
              {accounts.length > 0 && (
                <div>
                  <label className="block text-[10px] tracking-widest uppercase mb-2"
                    style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                    Счёт
                  </label>
                  <CustomSelect
                    name="account_id"
                    options={accountOptions}
                    value={accountId}
                    onChange={setAccountId}
                    placeholder="— Без счёта —"
                  />
                </div>
              )}
            </>
          )}

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Описание
            </label>
            <input
              name="description"
              type="text"
              maxLength={200}
              placeholder="Необязательно"
              className="w-full rounded-xl px-4 py-3 text-[13px] outline-none transition-colors"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Дата *
            </label>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-xl px-4 py-3 text-[13px] outline-none transition-colors"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: "'DM Mono', monospace",
                colorScheme: 'dark',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Error */}
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

          {/* Submit */}
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
            {pending ? 'Сохранение...' : txType === 'transfer' ? 'Выполнить перевод' : 'Добавить транзакцию'}
          </button>
        </form>
      </div>
    </div>
  )
}
