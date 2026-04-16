'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

export async function createCategory(
  _prevState: ActionResult<{ id: string }> | undefined,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const name  = (formData.get('name')  as string)?.trim()
  const color = (formData.get('color') as string) || '#FF7056'
  const icon  = (formData.get('icon')  as string)?.trim() || null

  if (!name) return { success: false, error: 'Введите название' }
  if (name.length > 50) return { success: false, error: 'Слишком длинное название' }

  const limitStr    = (formData.get('monthly_limit') as string)?.trim()
  const monthly_limit = limitStr ? parseFloat(limitStr.replace(',', '.')) : null
  if (monthly_limit !== null && (isNaN(monthly_limit) || monthly_limit <= 0)) {
    return { success: false, error: 'Некорректный лимит' }
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: user.id, name, color, icon, monthly_limit })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Такая категория уже существует' }
    return { success: false, error: error.message }
  }

  revalidatePath('/categories')
  revalidatePath('/budget')
  revalidatePath('/transactions')
  revalidatePath('/')
  return { success: true, data: { id: data.id } }
}

export async function updateCategory(
  id: string,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const name  = (formData.get('name')  as string)?.trim()
  const color = (formData.get('color') as string) || '#FF7056'
  const icon  = (formData.get('icon')  as string)?.trim() || null

  if (!name) return { success: false, error: 'Введите название' }

  const limitStr    = (formData.get('monthly_limit') as string)?.trim()
  const monthly_limit = limitStr ? parseFloat(limitStr.replace(',', '.')) : null
  if (monthly_limit !== null && (isNaN(monthly_limit) || monthly_limit <= 0)) {
    return { success: false, error: 'Некорректный лимит' }
  }

  // Check once-per-month restriction on limit change
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('categories')
    .select('monthly_limit, limit_updated_at')
    .eq('id', id)
    .single()

  let limit_updated_at: string | undefined = undefined

  if (existing) {
    const oldLimit = existing.monthly_limit == null ? null : Number(existing.monthly_limit)
    const newLimit = monthly_limit

    const isChanging = oldLimit !== newLimit && !(oldLimit === null && newLimit === null)
    if (isChanging && newLimit !== null) {
      // Already set this month?
      if (existing.limit_updated_at && existing.limit_updated_at >= firstOfMonth) {
        return { success: false, error: 'Лимит можно менять только 1 раз в месяц для дисциплины' }
      }
      limit_updated_at = today.toISOString().slice(0, 10)
    }
  }

  const updatePayload: Record<string, unknown> = { name, color, icon, monthly_limit }
  if (limit_updated_at) updatePayload.limit_updated_at = limit_updated_at

  const { error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/categories')
  revalidatePath('/budget')
  revalidatePath('/transactions')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/categories')
  revalidatePath('/budget')
  revalidatePath('/transactions')
  revalidatePath('/')
  return { success: true, data: undefined }
}
