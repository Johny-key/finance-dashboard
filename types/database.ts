export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Account {
  id: string
  user_id: string
  name: string
  balance: number
  icon: string | null
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  monthly_limit: number | null
  limit_updated_at: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  account_id: string | null
  type: TransactionType
  amount: number
  description: string | null
  date: string
  created_at: string
  categories?: Category | null
  accounts?: Account | null
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  month: string
  limit_amount: number
  created_at: string
  categories?: Category
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
