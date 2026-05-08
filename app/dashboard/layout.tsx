import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/shared/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login-flow/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'client'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} userName={profile?.full_name ?? ''} userId={user.id} />
      <main className="flex-1 min-w-0 p-5 lg:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
