import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ToastContainer from '@/components/ui/Toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: categories }, { data: accounts }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at'),
  ])

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar userEmail={user.email ?? ''} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header categories={categories ?? []} accounts={accounts ?? []} />
        {children}
      </div>
      <ToastContainer />
    </div>
  )
}
