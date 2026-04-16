'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function createTransaction(
  _prevState: ActionResult<{ id: string }> | undefined,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const type = formData.get('type') as string

  // ── Transfer ─────────────────────────────────────────────
  if (type === 'transfer') {
    const fromAccountId = (formData.get('from_account_id') as string)?.trim()
    const toAccountId   = (formData.get('to_account_id')   as string)?.trim()
    const amountStr     = formData.get('amount') as string
    const description   = (formData.get('description') as string)?.trim() || 'Перевод'
    const date          = formData.get('date') as string

    if (!fromAccountId || !toAccountId) return { success: false, error: 'Выберите счета' }
    if (fromAccountId === toAccountId)   return { success: false, error: 'Нельзя переводить на тот же счёт' }
    if (!amountStr || !date)             return { success: false, error: 'Заполните обязательные поля' }

    const amount = parseFloat(amountStr.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Некорректная сумма' }

    // Create two linked transactions
    const { data: tx1, error: e1 } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, type: 'transfer', amount, account_id: fromAccountId, description, date })
      .select('id').single()

    if (e1) return { success: false, error: e1.message }

    const { error: e2 } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, type: 'transfer', amount, account_id: toAccountId, description, date })

    if (e2) return { success: false, error: e2.message }

    // Decrement source balance
    const { data: srcAcc } = await supabase.from('accounts').select('balance').eq('id', fromAccountId).single()
    if (srcAcc) await supabase.from('accounts').update({ balance: Number(srcAcc.balance) - amount }).eq('id', fromAccountId)

    // Increment dest balance
    const { data: dstAcc } = await supabase.from('accounts').select('balance').eq('id', toAccountId).single()
    if (dstAcc) await supabase.from('accounts').update({ balance: Number(dstAcc.balance) + amount }).eq('id', toAccountId)

    revalidatePath('/')
    revalidatePath('/transactions')
    return { success: true, data: { id: tx1.id } }
  }

  // ── Regular income/expense ────────────────────────────────
  const amountStr  = formData.get('amount') as string
  const categoryId = (formData.get('category_id') as string) || null
  const accountId  = (formData.get('account_id')  as string) || null
  const description = (formData.get('description') as string)?.trim() || null
  const date        = formData.get('date') as string

  if (!type || !amountStr || !date) return { success: false, error: 'Заполните обязательные поля' }
  if (type !== 'income' && type !== 'expense') return { success: false, error: 'Неверный тип' }

  const amount = parseFloat(amountStr.replace(',', '.'))
  if (isNaN(amount) || amount <= 0) return { success: false, error: 'Некорректная сумма' }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type,
      amount,
      category_id: categoryId || null,
      account_id:  accountId  || null,
      description: description || null,
      date,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  // Update account balance if account is specified
  if (accountId) {
    const { data: acc } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single()
    if (acc) {
      const newBalance = type === 'income'
        ? Number(acc.balance) + amount
        : Number(acc.balance) - amount
      await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId)
    }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true, data: { id: data.id } }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  // Fetch transaction before deleting (to reverse balance)
  const { data: tx } = await supabase
    .from('transactions')
    .select('type, amount, account_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  // Reverse account balance if applicable (skip transfers — both sides tracked separately)
  if (tx && tx.account_id && tx.type !== 'transfer') {
    const { data: acc } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', tx.account_id)
      .single()
    if (acc) {
      const newBalance = tx.type === 'income'
        ? Number(acc.balance) - Number(tx.amount)
        : Number(acc.balance) + Number(tx.amount)
      await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.account_id)
    }
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true, data: undefined }
}
