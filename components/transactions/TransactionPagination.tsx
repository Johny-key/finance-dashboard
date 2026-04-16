'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
}

export default function TransactionPagination({ page, totalPages }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()

  const go = (p: number) => {
    const params = new URLSearchParams(sp.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const btnBase: React.CSSProperties = {
    background: '#212121',
    border: '1px solid rgba(228,227,217,0.08)',
    color: '#8A9099',
    fontFamily: "'DM Mono', monospace",
  }

  const btnActive: React.CSSProperties = {
    background: 'rgba(255,112,86,0.12)',
    border: '1px solid rgba(255,112,86,0.3)',
    color: '#FF7056',
    fontFamily: "'DM Mono', monospace",
  }

  // Show at most 5 page numbers around current
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
        style={btnBase}
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px]"
            style={{ color: '#4a5565' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p as number)}
            className="w-8 h-8 rounded-lg text-[12px] flex items-center justify-center transition-colors"
            style={p === page ? btnActive : btnBase}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
        style={btnBase}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
