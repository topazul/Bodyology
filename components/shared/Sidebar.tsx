'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, CalendarDays, Star, Flame, Calendar, Trophy, Sparkles, LogOut, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: string
  userName: string
  userId: string
}

export default function Sidebar({ role, userName, userId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const coachLinks = [
    { href: '/dashboard/coach/clients',  label: 'Clients',          icon: Users },
    { href: '/dashboard/coach/profile',  label: 'My profile',       icon: Star },
    { href: '/dashboard/coach/ai',       label: 'Ask Bodyology',    icon: Sparkles, accent: true },
  ]

  const clientLinks = [
    { href: '/dashboard/client/today',   label: 'Today',            icon: Flame },
    { href: '/dashboard/client/week',    label: 'This week',        icon: Calendar },
    { href: '/dashboard/client/prs',     label: 'My PRs',           icon: Trophy },
    { href: '/dashboard/client/ai',      label: 'Ask Bodyology',    icon: Sparkles, accent: true },
  ]

  const links = role === 'coach' ? coachLinks : clientLinks

  return (
    <aside className="w-48 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-baseline gap-0">
          <span className="text-xl font-medium tracking-tight">Body</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mx-0.5 mb-0.5" />
          <span className="text-xl font-medium tracking-tight">logy</span>
        </div>
        <p className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">Your training partner</p>
      </div>

      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-[10px] font-medium text-teal-800 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">{userName}</div>
            <div className="text-[10px] text-gray-400 capitalize">{role}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 pt-2">
        <div className="px-3 pb-1">
          <p className="text-[9px] text-gray-400 tracking-widest uppercase px-1 py-1">
            {role === 'coach' ? 'Coaching' : 'My training'}
          </p>
        </div>
        {links.map(({ href, label, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'sidebar-item',
              pathname === href && 'active',
              accent && pathname !== href && 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
              accent && pathname === href && '!border-l-purple-400'
            )}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </Link>
        ))}

        {role === 'coach' && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-[9px] text-gray-400 tracking-widest uppercase px-1 py-1">Program builder</p>
            </div>
            <Link
              href="/dashboard/coach/program"
              className={cn('sidebar-item', pathname.startsWith('/dashboard/coach/program') && 'active')}
            >
              <CalendarDays size={14} aria-hidden="true" />
              Programs
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button onClick={signOut} className="sidebar-item w-full rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
          <LogOut size={13} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
