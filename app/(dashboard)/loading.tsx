export default function DashboardLoading() {
  return (
    <main className="flex-1 overflow-y-auto p-5 xl:p-6 space-y-4">
      {/* Month label */}
      <div className="h-3 w-28 rounded animate-pulse" style={{ background: 'var(--bg-elevated)' }} />

      {/* Stat cards */}
      <div className="stat-cards-grid">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: 100 }}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 rounded-2xl animate-pulse"
          style={{ height: 298, background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
        <div className="rounded-2xl animate-pulse"
          style={{ height: 298, background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl animate-pulse"
        style={{ height: 280, background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
    </main>
  )
}
