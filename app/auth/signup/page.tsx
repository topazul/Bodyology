'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'coach' | 'client'>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Create account</span>
      </div>
      <form onSubmit={handleSignup} className="p-5 flex flex-col gap-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" type="text" placeholder="Alex Morgan" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="label">I am a…</label>
          <div className="flex gap-2">
            {(['coach', 'client'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  role === r
                    ? 'bg-teal-400 text-white border-teal-400'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" className="btn-primary justify-center py-2 text-sm" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-xs text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
