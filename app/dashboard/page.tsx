import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login-flow/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single()

  const role = profile?.role ?? user!.user_metadata?.role ?? 'client'

  if (role === 'coach') redirect('/dashboard/coach/clients')
  else redirect('/dashboard/client/today')
}