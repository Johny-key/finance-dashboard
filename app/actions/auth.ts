'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Заполните все поля' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Неверный email или пароль' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Подтвердите email перед входом' }
    }
    return { error: 'Ошибка входа. Попробуйте ещё раз' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Заполните все поля' }
  }

  if (password.length < 6) {
    return { error: 'Пароль должен быть не менее 6 символов' }
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      return { error: 'Пользователь с таким email уже существует' }
    }
    return { error: 'Ошибка регистрации. Попробуйте ещё раз' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
