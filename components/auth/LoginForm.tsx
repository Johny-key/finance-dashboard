'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'
import Link from 'next/link'

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-[12px] font-medium mb-1.5 tracking-wide"
          style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}
        >
          EMAIL
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(255,112,86,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-[12px] font-medium mb-1.5 tracking-wide"
          style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}
        >
          ПАРОЛЬ
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(255,112,86,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {state?.error && (
        <div
          className="px-4 py-3 rounded-xl text-[13px]"
          style={{
            background: 'rgba(255,112,86,0.10)',
            border: '1px solid rgba(255,112,86,0.30)',
            color: 'var(--coral)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-[100px] text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #FF7056, #3BE8D0)',
          color: '#111',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 4px 20px rgba(255,112,86,0.35)',
        }}
      >
        {pending ? 'Вход...' : 'Войти'}
      </button>

      <p
        className="text-center text-[13px]"
        style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
      >
        Нет аккаунта?{' '}
        <Link
          href="/register"
          className="transition-colors hover:opacity-80"
          style={{ color: 'var(--coral)' }}
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
