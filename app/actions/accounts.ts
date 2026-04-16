'use server'

import { revalidatePath, refresh } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function createAccount(
  _prevState: ActionResult<{ id: string }> | undefined,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const name = (formData.get('name') as string)?.trim()
  const balanceStr = formData.get('balance') as string
  const icon = (formData.get('icon') as string)?.trim() || null

  if (!name) return { success: false, error: 'Введите название счёта' }
  if (name.length > 50) return { success: false, error: 'Слишком длинное название' }

  const balance = parseFloat((balanceStr ?? '0').replace(',', '.'))
  if (isNaN(balance)) return { success: false, error: 'Некорректный баланс' }

  const { data, error } = await supabase
    .from('accounts')
    .insert({ user_id: user.id, name, balance, icon })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  // Invalidate the entire layout tree and immediately refresh the client router
  // so BalanceCard and Header receive fresh accounts without a separate client-side refresh.
  revalidatePath('/', 'layout')
  refresh()
  return { success: true, data: { id: data.id } }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  refresh()
  return { success: true, data: undefined }
}
