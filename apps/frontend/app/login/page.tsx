'use client'

import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { login, isLoading, error } = useAuthContext()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    await login({ username, password })
    router.push('/')
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-medium mb-2">Bentornato</h1>
      <p className="text-sm text-gray-500 mb-8">Accedi ad Amelia per continuare ad allenarti.</p>

      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isLoading || !username || !password}
        className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Accesso in corso...' : 'Accedi'}
      </button>

      <p className="text-sm text-gray-500 text-center mt-6">
        Non hai un account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">Registrati</Link>
      </p>
    </main>
  )
}