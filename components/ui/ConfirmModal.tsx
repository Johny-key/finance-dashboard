'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="w-full max-w-[340px] rounded-2xl p-6 relative"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,112,86,0.08)',
          animation: 'scale-in 0.2s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(255,112,86,0.12)',
              border: '1px solid rgba(255,112,86,0.28)',
            }}
          >
            <AlertTriangle size={17} style={{ color: 'var(--expense)' }} />
          </div>
          <h2
            className="text-[16px] font-bold flex-1"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            Подтверждение
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
          >
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

        {/* Message */}
        <p
          className="text-[13px] leading-relaxed mb-6"
          style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all hover:bg-white/[0.05]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-secondary)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              background: 'rgba(255,112,86,0.15)',
              border: '1px solid rgba(255,112,86,0.38)',
              color: '#FF7056',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,112,86,0.22)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,112,86,0.15)'
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
