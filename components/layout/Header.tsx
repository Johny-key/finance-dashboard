'use client'

import { usePathname } from 'next/navigation'
import { Plus, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'
import type { Category, Account } from '@/types/database'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':             { title: 'Финансовый обзор',              subtitle: 'Текущий месяц' },
  '/transactions': { title: 'Транзакции',                    subtitle: 'Управление доходами и расходами' },
  '/categories':   { title: 'Бюджет',                        subtitle: 'Категории и лимиты расходов' },
}

interface HeaderProps {
  categories: Category[]
  accounts: Account[]
}

export default function Header({ categories, accounts }: HeaderProps) {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)
  const meta = PAGE_META[pathname] ?? PAGE_META['/']
  const showAddBtn = pathname === '/' || pathname === '/transactions'

  // Auto-close modal on route change
  useEffect(() => {
    setShowModal(false)
  }, [pathname])

  return (
    <>
      <header
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
          animation: 'float-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div>
          <h1
            className="text-[19px] font-bold leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            {meta.title}
          </h1>
          <div
            className="flex items-center gap-1.5 text-[11px] mt-0.5"
            style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
          >
            <Calendar size={11} />
            <span>{meta.subtitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showAddBtn && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[100px] text-[13px] font-semibold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FF7056, #3BE8D0)',
                color: '#111',
                boxShadow: '0 4px 18px rgba(255,112,86,0.38)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden md:block">Добавить</span>
            </button>
          )}
        </div>
      </header>

      {showModal && (
        <AddTransactionModal
          categories={categories}
          accounts={accounts}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
