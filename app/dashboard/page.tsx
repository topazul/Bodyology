import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Not logged in</h1>
        <p>Error: {error?.message ?? 'No user found'}</p>
        <Link href="/auth/login">Go to login</Link>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'client'

  if (role === 'coach') redirect('/dashboard/coach/clients')
  else redirect('/dashboard/client/today')
}