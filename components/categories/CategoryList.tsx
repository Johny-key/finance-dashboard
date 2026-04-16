'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { deleteCategory } from '@/app/actions/categories'
import CategoryForm from './CategoryForm'
import ConfirmModal from '@/components/ui/ConfirmModal'
import type { Category } from '@/types/database'
import { formatRub } from '@/lib/utils/currency'

/** Returns true only if the string starts with an actual emoji/symbol (non-ASCII). */
function isEmoji(s: string | null | undefined): s is string {
  return !!s && (s.codePointAt(0) ?? 0) > 127
}

interface Props {
  categories: Category[]
  txCounts: Record<string, number>
  monthSpend: Record<string, number>
}

export default function CategoryList({ categories, txCounts, monthSpend }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState<Category | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null)

  const handleDeleteClick = (cat: Category) => {
    setConfirmTarget(cat)
  }

  const handleDeleteConfirm = () => {
    if (!confirmTarget) return
    const cat = confirmTarget
    setConfirmTarget(null)
    startTransition(async () => {
      await deleteCategory(cat.id)
      router.refresh()
    })
  }

  const handleSuccess = () => {
    setEditing(null)
    setAdding(false)
    router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Add new */}
        <button
          onClick={() => setAdding(true)}
          className="rounded-2xl p-5 flex items-center gap-3 transition-colors group"
          style={{
            background: 'transparent',
            border: '1px dashed var(--border)',
            animation: 'float-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,112,86,0.08)', border: '1px solid rgba(255,112,86,0.2)' }}
          >
            <Plus size={18} style={{ color: '#FF7056' }} />
          </div>
          <span
            className="text-[13px] font-medium"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Новая категория
          </span>
        </button>

        {categories.map((cat, i) => {
          const count   = txCounts[cat.id] ?? 0
          const icon    = isEmoji(cat.icon) ? cat.icon : '🏷️'
          const spent   = monthSpend[cat.id] ?? 0
          const hasLimit = cat.monthly_limit != null
          const limit   = cat.monthly_limit ?? 0
          const pct     = hasLimit && limit > 0 ? (spent / limit) * 100 : 0
          const isOver  = hasLimit && spent > limit
          const isNear  = hasLimit && !isOver && pct >= 70

          return (
            <div
              key={cat.id}
              className="rounded-2xl p-5 group relative"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isOver ? 'rgba(255,112,86,0.4)' : 'var(--border)'}`,
                animation: `float-up 0.5s ${(i + 1) * 50}ms cubic-bezier(0.22,1,0.36,1) both`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                  style={{
                    background: `${cat.color}22`,
                    border: `1px solid ${cat.color}44`,
                  }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="text-[14px] font-semibold truncate"
                      style={{ color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {cat.name}
                    </div>
                    {isOver && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wider uppercase shrink-0"
                        style={{
                          background: 'rgba(255,112,86,0.15)',
                          border: '1px solid rgba(255,112,86,0.35)',
                          color: 'var(--expense)',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        Превышен
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
                  >
                    {count > 0
                      ? `${count} транзакц${count === 1 ? 'ия' : count < 5 ? 'ии' : 'ий'}`
                      : 'нет транзакций'}
                  </div>
                </div>
              </div>

              {/* Color strip */}
              <div className="h-0.5 rounded-full mb-2" style={{ background: `${cat.color}66` }} />

              {/* Budget progress */}
              {hasLimit && (
                <div className="mt-2 space-y-1.5">
                  {/* Progress bar — 4px, green < 70%, amber 70–100%, red > 100% */}
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: '4px', background: 'rgba(228,227,217,0.08)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: isOver ? '#FF7056' : isNear ? '#F5A623' : '#3BE8D0',
                      }}
                    />
                  </div>
                  {/* Spent / limit — single line */}
                  <div className="text-[10px] tabular-nums"
                    style={{
                      color: isOver ? 'var(--expense)' : isNear ? '#F5A623' : 'var(--text-muted)',
                      fontFamily: "'DM Mono', monospace",
                    }}>
                    {formatRub(spent)} / {formatRub(limit)}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(cat)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.07] transition-colors"
                >
                  <Pencil size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  disabled={pending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.07] transition-colors disabled:opacity-30"
                >
                  <Trash2 size={12} style={{ color: '#FF7056' }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {adding && (
        <CategoryForm onClose={() => setAdding(false)} onSuccess={handleSuccess} />
      )}
      {editing && (
        <CategoryForm category={editing} onClose={() => setEditing(null)} onSuccess={handleSuccess} />
      )}
      {confirmTarget && (() => {
        const count = txCounts[confirmTarget.id] ?? 0
        const msg = count > 0
          ? `У категории «${confirmTarget.name}» есть ${count} транзакц${count === 1 ? 'ия' : count < 5 ? 'ии' : 'ий'}. После удаления они останутся без категории. Удалить?`
          : `Удалить категорию «${confirmTarget.name}»?`
        return (
          <ConfirmModal
            message={msg}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setConfirmTarget(null)}
          />
        )
      })()}
    </>
  )
}
