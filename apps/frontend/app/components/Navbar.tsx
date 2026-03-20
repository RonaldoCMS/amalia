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
  labelKey: string
  match: (path: string) => boolean
  icon: React.ReactNode
  accent: string
}

const navItems: NavItem[] = [
  {
    href: '/feed',
    labelKey: 'feed',
    match: p => p === '/feed',
    accent: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: '/search',
    labelKey: 'search',
    match: p => p === '/search',
    accent: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    href: '/challenge',
    labelKey: 'challenge',
    match: p => p.startsWith('/challenge'),
    accent: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    href: '/duel',
    labelKey: 'duel',
    match: p => p.startsWith('/duel') && p !== '/duel/leaderboard',
    accent: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3l4.5 4.5m0 0l3 3m-3-3l-1.5 6 6-1.5m0 0l3 3m0 0l4.5 4.5M20.25 3l-4.5 4.5m0 0l-3 3m3-3l1.5 6-6-1.5m0 0l-3 3m0 0L3.75 20.25" />
      </svg>
    ),
  },
  {
    href: '/duel/leaderboard',
    labelKey: 'leaderboard',
    match: p => p === '/duel/leaderboard',
    accent: 'text-amber-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    href: '/match',
    labelKey: 'match',
    match: p => p === '/match',
    accent: 'text-pink-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    href: '/chat',
    labelKey: 'chat',
    match: p => p.startsWith('/chat'),
    accent: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    ),
  },
  {
    href: '/cv',
    labelKey: 'myCV',
    match: p => p.startsWith('/cv'),
    accent: 'text-violet-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    href: '/jobs',
    labelKey: 'jobs',
    match: p => p.startsWith('/jobs'),
    accent: 'text-emerald-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.073a2.072 2.072 0 01-2.072 2.072H5.823a2.072 2.072 0 01-2.073-2.072V14.15M12 3.75v10.5m0-10.5l3 3m-3-3l-3 3M3.75 14.15h16.5" />
      </svg>
    ),
  },
  {
    href: '/profile',
    labelKey: 'profile',
    match: p => p === '/profile',
    accent: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

const drawerGroups = [
  { label: 'explore', items: ['feed', 'search'] },
  { label: 'play', items: ['challenge', 'duel', 'leaderboard', 'match', 'chat'] },
  { label: 'career', items: ['myCV', 'jobs'] },
  { label: 'account', items: ['profile'] },
]

// Mobile bottom bar: 4 pinned items + menu button
const mobilePinnedKeys = ['feed', 'match', 'chat', 'profile']

const itemsByKey = Object.fromEntries(navItems.map(i => [i.labelKey, i]))

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthContext()
  const { locale, setLocale } = useLanguage()
  const t = useTranslations('Nav')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  if (!isAuthenticated) return null

  const handleLogout = () => { logout(); router.push('/') }

  const hideTopBar = pathname.startsWith('/chat/') || pathname.startsWith('/jobs/chat/')
  const mobilePinned = mobilePinnedKeys.map(k => itemsByKey[k]).filter(Boolean)

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-50 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform duration-200 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-800 shrink-0">
          <span className="font-mono text-sm font-semibold text-zinc-100">
            amalia<span className="text-cyan-400">_</span>
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {drawerGroups.map(group => (
            <div key={group.label} className="mb-4">
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
              {group.items.map(key => {
                const item = itemsByKey[key]
                if (!item) return null
                const active = item.match(pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs transition-colors mb-0.5 ${
                      active
                        ? `${item.accent} bg-white/5`
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <span className={active ? item.accent : 'text-zinc-600'}>{item.icon}</span>
                    {t(item.labelKey)}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer: language + logout */}
        <div className="border-t border-zinc-800 px-3 py-4 flex flex-col gap-1 shrink-0">
          {/* Language inline list */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              <span>{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_LABELS[locale]}</span>
              <svg className="w-3 h-3 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-0 w-full mb-1 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1">
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

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* ── Top bar (always slim) ── */}
      {!hideTopBar && (
        <nav className="relative z-30 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Brand — absolute center */}
            <Link
              href="/feed"
              className="absolute left-1/2 -translate-x-1/2 font-mono text-sm font-semibold text-zinc-100 hover:text-cyan-400 transition-colors"
            >
              amalia<span className="text-cyan-400">_</span>
            </Link>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
            </div>
          </div>
        </nav>
      )}

      {/* ── Mobile bottom bar ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur safe-bottom">
        <div className="flex items-center h-16">
          {mobilePinned.map(item => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  active ? item.accent : 'text-zinc-500'
                }`}
              >
                {item.icon}
                <span className="text-[9px] font-mono">{t(item.labelKey)}</span>
              </Link>
            )
          })}

          {/* Menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className="text-[9px] font-mono">menu</span>
          </button>
        </div>
      </nav>
    </>
  )
}
