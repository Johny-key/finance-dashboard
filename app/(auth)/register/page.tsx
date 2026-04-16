import RegisterForm from '@/components/auth/RegisterForm'
import { Flame } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,232,208,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-float-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #FF7056, #3BE8D0)',
              boxShadow: '0 0 32px rgba(255,112,86,0.35)',
            }}
          >
            <Flame size={22} className="text-white" />
          </div>
          <h1
            className="text-[22px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--text-primary)' }}
          >
            Финтрек
          </h1>
          <p
            className="text-[13px] mt-1"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Создайте аккаунт — это бесплатно
          </p>
        </div>

        <div
          className="rounded-2xl p-6 inner-highlight"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
