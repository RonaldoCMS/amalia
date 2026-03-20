'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useMatch } from '../../hooks/useMatch'
import { MatchSuggestion } from '@amalia/shared'
import { Footer } from '../components/Footer'

const SWIPE_THRESHOLD = 80

function Avatar({ url, name, px = 80 }: { url: string | null; name: string; px?: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover border-2 border-zinc-700 shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: px, height: px, fontSize: px * 0.38 }}
      className="rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-300 font-mono font-bold shrink-0"
    >
      {name[0].toUpperCase()}
    </div>
  )
}

// ── Swipeable card ────────────────────────────────────────────────────────────

function TinderCard({
  suggestion,
  onLike,
  onPass,
}: {
  suggestion: MatchSuggestion
  onLike: () => void
  onPass: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const likeRef = useRef<HTMLDivElement>(null)
  const passRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ dragging: false, startX: 0, startY: 0, currentX: 0 })

  const exit = useCallback(
    (dir: 'left' | 'right') => {
      const el = cardRef.current
      if (!el) return
      el.style.transition = 'transform 0.28s ease, opacity 0.28s ease'
      el.style.transform =
        dir === 'right'
          ? 'translateX(120%) rotate(22deg)'
          : 'translateX(-120%) rotate(-22deg)'
      el.style.opacity = '0'
      setTimeout(() => (dir === 'right' ? onLike() : onPass()), 260)
    },
    [onLike, onPass],
  )

  const snapBack = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'transform 0.3s ease'
    el.style.transform = 'translateX(0) rotate(0deg)'
    if (likeRef.current) { likeRef.current.style.transition = 'opacity 0.2s'; likeRef.current.style.opacity = '0' }
    if (passRef.current) { passRef.current.style.transition = 'opacity 0.2s'; passRef.current.style.opacity = '0' }
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { dragging: true, startX: e.clientX, startY: e.clientY, currentX: 0 }
    const el = cardRef.current
    if (el) el.style.transition = 'none'
    if (likeRef.current) likeRef.current.style.transition = 'none'
    if (passRef.current) passRef.current.style.transition = 'none'
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.dragging) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    drag.current.currentX = dx
    const el = cardRef.current
    if (el) el.style.transform = `translateX(${dx}px) translateY(${dy * 0.05}px) rotate(${dx / 20}deg)`
    if (likeRef.current) likeRef.current.style.opacity = String(Math.min(Math.max(dx / 80, 0), 1))
    if (passRef.current) passRef.current.style.opacity = String(Math.min(Math.max(-dx / 80, 0), 1))
  }

  const handlePointerUp = () => {
    if (!drag.current.dragging) return
    drag.current.dragging = false
    if (drag.current.currentX > SWIPE_THRESHOLD) exit('right')
    else if (drag.current.currentX < -SWIPE_THRESHOLD) exit('left')
    else snapBack()
  }

  const s = suggestion
  const compatColor =
    s.compatibilityScore >= 70
      ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10'
      : s.compatibilityScore >= 40
      ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
      : 'text-zinc-500 border-zinc-700 bg-zinc-900'

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none', willChange: 'transform', zIndex: 10 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Like / Pass stamps */}
      <div
        ref={likeRef}
        className="absolute top-7 left-5 z-20 border-2 border-emerald-400 text-emerald-400 font-mono font-bold text-lg px-3 py-1 rounded-lg pointer-events-none"
        style={{ opacity: 0, rotate: '-12deg', transformOrigin: 'center' }}
      >
        LIKE ♥
      </div>
      <div
        ref={passRef}
        className="absolute top-7 right-5 z-20 border-2 border-red-400 text-red-400 font-mono font-bold text-lg px-3 py-1 rounded-lg pointer-events-none"
        style={{ opacity: 0, rotate: '12deg' }}
      >
        NOPE ✕
      </div>

      {/* Scrollable content */}
      <div className="h-full overflow-y-auto overscroll-contain">
        <div className="flex flex-col items-center pt-10 pb-4 px-6 gap-3">
          <Avatar url={s.profilePhotoUrl} name={s.username} px={96} />
          <div className="text-center mt-1">
            <h2 className="font-mono font-bold text-2xl text-zinc-100 leading-tight">{s.username}</h2>
            {s.jobType && (
              <p className="text-sm text-zinc-400 font-mono mt-0.5">
                {s.jobType}{s.yearsOfExperience ? ` · ${s.yearsOfExperience}` : ''}
              </p>
            )}
            <span className={`inline-block mt-2 text-xs font-mono font-semibold px-3 py-1 rounded-full border ${compatColor}`}>
              {s.compatibilityScore}% compat
            </span>
          </div>
        </div>

        <div className="px-6 pb-8 flex flex-col gap-5">
          {s.languages.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">languages</p>
              <div className="flex flex-wrap gap-1.5">
                {s.languages.map(l => (
                  <span key={l} className="text-xs font-mono px-2.5 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {s.goals.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">goals</p>
              <div className="flex flex-wrap gap-1.5">
                {s.goals.map(g => (
                  <span key={g} className="text-xs font-mono px-2.5 py-1 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-400">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {s.bio && (
            <div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">bio</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{s.bio}</p>
            </div>
          )}

          {s.githubUrl && (
            <a
              href={s.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Match celebration overlay ────────────────────────────────────────────────

function MatchOverlay({
  suggestion,
  matchId,
  onDismiss,
}: {
  suggestion: MatchSuggestion
  matchId: string
  onDismiss: () => void
}) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="flex flex-col items-center gap-5 text-center max-w-xs w-full">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-emerald-400/10 animate-ping" />
          <div className="w-24 h-24 rounded-full border-4 border-emerald-400 flex items-center justify-center text-4xl bg-zinc-950 relative z-10">
            ♥
          </div>
        </div>
        <div>
          <p className="text-2xl font-mono font-bold text-emerald-400">it's a match!</p>
          <p className="text-sm text-zinc-400 font-mono mt-1">tu e {suggestion.username} vi piacete a vicenda</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 font-mono text-sm hover:bg-zinc-900 transition-colors"
          >
            continua
          </button>
          <button
            onClick={() => router.push(`/chat/${matchId}`)}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 font-mono text-sm hover:bg-emerald-500/30 transition-colors"
          >
            chat →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MatchPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const { suggestions, isLoading, like } = useMatch()
  const [localSuggestions, setLocalSuggestions] = useState<MatchSuggestion[]>([])
  const [matchCelebration, setMatchCelebration] = useState<{ suggestion: MatchSuggestion; matchId: string } | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  // Initialize local list once data loads (only once)
  useEffect(() => {
    if (!isLoading && !initialized) {
      setLocalSuggestions(suggestions)
      setInitialized(true)
    }
  }, [isLoading, suggestions, initialized])

  if (!isAuthenticated) return null

  const handleLike = async () => {
    if (localSuggestions.length === 0) return
    const suggestion = localSuggestions[0]
    setLocalSuggestions(prev => prev.slice(1))
    try {
      const result = await like(suggestion.userId)
      if (result.matched && result.matchId) {
        setMatchCelebration({ suggestion, matchId: result.matchId })
      }
    } catch { /* ignore */ }
  }

  const handlePass = () => {
    setLocalSuggestions(prev => {
      if (prev.length <= 1) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })
  }

  const current = localSuggestions[0]

  return (
    <>
      {matchCelebration && (
        <MatchOverlay
          suggestion={matchCelebration.suggestion}
          matchId={matchCelebration.matchId}
          onDismiss={() => setMatchCelebration(null)}
        />
      )}

      <div className="min-h-screen bg-grid relative flex flex-col pb-20 sm:pb-6">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

        <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-6">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-lg font-semibold text-zinc-100 font-mono">
                  <span className="text-cyan-400">{'>'}</span> discover
                </h1>
                {!isLoading && initialized && localSuggestions.length > 0 && (
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">
                    {localSuggestions.length} developer{localSuggestions.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <Link
                href="/chat"
                className="text-xs font-mono px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
              >
                chat →
              </Link>
            </div>

            {isLoading || !initialized ? (
              <div className="h-[520px] flex items-center justify-center">
                <span className="text-sm font-mono text-zinc-500">
                  <span className="text-cyan-400">$</span> loading<span className="animate-blink">_</span>
                </span>
              </div>
            ) : localSuggestions.length === 0 ? (
              <div className="h-[520px] flex flex-col items-center justify-center gap-4 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-4xl select-none">🎉</p>
                <p className="text-sm text-zinc-500 font-mono text-center px-4">
                  Nessun developer disponibile.<br />Torna più tardi!
                </p>
              </div>
            ) : (
              <>
                {/* Card stack */}
                <div className="relative" style={{ height: 520 }}>
                  {/* Shadow cards */}
                  {localSuggestions.slice(1, 3).map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-800"
                      style={{
                        transform: `translateY(${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.04})`,
                        zIndex: -(i + 1),
                        opacity: 0.5,
                      }}
                    />
                  ))}

                  {/* Active card */}
                  <TinderCard
                    key={current.userId}
                    suggestion={current}
                    onLike={handleLike}
                    onPass={handlePass}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex justify-center items-center gap-10 mt-6">
                  <button
                    onClick={handlePass}
                    className="w-[60px] h-[60px] rounded-full border-2 border-red-400/40 bg-red-400/10 text-red-400 hover:bg-red-400/20 hover:border-red-400/70 transition-all flex items-center justify-center text-2xl shadow-lg active:scale-95"
                    aria-label="Pass"
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleLike}
                    className="w-[60px] h-[60px] rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 hover:border-emerald-400/70 transition-all flex items-center justify-center text-2xl shadow-lg active:scale-95"
                    aria-label="Like"
                  >
                    ♥
                  </button>
                </div>

                <p className="text-center text-[10px] font-mono text-zinc-700 mt-4">
                  trascina o usa i pulsanti · swipe right per connettere
                </p>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
