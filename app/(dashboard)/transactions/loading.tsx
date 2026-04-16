export default function TransactionsLoading() {
  return (
    <main className="flex-1 overflow-y-auto p-5 xl:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
        <div className="flex gap-2">
          {[160, 120, 120, 100, 100].map((w, i) => (
            <div key={i} className="h-9 rounded-xl animate-pulse" style={{ width: w, background: 'var(--bg-card)' }} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse"
            style={{ height: 56, background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
        ))}
      </div>
    </main>
  )
}
