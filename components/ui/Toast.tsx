'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

// Simple event bus so any component can fire a toast
const listeners = new Set<(t: ToastItem) => void>()

export function showToast(message: string, type: ToastType = 'success') {
  const item: ToastItem = { id: Math.random().toString(36).slice(2), message, type }
  listeners.forEach(fn => fn(item))
}

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
}

const COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: 'rgba(59,232,208,0.3)',  icon: '#3BE8D0', bg: 'rgba(59,232,208,0.08)' },
  error:   { border: 'rgba(255,112,86,0.3)',  icon: '#FF7056', bg: 'rgba(255,112,86,0.08)' },
  warning: { border: 'rgba(255,159,67,0.3)',  icon: '#FF9F43', bg: 'rgba(255,159,67,0.08)' },
}

function SingleToast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const Icon   = ICONS[item.type]
  const colors = COLORS[item.type]

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 3.2 s
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(item.id), 300)
    }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [item.id, onDismiss])

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl pointer-events-auto"
      style={{
        background: '#212121',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        minWidth: 240,
        maxWidth: 360,
      }}
    >
      <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: colors.bg }}>
        <Icon size={13} color={colors.icon} />
      </div>
      <span className="flex-1 text-[13px]" style={{ color: '#E4E3D9' }}>{item.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(item.id), 300) }}
        className="shrink-0 w-5 h-5 flex items-center justify-center rounded opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={11} color="#8A9099" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const add = (t: ToastItem) => setToasts(prev => [...prev.slice(-4), t])
    listeners.add(add)
    return () => { listeners.delete(add) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ animation: 'none' }}
    >
      {toasts.map(t => (
        <SingleToast key={t.id} item={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
