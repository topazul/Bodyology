import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, TrendingUp, Trophy, Calendar } from 'lucide-react'

export default async function CoachClientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: relationships } = await supabase
    .from('coach_clients')
    .select(`
      *,
      client:users!coach_clients_client_id_fkey(id, full_name, email)
    `)
    .eq('coach_id', user!.id)
    .eq('active', true)

  const clients = relationships ?? []

  const stats = [
    { label: 'Active clients',  value: clients.length,  icon: Users,      color: 'text-teal-600' },
    { label: 'Avg program week',value: clients.length ? Math.round(clients.reduce((a,c) => a + c.program_week, 0) / clients.length) : 0, icon: Calendar, color: 'text-purple-500' },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium">Clients</h1>
          <p className="text-xs text-gray-400 mt-0.5">{clients.length} active athletes</p>
        </div>
        <Link href="/dashboard/coach/clients/invite" className="btn-primary">
          + Add client
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} aria-hidden="true" />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            <div className="text-2xl font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {clients.length === 0 ? (
        <div className="card p-10 text-center">
          <Users size={32} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-400">No clients yet.</p>
          <p className="text-xs text-gray-300 mt-1">Share your invite link to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clients.map(rel => {
            const initials = (rel.client?.full_name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <Link
                key={rel.id}
                href={`/dashboard/coach/program/${rel.client_id}`}
                className="card p-4 hover:border-teal-200 transition-colors block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-xs font-medium text-teal-800 flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{rel.client?.full_name}</div>
                    <div className="text-xs text-gray-400">{rel.goal ?? 'No goal set'} · Wk {rel.program_week}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Focus',    value: rel.focus_type ?? '—' },
                    { label: 'Intensity',value: `${rel.intensity_min}–${rel.intensity_max}%` },
                    { label: 'Week',     value: `Wk ${rel.program_week}` },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-gray-700">{s.value}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
