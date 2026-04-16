'use client'

import { useActionState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createAccount } from '@/app/actions/accounts'
import type { ActionResult } from '@/types/database'

const PRESET_ICONS = ['💳', '🏦', '💵', '🪙', '💰', '🏧', '📱', '🌐', '💎', '🔐']

type AccountAction = (
  prevState: ActionResult<{ id: string }> | undefined,
  formData: FormData
) => Promise<ActionResult<{ id: string }>>

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AccountForm({ onClose, onSuccess }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(
    createAccount as AccountAction,
    undefined
  )

  // Close only after confirmed success; clear fields first so they don't
  // show stale data during the close animation.
  useEffect(() => {
    if (!state?.success) return
    formRef.current?.reset()
    onSuccess()
  }, [state, onSuccess])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
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
            Новый счёт
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.05]">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Название *
            </label>
            <input
              name="name"
              type="text"
              required
              maxLength={50}
              placeholder="Наличные"
              className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
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

          {/* Starting balance */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Начальный баланс ₽
            </label>
            <input
              name="balance"
              type="number"
              step="0.01"
              defaultValue="0"
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

          {/* Icon */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Иконка
            </label>
            <input
              name="icon"
              type="text"
              maxLength={4}
              defaultValue="💳"
              className="w-full rounded-xl px-4 py-3 text-[16px] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  className="w-8 h-8 rounded-lg text-[16px] flex items-center justify-center hover:bg-white/[0.05] transition-colors"
                  style={{ border: '1px solid var(--border)' }}
                  onClick={e => {
                    const form = e.currentTarget.closest('form') as HTMLFormElement
                    const input = form?.elements.namedItem('icon') as HTMLInputElement
                    if (input) input.value = ic
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {state && !state.success && (
            <div className="text-[12px] px-3 py-2 rounded-lg"
              style={{
                color: 'var(--expense)',
                background: 'rgba(255,112,86,0.08)',
                border: '1px solid rgba(255,112,86,0.2)',
                fontFamily: "'DM Mono', monospace",
              }}>
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
            {pending ? 'Создание...' : 'Создать счёт'}
          </button>
        </form>
      </div>
    </div>
  )
}
