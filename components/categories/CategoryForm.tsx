'use client'

import { useActionState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createCategory, updateCategory } from '@/app/actions/categories'
import type { Category, ActionResult } from '@/types/database'

const PRESET_COLORS = [
  '#FF7056', '#3BE8D0', '#F5A623', '#7B68EE', '#50C878',
  '#FF69B4', '#87CEEB', '#DDA0DD', '#F0E68C', '#98FB98',
]

const PRESET_ICONS = ['🛒', '🚗', '🏠', '💊', '🎬', '✈️', '📚', '🍕', '💼', '🎮', '👕', '💰', '💸', '🔧', '🏋️']

interface Props {
  category?: Category
  onClose: () => void
  onSuccess: () => void
}

type CategoryAction = (
  prevState: ActionResult | undefined,
  formData: FormData
) => Promise<ActionResult>

export default function CategoryForm({ category, onClose, onSuccess }: Props) {
  const action: CategoryAction = category
    ? (updateCategory.bind(null, category.id) as unknown as CategoryAction)
    : (createCategory as unknown as CategoryAction)

  const [state, formAction, pending] = useActionState(action, undefined)

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
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
            {category ? 'Редактировать' : 'Новая категория'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.05]">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
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
              defaultValue={category?.name}
              placeholder="Продукты"
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

          {/* Emoji icon */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Иконка (эмодзи)
            </label>
            <input
              name="icon"
              type="text"
              maxLength={4}
              defaultValue={category?.icon ?? ''}
              placeholder="🛒"
              className="w-full rounded-xl px-4 py-3 text-[16px] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
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
                    const input = (e.currentTarget.closest('form') as HTMLFormElement)
                      ?.elements.namedItem('icon') as HTMLInputElement
                    if (input) input.value = ic
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Цвет
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <label key={c} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={c}
                    defaultChecked={c === (category?.color ?? '#FF7056')}
                    className="sr-only peer"
                  />
                  <div
                    className="w-7 h-7 rounded-full transition-transform peer-checked:scale-125 peer-checked:ring-2 peer-checked:ring-offset-1"
                    style={{
                      background: c,
                      outline: 'none',
                    }}
                  />
                  <style>{`
                    input[value="${c}"]:checked + div {
                      outline: 2px solid ${c};
                      outline-offset: 2px;
                    }
                  `}</style>
                </label>
              ))}
            </div>
          </div>

          {/* Monthly limit */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              План бюджета на месяц ₽
            </label>
            <input
              name="monthly_limit"
              type="number"
              step="1"
              min="1"
              defaultValue={category?.monthly_limit ?? ''}
              placeholder="Без лимита"
              className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: "'DM Mono', monospace",
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--coral)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <p className="mt-1.5 text-[11px]"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Можно изменить 1 раз в месяц
            </p>
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
            {pending ? 'Сохранение...' : category ? 'Сохранить' : 'Создать категорию'}
          </button>
        </form>
      </div>
    </div>
  )
}
