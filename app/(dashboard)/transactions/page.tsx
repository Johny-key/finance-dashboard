import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionPagination from '@/components/transactions/TransactionPagination'

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{
    type?: string
    category?: string
    search?: string
    from?: string
    to?: string
    page?: string
  }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params       = await searchParams
  const typeFilter   = params.type     ?? ''
  const catFilter    = params.category ?? ''
  const searchFilter = params.search   ?? ''
  const fromFilter   = params.from     ?? ''
  const toFilter     = params.to       ?? ''
  const page         = Math.max(1, parseInt(params.page ?? '1', 10))
  const rangeFrom    = (page - 1) * PAGE_SIZE
  const rangeTo      = rangeFrom + PAGE_SIZE - 1

  const [{ data: allTx, count }, { data: categories }] = await Promise.all([
    (async () => {
      let q = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo)

      if (typeFilter === 'income' || typeFilter === 'expense')
        q = q.eq('type', typeFilter)
      if (catFilter)
        q = q.eq('category_id', catFilter)
      if (searchFilter)
        q = q.ilike('description', `%${searchFilter}%`)
      if (fromFilter)
        q = q.gte('date', fromFilter)
      if (toFilter)
        q = q.lte('date', toFilter)

      return q
    })(),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
  ])

  const transactions = allTx ?? []
  const cats         = categories ?? []
  const total        = count ?? 0
  const totalPages   = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="flex-1 overflow-y-auto p-5 xl:p-6 space-y-4">
      {/* Filters + count */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div
          className="text-[11px] tracking-widest uppercase pt-2"
          style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
        >
          {total} транзакц{total === 1 ? 'ия' : total < 5 ? 'ии' : 'ий'}
        </div>
        <Suspense fallback={null}>
          <TransactionFilters categories={cats} />
        </Suspense>
      </div>

      <TransactionList transactions={transactions} categories={cats} />

      {totalPages > 1 && (
        <Suspense fallback={null}>
          <TransactionPagination page={page} totalPages={totalPages} />
        </Suspense>
      )}
    </main>
  )
}
