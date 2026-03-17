'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '../context/AuthContext'
import { useDuel } from '../../hooks/useDuel'
import { NotificationBell } from '../components/NotificationBell'
import { Footer } from '../components/Footer'
import { ChallengeType, DuelRoundResult, DuelLanguageQueueCount } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function Avatar({ url, name, px = 40 }: { url: string | null; name: string; px?: number }) {
  const s = `${px}px`
  if (url) return <img src={`${BACKEND_URL}${url}`} alt={name} style={{ width: s, height: s }} className="rounded-full object-cover border-2 border-zinc-700" />
  return (
    <div style={{ width: s, height: s }} className="rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold text-lg">
      {name[0]?.toUpperCase()}
    </div>
  )
}

function Timer({ secondsLeft, totalSeconds = 30 }: { secondsLeft: number; totalSeconds?: number }) {
  const pct = Math.max(0, (secondsLeft / totalSeconds) * 100)
  const color = secondsLeft <= 5 ? 'bg-red-500' : secondsLeft <= 10 ? 'bg-amber-500' : 'bg-cyan-500'
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const label = totalSeconds > 60 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secondsLeft}s`
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-linear`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono text-sm font-bold tabular-nums ${secondsLeft <= 5 ? 'text-red-400' : secondsLeft <= 10 ? 'text-amber-400' : 'text-cyan-400'}`}>
        {label}
      </span>
    </div>
  )
}

function RoundBadge({ type, level }: { type: string; level: string }) {
  const typeColor: Record<string, string> = {
    fill: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    quiz: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    bug: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    write: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  }
  const levelColor: Record<string, string> = {
    beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    hard: 'text-red-400 bg-red-400/10 border-red-400/30',
  }
  return (
    <div className="flex gap-1.5">
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${typeColor[type] ?? ''}`}>{type}</span>
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${levelColor[level] ?? ''}`}>{level}</span>
    </div>
  )
}

export default function DuelPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const { phase, duel, lastAnswer, error, banUntil, queueCounts, joinQueue, leaveQueue, submitAnswer, forfeit, reset } = useDuel()
  const [localTimer, setLocalTimer] = useState(30)
  const [userInput, setUserInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showRoundResult, setShowRoundResult] = useState(false)
  const [confirmForfeit, setConfirmForfeit] = useState(false)
  const prevRoundRef = useRef<number>(0)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  // Local countdown timer
  useEffect(() => {
    if (phase !== 'active' || !duel?.currentRound) return
    setLocalTimer(duel.currentRound.secondsLeft)
    const id = setInterval(() => setLocalTimer(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [phase, duel?.currentRound?.roundNumber, duel?.currentRound?.secondsLeft])

  // Reset input when round changes
  useEffect(() => {
    if (!duel) return
    const rn = duel.currentRoundNumber
    if (rn !== prevRoundRef.current && rn > prevRoundRef.current) {
      // Show round result briefly for the completed round
      if (prevRoundRef.current > 0 && duel.history.length > 0) {
        setShowRoundResult(true)
        setTimeout(() => setShowRoundResult(false), 2500)
      }
      prevRoundRef.current = rn
      setUserInput('')
      setSubmitted(false)
    }
  }, [duel?.currentRoundNumber, duel?.history.length])

  const handleSubmit = useCallback(async (answer?: string) => {
    const a = answer ?? userInput.trim()
    if (!a || submitted) return
    setSubmitted(true)
    await submitAnswer(a)
  }, [userInput, submitted, submitAnswer])

  if (!isAuthenticated) return null

  const LANGUAGES: { id: string; label: string; emoji: string }[] = [
    { id: 'javascript', label: 'JavaScript', emoji: '🟨' },
    { id: 'typescript', label: 'TypeScript', emoji: '🔷' },
    { id: 'python', label: 'Python', emoji: '🐍' },
    { id: 'java', label: 'Java', emoji: '☕' },
    { id: 'csharp', label: 'C#', emoji: '💜' },
    { id: 'cpp', label: 'C++', emoji: '⚙️' },
    { id: 'go', label: 'Go', emoji: '🐹' },
    { id: 'rust', label: 'Rust', emoji: '🦀' },
    { id: 'kotlin', label: 'Kotlin', emoji: '🟣' },
    { id: 'swift', label: 'Swift', emoji: '🍎' },
    { id: 'php', label: 'PHP', emoji: '🐘' },
    { id: 'ruby', label: 'Ruby', emoji: '💎' },
    { id: 'dart', label: 'Dart', emoji: '🎯' },
    { id: 'scala', label: 'Scala', emoji: '♾️' },
  ]

  const getCount = (lang: string) => {
    const entry = queueCounts.find(q => q.language?.toLowerCase() === lang.toLowerCase())
    return entry?.count ?? 0
  }

  // ── IDLE ───────────────────────────────────────────────────────────────
  const renderIdle = () => (
    <div className="flex flex-col py-8 sm:py-12 gap-10 px-4 sm:px-0">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl sm:text-6xl mb-4">⚔️</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 font-mono mb-2">
          Modalità <span className="text-cyan-400">Sfida</span>
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Scegli un linguaggio e affronta un avversario in tempo reale.
          24 round, 30 secondi ciascuno.
        </p>
      </div>

      {/* Language grid */}
      <div>
        <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
          Scegli il linguaggio — clicca per cercare un avversario
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {LANGUAGES.map(lang => {
            const count = getCount(lang.id)
            return (
              <button
                key={lang.id}
                onClick={() => joinQueue(lang.id)}
                disabled={!!banUntil && banUntil > new Date()}
                className="group relative flex flex-col items-start gap-1 p-3 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-800 disabled:hover:bg-zinc-900/30"
              >
                <span className="text-xl sm:text-2xl">{lang.emoji}</span>
                <span className="text-xs sm:text-sm font-mono font-medium text-zinc-200 group-hover:text-cyan-300 transition-colors">
                  {lang.label}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${count > 0 ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-zinc-600 bg-zinc-800/50 border border-zinc-700/30'}`}>
                  {count > 0 ? `${count} in coda` : 'nessuno'}
                </span>
              </button>
            )
          })}
          {/* Qualsiasi */}
          <button
            onClick={() => joinQueue()}
            disabled={!!banUntil && banUntil > new Date()}
            className="group relative flex flex-col items-start gap-1 p-3 sm:p-4 rounded-xl border border-zinc-700 bg-zinc-900/20 hover:border-zinc-500/60 hover:bg-zinc-800/40 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-700 disabled:hover:bg-zinc-900/20"
          >
            <span className="text-xl sm:text-2xl">🎲</span>
            <span className="text-xs sm:text-sm font-mono font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Qualsiasi
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-600 bg-zinc-800/50 border border-zinc-700/30">
              sceglieremo noi
            </span>
          </button>
        </div>
        {error && <p className="mt-4 text-xs text-red-400 font-mono">{error}</p>}
        {banUntil && banUntil > new Date() && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-400/5 border border-red-400/20 text-xs font-mono text-red-400 text-center">
            🚫 Ban attivo fino alle {banUntil.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            <br />
            <span className="text-zinc-500 mt-1 block">Hai abbandonato 3 sfide oggi. Riprova più tardi.</span>
          </div>
        )}
      </div>

      {/* Leaderboard link */}
      <div className="text-center pt-2 pb-4">
        <Link href="/duel/leaderboard" className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-amber-400 transition-colors border border-zinc-800 hover:border-amber-400/30 rounded-lg px-4 py-2">
          🏆 Classifica Sfide
        </Link>
      </div>
    </div>
  )

  // ── QUEUE ──────────────────────────────────────────────────────────────
  const renderQueue = () => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div className="text-4xl mb-6 animate-pulse">🔍</div>
      <h2 className="text-lg font-semibold text-zinc-100 font-mono mb-2">
        Cerco un avversario<span className="animate-blink">_</span>
      </h2>
      <p className="text-sm text-zinc-500 mb-8">In attesa che un altro player si unisca...</p>
      <div className="flex gap-8 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
      <button
        onClick={leaveQueue}
        className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
      >
        ← Annulla ricerca
      </button>
    </div>
  )

  // ── ACTIVE ─────────────────────────────────────────────────────────────
  const renderActive = () => {
    if (!duel || !duel.opponent) return null
    const round = duel.currentRound

    return (
      <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
        {/* Scoreboard */}
        <div className="flex items-center justify-between gap-4 px-4 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Avatar url={duel.me.profilePhotoUrl} name={duel.me.username} px={36} />
            <div className="min-w-0">
              <p className="text-xs text-zinc-400 font-mono truncate">{duel.me.username}</p>
              <p className="text-lg font-bold text-cyan-400 font-mono">{duel.me.totalScore}</p>
            </div>
          </div>

          <div className="text-center shrink-0">
            <div className="text-[10px] text-zinc-600 font-mono">
              {duel.isSuddenDeath ? '⚡ SUDDEN DEATH' : `Round ${duel.currentRoundNumber}/${duel.totalRounds}`}
            </div>
            <div className="text-xs text-zinc-500 font-mono">{duel.language}</div>
            {/* Forfeit button */}
            <div className="mt-1">
              {!confirmForfeit ? (
                <button
                  onClick={() => setConfirmForfeit(true)}
                  className="text-[10px] font-mono text-zinc-700 hover:text-red-400 transition-colors"
                >
                  🏳 abbandona
                </button>
              ) : (
                <div className="flex gap-1 justify-center">
                  <button onClick={forfeit} className="text-[10px] font-mono text-red-400 hover:text-red-300">
                    sì, esci
                  </button>
                  <span className="text-[10px] text-zinc-700">|</span>
                  <button onClick={() => setConfirmForfeit(false)} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300">
                    no
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="text-xs text-zinc-400 font-mono truncate">{duel.opponent.username}</p>
              <p className="text-lg font-bold text-red-400 font-mono">{duel.opponent.totalScore}</p>
            </div>
            <Avatar url={duel.opponent.profilePhotoUrl} name={duel.opponent.username} px={36} />
          </div>
        </div>

        {/* Round result overlay */}
        {showRoundResult && duel.history.length > 0 && (() => {
          const last = duel.history[duel.history.length - 1]
          return (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-center animate-slide-up">
              <div className="flex items-center justify-center gap-6 font-mono text-sm">
                <span className={last.myCorrect ? 'text-emerald-400' : 'text-red-400'}>
                  {last.myCorrect ? `✓ +${last.myScore}` : '✗ +0'}
                </span>
                <span className="text-zinc-600">vs</span>
                <span className={last.opponentCorrect ? 'text-emerald-400' : 'text-red-400'}>
                  {last.opponentCorrect ? `✓ +${last.opponentScore}` : '✗ +0'}
                </span>
              </div>
            </div>
          )
        })()}

        {/* Timer */}
        {round && !submitted && <Timer secondsLeft={localTimer} totalSeconds={duel?.currentRound?.totalSeconds} />}

        {/* Challenge */}
        {round && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
              <RoundBadge type={round.type} level={round.level} />
              {submitted && round.opponentAnswered && (
                <span className="text-[10px] text-zinc-600 font-mono">entrambi hanno risposto</span>
              )}
              {submitted && !round.opponentAnswered && (
                <span className="text-[10px] text-amber-400 font-mono animate-pulse">avversario sta rispondendo...</span>
              )}
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-zinc-100 font-mono mb-2">{round.challenge.title}</h3>
              <p className="text-xs text-zinc-400 mb-4">{round.challenge.description}</p>

              {round.challenge.code && (
                <pre className="bg-zinc-950 rounded-lg p-4 text-xs text-zinc-300 font-mono overflow-x-auto mb-4 border border-zinc-800 whitespace-pre-wrap">
                  {round.challenge.code}
                </pre>
              )}

              {/* Answer section */}
              {!submitted ? (
                <div>
                  {round.type === ChallengeType.Quiz && round.challenge.options.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {round.challenge.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(opt)}
                          disabled={localTimer <= 0}
                          className="text-left px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-200 font-mono hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all disabled:opacity-40"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder={
                          round.type === ChallengeType.Fill ? 'Inserisci il codice mancante...'
                            : round.type === ChallengeType.Bug ? 'Scrivi il codice corretto...'
                            : 'Scrivi la tua risposta...'
                        }
                        disabled={localTimer <= 0}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <button
                        onClick={() => handleSubmit()}
                        disabled={!userInput.trim() || localTimer <= 0}
                        className="px-4 py-2.5 rounded-lg text-sm font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-40 shrink-0"
                      >
                        Invia
                      </button>
                    </div>
                  )}
                  {localTimer <= 0 && (
                    <p className="text-xs text-red-400 font-mono mt-2">⏰ Tempo scaduto!</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  {lastAnswer ? (
                    <div>
                      <div className={`text-2xl mb-2 ${lastAnswer.correct ? '' : ''}`}>
                        {lastAnswer.correct ? '✓' : '✗'}
                      </div>
                      <p className={`text-sm font-mono font-bold ${lastAnswer.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                        {lastAnswer.correct ? `Corretto! +${lastAnswer.score}` : 'Sbagliato!'}
                      </p>
                      {!round.opponentAnswered && (
                        <p className="text-xs text-zinc-500 font-mono mt-3 animate-pulse">
                          In attesa dell&apos;avversario...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono animate-pulse">Invio in corso...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No current round but active = waiting for results */}
        {!round && duel.status === 'active' && (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 font-mono animate-pulse">Elaborazione risultati<span className="animate-blink">_</span></p>
          </div>
        )}
      </div>
    )
  }

  // ── COMPLETED ──────────────────────────────────────────────────────────
  const renderCompleted = () => {
    if (!duel || !duel.opponent) return null
    const isWinner = duel.winnerId === duel.me.id
    const isTie = !duel.winnerId

    return (
      <div className="flex flex-col items-center py-8 sm:py-12 px-4">
        <div className="text-5xl mb-4">{isWinner ? '🏆' : isTie ? '🤝' : '😤'}</div>
        <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mb-1">
          {isWinner ? 'Hai vinto!' : isTie ? 'Pareggio!' : 'Hai perso!'}
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          {isWinner
            ? 'Complimenti, ottimo lavoro!'
            : isTie
            ? 'Sfida equilibrata!'
            : 'La prossima volta andrà meglio!'}
        </p>

        {/* Score comparison */}
        <div className="flex items-center gap-6 sm:gap-10 mb-8">
          <div className="text-center">
            <Avatar url={duel.me.profilePhotoUrl} name={duel.me.username} px={48} />
            <p className="text-xs text-zinc-400 font-mono mt-2">{duel.me.username}</p>
            <p className="text-2xl font-bold text-cyan-400 font-mono">{duel.me.totalScore}</p>
          </div>
          <span className="text-xl text-zinc-600 font-mono">vs</span>
          <div className="text-center">
            <Avatar url={duel.opponent.profilePhotoUrl} name={duel.opponent.username} px={48} />
            <p className="text-xs text-zinc-400 font-mono mt-2">{duel.opponent.username}</p>
            <p className="text-2xl font-bold text-red-400 font-mono">{duel.opponent.totalScore}</p>
          </div>
        </div>

        {duel.isSuddenDeath && (
          <p className="text-xs text-amber-400 font-mono mb-4">⚡ Deciso al sudden death!</p>
        )}

        {/* Round history */}
        <div className="w-full max-w-lg mb-8">
          <h3 className="text-xs text-zinc-600 font-mono mb-3 uppercase tracking-wider">Dettaglio round</h3>
          <div className="flex flex-col gap-1">
            {duel.history.map((r: DuelRoundResult) => (
              <div key={r.roundNumber} className="flex items-center justify-between px-3 py-1.5 rounded bg-zinc-900/40 border border-zinc-800/50">
                <span className="text-[10px] text-zinc-600 font-mono w-8">#{r.roundNumber}</span>
                <RoundBadge type={r.type} level={r.level} />
                <div className="flex items-center gap-4 font-mono text-xs">
                  <span className={r.myCorrect ? 'text-emerald-400' : 'text-red-400'}>
                    {r.myCorrect ? `+${r.myScore}` : '✗'}
                  </span>
                  <span className="text-zinc-700">|</span>
                  <span className={r.opponentCorrect ? 'text-emerald-400' : 'text-red-400'}>
                    {r.opponentCorrect ? `+${r.opponentScore}` : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl text-sm font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition-all"
          >
            Nuova sfida
          </button>
          <Link href="/challenge" className="px-6 py-2.5 rounded-xl text-sm font-mono border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all">
            Torna alle challenge
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid relative flex flex-col">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/challenge" className="font-mono text-sm font-semibold text-zinc-100 hover:text-cyan-400 transition-colors">
            amalia<span className="text-cyan-400">_</span>
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-cyan-400 font-mono">sfida ⚔️</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/challenge" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono hidden sm:inline">
            challenge
          </Link>
          <Link href="/duel/leaderboard" className="text-xs text-zinc-500 hover:text-amber-400 transition-colors font-mono hidden sm:inline">
            🏆 classifica
          </Link>
          <NotificationBell />
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 flex-1">
        {phase === 'idle' && renderIdle()}
        {phase === 'queue' && renderQueue()}
        {phase === 'active' && renderActive()}
        {phase === 'completed' && renderCompleted()}
        {error && phase !== 'idle' && (
          <p className="text-center text-xs text-red-400 font-mono mt-4">{error}</p>
        )}
      </main>

      <Footer />
    </div>
  )
}
