'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import type { Category } from '@/types/database'

/** Returns true only if the string starts with an actual emoji/symbol (non-ASCII). */
function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

interface Props {
  categories: Category[]
}

const inputStyle: React.CSSProperties = {
  background: '#212121',
  border: '1px solid rgba(228,227,217,0.08)',
  color: '#8A9099',
  fontFamily: "'Inter', sans-serif",
}

export default function TransactionFilters({ categories }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  const setParam = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(sp.toString())
      params.delete('page')
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, sp]
  )

  const type     = sp.get('type')     ?? ''
  const category = sp.get('category') ?? ''
  const search   = sp.get('search')   ?? ''
  const from     = sp.get('from')     ?? ''
  const to       = sp.get('to')       ?? ''

  const hasFilters = !!(type || category || search || from || to)

  const typeOptions = [
    { value: '', label: 'Все типы' },
    { value: 'income', label: '↑ Доходы' },
    { value: 'expense', label: '↓ Расходы' },
  ]

  const categoryOptions = [
    { value: '', label: 'Все категории' },
    ...categories.map(c => ({
      value: c.id,
      label: (
        <span className="flex items-center gap-1.5">
          <span className="text-[12px]">{isEmoji(c.icon) ? c.icon : '🏷️'}</span>
          <span>{c.name}</span>
        </span>
      ),
    })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#4a5565' }}
        />
        <input
          ref={searchRef}
          type="text"
          defaultValue={search}
          placeholder="Поиск..."
          onKeyDown={e => {
            if (e.key === 'Enter')
              setParam({ search: (e.target as HTMLInputElement).value.trim() })
          }}
          onBlur={e => setParam({ search: e.target.value.trim() })}
          className="pl-8 pr-3 py-2 rounded-xl text-[12px] outline-none w-[160px]"
          style={inputStyle}
        />
      </div>

      {/* Type */}
      <div style={{ minWidth: '130px' }}>
        <CustomSelect
          name="_type_filter"
          options={typeOptions}
          value={type}
          onChange={v => setParam({ type: v })}
          placeholder="Все типы"
          small
        />
      </div>

      {/* Category */}
      <div style={{ minWidth: '160px' }}>
        <CustomSelect
          name="_category_filter"
          options={categoryOptions}
          value={category}
          onChange={v => setParam({ category: v })}
          placeholder="Все категории"
          small
        />
      </div>

      {/* Date range */}
      <input
        type="date"
        value={from}
        onChange={e => setParam({ from: e.target.value })}
        className="rounded-xl px-3 py-2 text-[12px] outline-none"
        style={{ ...inputStyle, colorScheme: 'dark' }}
        title="С даты"
      />
      <span className="text-[11px]" style={{ color: '#4a5565' }}>—</span>
      <input
        type="date"
        value={to}
        onChange={e => setParam({ to: e.target.value })}
        className="rounded-xl px-3 py-2 text-[12px] outline-none"
        style={{ ...inputStyle, colorScheme: 'dark' }}
        title="По дату"
      />

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={() => {
            if (searchRef.current) searchRef.current.value = ''
            router.push(pathname)
          }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] transition-colors"
          style={{
            color: '#FF7056',
            background: 'rgba(255,112,86,0.08)',
            border: '1px solid rgba(255,112,86,0.15)',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <X size={11} />
          Сбросить
        </button>
      )}
    </div>
  )
}
