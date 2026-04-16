import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CategoryList from '@/components/categories/CategoryList'
import { calcCategoryBudgetStatus } from '@/lib/utils/calculations'
import { currentMonthStart, currentMonthEnd } from '@/lib/utils/date'
import { formatRub } from '@/lib/utils/currency'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const monthStart = currentMonthStart()
  const monthEnd   = currentMonthEnd()

  const [{ data: categories }, { data: txCounts }, { data: monthTx }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('transactions')
      .select('category_id')
      .eq('user_id', user.id)
      .not('category_id', 'is', null),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd),
  ])

  // Build a map of category_id → count
  const countMap: Record<string, number> = {}
  for (const tx of txCounts ?? []) {
    if (tx.category_id) {
      countMap[tx.category_id] = (countMap[tx.category_id] ?? 0) + 1
    }
  }

  // Calculate spend per category for current month
  const monthSpend: Record<string, number> = {}
  for (const tx of monthTx ?? []) {
    if (tx.category_id && tx.type === 'expense') {
      monthSpend[tx.category_id] = (monthSpend[tx.category_id] ?? 0) + Number(tx.amount)
    }
  }

  // Budget summary
  const cats = categories ?? []
  const budgetStatuses = calcCategoryBudgetStatus(cats, monthTx ?? [])
  const overBudget = budgetStatuses.filter(b => b.isOver)
  const totalOver = overBudget.reduce((s, b) => s + (b.spent - b.limit), 0)

  return (
    <main className="flex-1 overflow-y-auto p-5 xl:p-6 space-y-4">
      <div
        className="text-[11px] tracking-widest uppercase"
        style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace",
          animation: 'float-up 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {cats.length} категор{
          cats.length === 1 ? 'ия' :
          cats.length < 5   ? 'ии' : 'ий'}
      </div>

      {/* Budget summary banner */}
      {overBudget.length > 0 && (
        <div
          className="rounded-2xl px-5 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255,112,86,0.08)',
            border: '1px solid rgba(255,112,86,0.25)',
            animation: 'float-up 0.5s 60ms cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <span className="text-[18px] shrink-0">⚠️</span>
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
            Превышено в{' '}
            <strong style={{ color: 'var(--expense)' }}>
              {overBudget.length} {overBudget.length === 1 ? 'категории' : overBudget.length < 5 ? 'категориях' : 'категориях'}
            </strong>
            {' '}на{' '}
            <strong style={{ color: 'var(--expense)' }}>
              {formatRub(totalOver)}
            </strong>
          </span>
        </div>
      )}

      <CategoryList categories={cats} txCounts={countMap} monthSpend={monthSpend} />
    </main>
  )
}
