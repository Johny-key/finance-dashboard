'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'
import { currentMonthStart } from '@/lib/utils/date'

export async function upsertBudget(
  _prevState: ActionResult<{ id: string }> | undefined,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const categoryId = formData.get('category_id') as string
  const limitStr = formData.get('limit_amount') as string
  const month = (formData.get('month') as string) || currentMonthStart()

  if (!categoryId) return { success: false, error: 'Выберите категорию' }

  const limitAmount = parseFloat(limitStr.replace(',', '.'))
  if (isNaN(limitAmount) || limitAmount <= 0) {
    return { success: false, error: 'Введите корректный лимит' }
  }

  // Ensure month is first day of month
  const monthDate = new Date(month)
  monthDate.setDate(1)
  const monthStr = monthDate.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: user.id,
        category_id: categoryId,
        month: monthStr,
        limit_amount: limitAmount,
      },
      { onConflict: 'user_id,category_id,month' }
    )
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/budget')
  return { success: true, data: { id: data.id } }
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Не авторизован' }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/budget')
  return { success: true, data: undefined }
}
