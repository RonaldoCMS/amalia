'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '../context/AuthContext'
import { useMatch } from '../../hooks/useMatch'
import { MatchSuggestion, MatchItem } from '@amalia/shared'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'
import { NotificationBell } from '../components/NotificationBell'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

/** Avatar con dimensioni fisse via style inline — evita problemi con classi Tailwind dinamiche */
function Avatar({ url, name, px = 40 }: { url: string | null; name: string; px?: number }) {
  const style = { width: px, height: px, minWidth: px, minHeight: px }
  if (url) {
    return (
      <img
        src={`${BACKEND_URL}${url}`}
        alt={name}
        style={style}
        className="rounded-full object-cover border border-zinc-700 shrink-0"
      />
    )
  }
  return (
    <div
      style={style}
      className="rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold shrink-0"
      aria-label={name}
    >
      <span style={{ fontSize: px * 0.38 }}>{name[0].toUpperCase()}</span>
    </div>
  )
}

function CompatBadge({ score }: { score: number }) {
  const color = score >= 70
    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    : score >= 40
    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
    : 'text-zinc-500 border-zinc-700 bg-zinc-900'
  return (
    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border whitespace-nowrap ${color}`}>
      {score}% compat
    </span>
  )
}

function SuggestionCard({ s, onLike }: { s: MatchSuggestion; onLike: () => void }) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    setLoading(true)
    await onLike()
    setLiked(true)
    setLoading(false)
  }

  if (liked) return null

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5 flex flex-col gap-3">
      {/* Header: avatar + info + badge */}
      <div className="flex items-center gap-3">
        <Avatar url={s.profilePhotoUrl} name={s.username} px={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-zinc-100 font-mono truncate">{s.username}</p>
            <CompatBadge score={s.compatibilityScore} />
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {s.jobType}{s.yearsOfExperience ? ` · ${s.yearsOfExperience} yr exp` : ''}
          </p>
        </div>
      </div>

      {/* Linguaggi */}
      {s.languages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {s.languages.map(l => (
            <span key={l} className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Goals */}
      {s.goals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {s.goals.map(g => (
            <span key={g} className="text-[10px] font-mono px-2 py-0.5 rounded border border-violet-400/20 bg-violet-400/10 text-violet-400">
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {s.bio && (
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{s.bio}</p>
      )}

      {/* Footer: github + connect */}
      <div className="flex items-center gap-3 pt-1">
        {s.githubUrl && (
          <a
            href={s.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            GitHub ↗
          </a>
        )}
        <button
          onClick={handleLike}
          disabled={loading}
          className="ml-auto px-4 py-1.5 rounded-lg text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-40"
        >
          {loading ? '...' : '⚡ Connect'}
        </button>
      </div>
    </div>
  )
}

function MatchCard({ m, onRemove }: { m: MatchItem; onRemove: () => void }) {
  const [removing, setRemoving] = useState(false)
  const date = new Date(m.matchedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Rimuovere il match con ${m.username}?`)) return
    setRemoving(true)
    try { await onRemove() } finally { setRemoving(false) }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors">
      <Link href={`/chat/${m.matchId}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar url={m.profilePhotoUrl} name={m.username} px={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 font-mono truncate">{m.username}</p>
          <p className="text-xs text-zinc-600 font-mono">{date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CompatBadge score={m.compatibilityScore} />
          <span className="text-xs text-zinc-600 font-mono">chat →</span>
        </div>
      </Link>
      <button
        onClick={handleRemove}
        disabled={removing}
        className="shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
        title="Rimuovi match"
      >
        {removing ? '…' : '🗑'}
      </button>
    </div>
  )
}

export default function MatchPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const { suggestions, matches, isLoading, like, archiveMatch } = useMatch()
  const [tab, setTab] = useState<'discover' | 'matches'>('discover')

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const tabBtn = (t: typeof tab) =>
    `text-xs font-mono px-4 py-1.5 rounded-lg border transition-colors ${
      tab === t
        ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
        : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300'
    }`

  return (
    <div className="min-h-screen bg-grid relative flex flex-col">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/challenge" className="font-mono text-sm font-semibold text-zinc-100 hover:text-cyan-400 transition-colors">
            amalia<span className="text-cyan-400">_</span>
          </Link>
          <span className="text-zinc-700 hidden sm:inline">/</span>
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline">dev match</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <NotificationBell />
          <Link href="/challenge" className="text-zinc-500 hover:text-zinc-300 transition-colors">challenge</Link>
          <Link href="/profile" className="text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:inline">profile</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-zinc-100 font-mono">
            <span className="text-cyan-400">{'>'}</span> dev match
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Trova developer con i tuoi stessi obiettivi.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button className={tabBtn('discover')} onClick={() => setTab('discover')}>
            discover {suggestions.length > 0 && `(${suggestions.length})`}
          </button>
          <button className={tabBtn('matches')} onClick={() => setTab('matches')}>
            matches {matches.length > 0 && `(${matches.length})`}
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-zinc-500 font-mono">
            <span className="text-cyan-400">$</span> loading<span className="animate-blink">_</span>
          </div>
        ) : tab === 'discover' ? (
          suggestions.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl font-mono text-sm text-zinc-600">
              Nessun developer disponibile al momento. Torna più tardi!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {suggestions.map(s => (
                <SuggestionCard key={s.userId} s={s} onLike={() => like(s.userId)} />
              ))}
            </div>
          )
        ) : (
          matches.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl font-mono text-sm text-zinc-600">
              Nessun match ancora. Esplora i developer e connettiti!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map(m => (
                <MatchCard key={m.matchId} m={m} onRemove={() => archiveMatch(m.matchId)} />
              ))}
            </div>
          )
        )}
      </main>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
        <AdBanner format="horizontal" />
      </div>

      <Footer />
    </div>
  )
}
