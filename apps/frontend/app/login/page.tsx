'use client'

import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) router.replace('/challenge')
  }, [isAuthenticated, router])

  const handleSubmit = async () => {
    try {
      await login({ username, password })
      router.push('/challenge')
    } catch {
      // error displayed from context
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grid relative">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-8">
          ← Torna alla home
        </Link>

        <div className="mb-8">
          <span className="font-mono text-lg font-semibold tracking-tight">
            amalia<span className="text-cyan-400">_</span>
          </span>
        </div>

        <h1 className="text-xl font-semibold text-zinc-100 mb-1">Bentornato</h1>
        <p className="text-sm text-zinc-500 mb-8">Accedi per continuare ad allenarti.</p>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="il_tuo_username"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && username && password && handleSubmit()}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-4 font-mono">✗ {error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || !username || !password}
          className="w-full py-2.5 rounded-lg bg-cyan-500 text-zinc-950 text-sm font-semibold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Accesso in corso...' : 'Accedi'}
        </button>

        <p className="text-sm text-zinc-500 text-center mt-6">
          Non hai un account?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}