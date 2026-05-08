'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Sign in</span>
      </div>
      <form onSubmit={handleLogin} className="p-5 flex flex-col gap-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" 
          className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: loading ? '#6C63B6' : '#7F77DD' }}
          disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-xs text-center text-gray-400">
          No account?{' '}
        <Link href="/login-flow/signup" className="text-purple-400 hover:underline">Sign up</Link>        </p>
      </form>
    </div>
  )
}