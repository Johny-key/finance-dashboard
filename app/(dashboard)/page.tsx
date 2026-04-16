import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import BalanceCard from '@/components/dashboard/BalanceCard'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import {
  calcMonthStats,
  calcCategorySpend,
  calcMonthlyChart,
  calcCategoryBudgetStatus,
} from '@/lib/utils/calculations'
import { formatRub } from '@/lib/utils/currency'
import { currentMonthStart, currentMonthEnd, sixMonthsAgoStart, currentMonthLabel } from '@/lib/utils/date'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const monthStart = currentMonthStart()
  const monthEnd   = currentMonthEnd()
  const sixAgo     = sixMonthsAgoStart()
  const monthLabel = currentMonthLabel()

  const [
    { data: monthTx },
    { data: allTx },
    { data: categories },
    { data: accounts },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false }),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', sixAgo)
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at'),
  ])

  const txMonth = monthTx ?? []
  const txAll   = allTx   ?? []
  const cats    = categories ?? []
  const accs    = accounts ?? []

  const stats         = calcMonthStats(txMonth)
  const categorySpend = calcCategorySpend(txMonth, cats)
  const chartData     = calcMonthlyChart(txAll)
  const recent        = txMonth.slice(0, 10)

  // Budget alerts
  const budgetStatuses = calcCategoryBudgetStatus(cats, txMonth)
  const overCount = budgetStatuses.filter(b => b.isOver).length
  const totalOverAmount = budgetStatuses.filter(b => b.isOver).reduce((s, b) => s + (b.spent - b.limit), 0)

  return (
    <main className="flex-1 overflow-y-auto p-5 xl:p-6 space-y-4">

      {/* Month label */}
      <div
        className="text-[11px] tracking-widest uppercase"
        style={{
          color: 'var(--text-muted)',
          fontFamily: "'DM Mono', monospace",
          animation: 'float-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {monthLabel}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <BalanceCard
          label="Баланс"
          value={formatRub(stats.balance)}
          change={stats.income > 0 ? `${stats.savingsRate}% сбережений` : undefined}
          changeType={stats.balance >= 0 ? 'up' : 'down'}
          accounts={accs}
          delay={0}
        />
        <StatCard
          label="Доходы"
          value={formatRub(stats.income)}
          changeType="up"
          delay={60}
        />
        <StatCard
          label="Расходы"
          value={formatRub(stats.expense)}
          changeType="down"
          delay={120}
        />
        <StatCard
          label="Транзакций"
          value={String(txMonth.length)}
          subtitle="в этом месяце"
          changeType="neutral"
          delay={180}
        />
      </div>

      {/* Budget alerts */}
      {overCount > 0 && (
        <div
          className="rounded-2xl px-5 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255,112,86,0.08)',
            border: '1px solid rgba(255,112,86,0.25)',
            animation: 'float-up 0.5s 220ms cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--expense)', flexShrink: 0 }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
            Превышено в{' '}
            <strong style={{ color: 'var(--expense)' }}>
              {overCount} {overCount === 1 ? 'категории' : overCount < 5 ? 'категориях' : 'категориях'}
            </strong>
            {' '}на{' '}
            <strong style={{ color: 'var(--expense)' }}>
              {formatRub(totalOverAmount)}
            </strong>
          </span>
          <Link
            href="/categories"
            className="ml-auto text-[11px] px-2.5 py-1 rounded-lg shrink-0"
            style={{
              color: 'var(--coral)',
              background: 'rgba(255,112,86,0.1)',
              border: '1px solid rgba(255,112,86,0.2)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Подробнее →
          </Link>
        </div>
      )}

      {/* Charts — client component with ssr:false */}
      <DashboardCharts chartData={chartData} categorySpend={categorySpend} />

      {/* Recent transactions */}
      <RecentTransactions transactions={recent} categories={cats} />

    </main>
  )
}
