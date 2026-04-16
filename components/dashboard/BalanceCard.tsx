'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Wallet, Plus, X, ArrowLeft } from 'lucide-react'
import AccountForm from '@/components/accounts/AccountForm'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { deleteAccount } from '@/app/actions/accounts'
import type { Account } from '@/types/database'
import { formatRub } from '@/lib/utils/currency'

function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

interface Props {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  delay?: number
  accounts: Account[]
}

export default function BalanceCard({ label, value, change, changeType = 'up', delay = 0, accounts }: Props) {
  const router = useRouter()
  const [isFlipped, setIsFlipped] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const openForm = useCallback(() => {
    setFormKey(k => k + 1)
    setShowForm(true)
  }, [])

  const closeForm = useCallback(() => setShowForm(false), [])
  const handleFormSuccess = useCallback(() => setShowForm(false), [])

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    await deleteAccount(id)
    router.refresh()
  }

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

  const pluralAccounts = (n: number) => {
    if (n === 1) return 'счёт'
    if (n < 5) return 'счёта'
    return 'счетов'
  }

  // Shared visual style for both faces
  const faceBase: React.CSSProperties = {
    borderRadius: '1rem',
    background: 'linear-gradient(145deg, rgba(255,112,86,0.10) 0%, rgba(59,232,208,0.05) 50%, rgba(255,112,86,0.07) 100%)',
    border: '1px solid rgba(255,112,86,0.35)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    overflow: 'hidden',
  }

  return (
    // Perspective container — establishes 3-D space for children
    <div style={{ perspective: '1000px' }}>

      {/* Flip wrapper — rotates on isFlipped */}
      <div
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >

        {/* ── FRONT ── in normal flow → establishes wrapper height */}
        <div
          className="relative gradient-border glow-card inner-highlight"
          style={{
            ...faceBase,
            padding: '1.25rem',
            animation: `float-up 0.5s ${delay}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
          }}
        >
          {/* Background glows */}
          <div
            className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,112,86,0.22) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,232,208,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <div
              className="text-[10px] font-medium tracking-widest uppercase mb-3"
              style={{ color: 'rgba(255,170,148,0.85)', fontFamily: "'DM Mono', monospace" }}
            >
              {label}
            </div>
            <div
              className="text-[28px] xl:text-[32px] font-bold mb-2.5 leading-none shimmer-text"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {value}
            </div>
            {change && (
              <div className="flex items-center gap-1.5 mb-3">
                {changeType === 'up'
                  ? <TrendingUp size={12} style={{ color: 'var(--income)' }} />
                  : <TrendingDown size={12} style={{ color: 'var(--expense)' }} />
                }
                <span
                  className="text-[12px] font-medium"
                  style={{
                    color: changeType === 'up' ? 'var(--income)' : 'var(--expense)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {change}
                </span>
              </div>
            )}

            {/* Flip trigger */}
            <button
              onClick={() => setIsFlipped(true)}
              className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,170,148,0.7)', fontFamily: "'DM Mono', monospace" }}
            >
              <Wallet size={11} />
              <span>
                {accounts.length > 0
                  ? `${accounts.length} ${pluralAccounts(accounts.length)} · ${formatRub(totalBalance)}`
                  : 'Счета'
                }
              </span>
            </button>
          </div>
        </div>

        {/* ── BACK ── absolutely fills the same space as front */}
        <div
          className="gradient-border"
          style={{
            ...faceBase,
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between shrink-0">
            <span
              className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: 'rgba(255,170,148,0.85)', fontFamily: "'DM Mono', monospace" }}
            >
              Счета
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={openForm}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg"
                style={{
                  color: 'var(--coral)',
                  fontFamily: "'DM Mono', monospace",
                  background: 'rgba(255,112,86,0.08)',
                  border: '1px solid rgba(255,112,86,0.18)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,112,86,0.14)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,112,86,0.08)'}
              >
                <Plus size={10} />
                Добавить
              </button>
              <button
                onClick={() => setIsFlipped(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(228,227,217,0.06)',
                  border: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(228,227,217,0.10)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(228,227,217,0.06)'}
                aria-label="Назад"
              >
                <ArrowLeft size={11} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>

          {/* Accounts list — scrollable if content overflows */}
          <div className="flex-1 overflow-y-auto space-y-0.5" style={{ minHeight: 0 }}>
            {accounts.length === 0 ? (
              <div className="py-3 text-center">
                <div
                  className="text-[13px]"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                >
                  Нет счетов
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}
                >
                  Нажмите «Добавить»
                </div>
              </div>
            ) : (
              accounts.map(acc => (
                <div
                  key={acc.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl group"
                  style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(228,227,217,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[12px] shrink-0"
                    style={{
                      background: 'rgba(255,112,86,0.1)',
                      border: '1px solid rgba(255,112,86,0.2)',
                    }}
                  >
                    {isEmoji(acc.icon) ? acc.icon : '💳'}
                  </div>
                  <span
                    className="flex-1 text-[12px] font-medium truncate"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                  >
                    {acc.name}
                  </span>
                  <span
                    className="text-[12px] font-semibold tabular-nums"
                    style={{
                      color: Number(acc.balance) >= 0 ? 'var(--income)' : 'var(--expense)',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {formatRub(Number(acc.balance))}
                  </span>
                  <button
                    onClick={() => setConfirmDeleteId(acc.id)}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center transition-all hover:bg-white/[0.05]"
                  >
                    <X size={10} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Total row */}
          {accounts.length > 0 && (
            <div
              className="flex items-center justify-between pt-2 shrink-0 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <span
                className="text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}
              >
                Итого
              </span>
              <span
                className="text-[14px] font-bold tabular-nums"
                style={{
                  color: totalBalance >= 0 ? 'var(--income)' : 'var(--expense)',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {formatRub(totalBalance)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AccountForm modal */}
      {showForm && (
        <AccountForm
          key={formKey}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          message="Удалить счёт? Транзакции, привязанные к нему, останутся без счёта."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
