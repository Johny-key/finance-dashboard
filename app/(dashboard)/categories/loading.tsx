export default function CategoriesLoading() {
  return (
    <main className="flex-1 overflow-y-auto p-5 xl:p-6 space-y-4">
      <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse"
            style={{ height: 108, background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
        ))}
      </div>
    </main>
  )
}
