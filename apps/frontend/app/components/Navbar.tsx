'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageProvider'
import { SUPPORTED_LOCALES, LOCALE_FLAGS, LOCALE_LABELS } from '../../i18n/config'
import { NotificationBell } from './NotificationBell'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  match: (path: string) => boolean
}

const items: NavItem[] = [
  {
    href: '/feed',
    label: 'feed',
    match: p => p === '/feed',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'search',
    match: p => p === '/search',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    href: '/challenge',
    label: 'challenge',
    match: p => p.startsWith('/challenge'),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    href: '/duel',
    label: 'duel',
    match: p => p.startsWith('/duel'),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3l4.5 4.5m0 0l3 3m-3-3l-1.5 6 6-1.5m0 0l3 3m0 0l4.5 4.5M20.25 3l-4.5 4.5m0 0l-3 3m3-3l1.5 6-6-1.5m0 0l-3 3m0 0L3.75 20.25" />
      </svg>
    ),
  },
  {
    href: '/match',
    label: 'chat',
    match: p => p.startsWith('/match') || p.startsWith('/chat'),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'profile',
    match: p => p === '/profile',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    href: '/jobs',
    label: 'jobs',
    match: p => p.startsWith('/jobs'),
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.073a2.072 2.072 0 01-2.072 2.072H5.823a2.072 2.072 0 01-2.073-2.072V14.15M12 3.75v10.5m0-10.5l3 3m-3-3l-3 3M3.75 14.15h16.5" />
      </svg>
    ),
  },
]

// Items shown on the mobile bottom bar (max 5 for clean display)
const mobileItems = items.filter(i => i.href !== '/duel')

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthContext()
  const { locale, setLocale } = useLanguage()
  const t = useTranslations('Nav')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!isAuthenticated) return null

  const handleLogout = () => { logout(); router.push('/') }

  // Pages where we hide the top navbar (they have their own)
  const hideTopBar = pathname.startsWith('/chat/') || pathname.startsWith('/jobs/chat/')

  return (
    <>
      {/* ── Desktop top bar ── */}
      {!hideTopBar && (
        <nav className="hidden sm:block relative z-30 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Brand */}
            <Link href="/feed" className="font-mono text-sm font-semibold text-zinc-100 hover:text-cyan-400 transition-colors">
              amalia<span className="text-cyan-400">_</span>
            </Link>

            {/* Center links */}
            <div className="flex items-center gap-5 font-mono text-xs">
              {items.map(item => {
                const active = item.match(pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors ${active ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {t(item.label)}
                  </Link>
                )
              })}
              <Link
                href="/duel/leaderboard"
                className={`transition-colors ${pathname === '/duel/leaderboard' ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-400'}`}
              >
                🏆 {t('leaderboard')}
              </Link>
              <Link
                href="/cv"
                className={`transition-colors ${pathname.startsWith('/cv') ? 'text-violet-400' : 'text-zinc-500 hover:text-violet-400'}`}
              >
                ✨ {t('myCV')}
              </Link>
              <Link
                href="/jobs"
                className={`transition-colors ${pathname.startsWith('/jobs') ? 'text-cyan-400' : 'text-zinc-500 hover:text-cyan-400'}`}
              >
                💼 {t('jobBoard')}
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(o => !o)}
                  className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Language"
                >
                  {LOCALE_FLAGS[locale]}
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-8 w-40 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 py-1">
                    {SUPPORTED_LOCALES.map(l => (
                      <button
                        key={l}
                        onClick={() => { setLocale(l); setLangOpen(false) }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center gap-2 ${
                          l === locale ? 'text-cyan-400 bg-cyan-400/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        <span>{LOCALE_FLAGS[l]}</span>
                        <span>{LOCALE_LABELS[l]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* ── Mobile bottom bar — 5 voci icone-only ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur safe-bottom">
        <div className="flex items-center justify-around h-16">
          {mobileItems.map(item => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  active ? 'text-cyan-400' : 'text-zinc-500'
                }`}
              >
                <span className="[&>svg]:w-6 [&>svg]:h-6">{item.icon}</span>
                <span className={`text-[9px] font-mono ${active ? 'text-cyan-400' : 'text-zinc-600'}`}>{t(item.label)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
