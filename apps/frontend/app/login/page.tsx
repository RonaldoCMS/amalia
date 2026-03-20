'use client'

import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect } from 'react'

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const t = useTranslations('Login')
  const tCommon = useTranslations('Common')
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
          ← {tCommon('backToHome')}
        </Link>

        <div className="mb-8">
          <span className="font-mono text-lg font-semibold tracking-tight">
            amalia<span className="text-cyan-400">_</span>
          </span>
        </div>

        <h1 className="text-xl font-semibold text-zinc-100 mb-1">{t('title')}</h1>
        <p className="text-sm text-zinc-500 mb-8">{t('subtitle')}</p>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder={t('usernamePlaceholder')}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && username && password && handleSubmit()}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder={t('passwordPlaceholder')}
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
          {isLoading ? t('submitting') : t('submit')}
        </button>

        <p className="text-sm text-zinc-500 text-center mt-6">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            {t('register')}
          </Link>
        </p>
        

        {/* Social login */}

        <div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-200" />
  </div>
  <div className="relative flex justify-center text-xs text-gray-400">
    <span className="bg-white px-2">{tCommon('or')}</span>
  </div>
</div>

<a
  href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github`}
  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
  {t('githubLogin')}
</a>

      </div>
    </div>
  )
}