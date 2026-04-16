'use client'

import dynamic from 'next/dynamic'
import type { ChartMonth, CategorySpend } from '@/lib/utils/calculations'

// ssr: false is only allowed in Client Components
const SpendingAreaChart = dynamic(
  () => import('./SpendingAreaChart'),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl animate-pulse h-full"
        style={{ minHeight: 298, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      />
    ),
  }
)

const CategoryPieChart = dynamic(
  () => import('./CategoryPieChart'),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl animate-pulse h-full"
        style={{ minHeight: 298, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      />
    ),
  }
)

interface Props {
  chartData: ChartMonth[]
  categorySpend: CategorySpend[]
}

export default function DashboardCharts({ chartData, categorySpend }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <div
        className="xl:col-span-2"
        style={{ animation: 'float-up 0.5s 200ms cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <SpendingAreaChart data={chartData} />
      </div>
      <div style={{ animation: 'float-up 0.5s 280ms cubic-bezier(0.22,1,0.36,1) both' }}>
        <CategoryPieChart data={categorySpend} />
      </div>
    </div>
  )
}
