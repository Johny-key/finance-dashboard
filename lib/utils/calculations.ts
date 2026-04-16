import type { Transaction, Category, Budget } from '@/types/database'

export interface MonthStats {
  income: number
  expense: number
  balance: number
  savingsRate: number
}

export function calcMonthStats(transactions: Transaction[]): MonthStats {
  const filtered = transactions.filter(t => t.type === 'income' || t.type === 'expense')
  const income  = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = income - expense
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0
  return { income, expense, balance, savingsRate }
}

export interface CategorySpend {
  category: Category
  spent: number
  pct: number
}

export function calcCategorySpend(
  transactions: Transaction[],
  categories: Category[]
): CategorySpend[] {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const byCategory: Record<string, number> = {}
  expenses.forEach(t => {
    if (t.category_id) byCategory[t.category_id] = (byCategory[t.category_id] || 0) + Number(t.amount)
  })
  return categories
    .filter(c => byCategory[c.id] > 0)
    .map(c => ({
      category: c,
      spent: byCategory[c.id] || 0,
      pct: total > 0 ? ((byCategory[c.id] || 0) / total) * 100 : 0,
    }))
    .sort((a, b) => b.spent - a.spent)
}

export interface BudgetStatus {
  budget: Budget
  spent: number
  pct: number
  isOver: boolean
  isNear: boolean
}

export function calcBudgetStatus(
  budgets: Budget[],
  transactions: Transaction[]
): BudgetStatus[] {
  return budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category_id === b.category_id)
      .reduce((s, t) => s + Number(t.amount), 0)
    const pct = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0
    return { budget: b, spent, pct, isOver: pct > 100, isNear: pct > 80 && pct <= 100 }
  }).sort((a, b) => b.pct - a.pct)
}

export interface CategoryBudgetStatus {
  category: Category
  spent: number
  limit: number
  pct: number
  isOver: boolean
  isNear: boolean
}

export function calcCategoryBudgetStatus(
  categories: Category[],
  transactions: Transaction[]
): CategoryBudgetStatus[] {
  const expenses = transactions.filter(t => t.type === 'expense')
  const spendMap: Record<string, number> = {}
  expenses.forEach(t => {
    if (t.category_id) spendMap[t.category_id] = (spendMap[t.category_id] || 0) + Number(t.amount)
  })
  return categories
    .filter(c => c.monthly_limit != null)
    .map(c => {
      const spent = spendMap[c.id] || 0
      const limit = c.monthly_limit!
      const pct = limit > 0 ? (spent / limit) * 100 : 0
      return { category: c, spent, limit, pct, isOver: pct > 100, isNear: pct > 80 && pct <= 100 }
    })
    .sort((a, b) => b.pct - a.pct)
}

export interface ChartMonth {
  month: string
  income: number
  expense: number
}

export function calcMonthlyChart(transactions: Transaction[]): ChartMonth[] {
  const months: Record<string, { income: number; expense: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    months[key] = { income: 0, expense: 0 }
  }
  transactions
    .filter(t => t.type === 'income' || t.type === 'expense')
    .forEach(t => {
      const key = t.date.slice(0, 7)
      if (months[key]) {
        if (t.type === 'income') months[key].income += Number(t.amount)
        else months[key].expense += Number(t.amount)
      }
    })
  const MONTH_NAMES: Record<string, string> = {
    '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр',
    '05': 'Май', '06': 'Июн', '07': 'Июл', '08': 'Авг',
    '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек',
  }
  return Object.entries(months).map(([key, vals]) => ({
    month: MONTH_NAMES[key.slice(5, 7)] ?? key.slice(5, 7),
    ...vals,
  }))
}
