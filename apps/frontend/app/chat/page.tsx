'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useMatch } from '../../hooks/useMatch'
import { useLanguage } from '../../i18n/LanguageProvider'
import { LOCALE_DATE_MAP } from '../../i18n/config'
import { MatchItem } from '@amalia/shared'

function Avatar({ url, name, px = 44 }: { url: string | null; name: string; px?: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover border border-zinc-700 shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: px, height: px, fontSize: px * 0.38 }}
      className="rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold shrink-0"
    >
      {name[0].toUpperCase()}
    </div>
  )
}

function CompatBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
      : score >= 40
      ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
      : 'text-zinc-500 border-zinc-700 bg-zinc-900'
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${color}`}>
      {score}% compat
    </span>
  )
}

function ChatRow({ m, onRemove }: { m: MatchItem; onRemove: () => void }) {
  const { locale } = useLanguage()
  const t = useTranslations('Match')
  const date = new Date(m.matchedAt).toLocaleDateString(
    LOCALE_DATE_MAP[locale] ?? 'it-IT',
    { day: '2-digit', month: 'short' },
  )

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(t('confirmRemove', { username: m.username }))) return
    await onRemove()
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors group">
      <Link href={`/chat/${m.matchId}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar url={m.profilePhotoUrl} name={m.username} px={44} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 font-mono truncate">{m.username}</p>
          <p className="text-xs text-zinc-600 font-mono">{date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CompatBadge score={m.compatibilityScore} />
          <span className="text-xs text-zinc-600 font-mono group-hover:text-zinc-400 transition-colors">→</span>
        </div>
      </Link>
      <button
        onClick={handleRemove}
        className="shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        title="Rimuovi match"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>
    </div>
  )
}

export default function ChatListPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const { matches, isLoading, archiveMatch } = useMatch()

  const sorted = useMemo(
    () => [...matches].sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()),
    [matches],
  )

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-20 sm:pb-6">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 font-mono">
              <span className="text-cyan-400">{'>'}</span> chat
            </h1>
            {!isLoading && (
              <p className="text-xs text-zinc-600 font-mono mt-0.5">
                {sorted.length} conversazione{sorted.length !== 1 ? 'i' : ''}
              </p>
            )}
          </div>
          <Link
            href="/match"
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            discover
          </Link>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-zinc-500 font-mono">
            <span className="text-cyan-400">$</span> loading
            <span className="animate-blink">_</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-5 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-3xl select-none">💬</p>
            <p className="text-sm text-zinc-600 font-mono text-center">
              Nessun match ancora.<br />Inizia a swipare!
            </p>
            <Link
              href="/match"
              className="text-xs font-mono px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            >
              scopri developer →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map(m => (
              <ChatRow key={m.matchId} m={m} onRemove={() => archiveMatch(m.matchId)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
