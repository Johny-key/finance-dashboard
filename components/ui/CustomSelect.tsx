'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: React.ReactNode
}

interface Props {
  name: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  small?: boolean
}

export default function CustomSelect({
  name,
  options,
  value,
  onChange,
  placeholder = '— Выберите —',
  required,
  small,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const py    = small ? 'py-2'   : 'py-3'
  const px    = small ? 'px-3'   : 'px-4'
  const size  = small ? '12px'   : '13px'

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full rounded-xl ${px} ${py} outline-none flex items-center justify-between gap-2 transition-colors`}
        style={{
          background: 'var(--bg)',
          border: `1px solid ${open ? 'var(--coral)' : 'var(--border)'}`,
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: "'Inter', sans-serif",
          fontSize: size,
          transition: 'border-color 0.15s',
        }}
      >
        <span className="truncate flex items-center gap-1.5">
          {selected ? selected.label : <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-bright)',
            boxShadow: '0 14px 44px rgba(0,0,0,0.55)',
            animation: 'float-up 0.15s ease both',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {options.map(option => {
            const isActive = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false) }}
                className="w-full text-left flex items-center gap-2 transition-colors"
                style={{
                  padding: small ? '8px 12px' : '10px 14px',
                  background: isActive ? 'rgba(255,112,86,0.1)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: size,
                  borderLeft: isActive ? '2px solid var(--coral)' : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(228,227,217,0.05)'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
