'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DuelLeaderboardEntry } from '@amelia/shared'
import { DuelService } from '../../../services/duel.service'
import { NotificationBell } from '../../components/NotificationBell'
import { Footer } from '../../components/Footer'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function Avatar({ url, name, px = 32 }: { url: string | null; name: string; px?: number }) {
  const s = `${px}px`
  if (url) return <img src={`${BACKEND_URL}${url}`} alt={name} style={{ width: s, height: s }} className="rounded-full object-cover border-2 border-zinc-700" />
  return (
    <div style={{ width: s, height: s }} className="rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold">
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<DuelLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const svc = new DuelService()
    svc.getLeaderboard()
      .then(setEntries)
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-grid relative flex flex-col">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-amber-500/3 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/duel" className="font-mono text-sm font-semibold text-zinc-100 hover:text-cyan-400 transition-colors">
            amalia<span className="text-cyan-400">_</span>
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/duel" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">sfida ⚔️</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-amber-400 font-mono">classifica 🏆</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/duel" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono hidden sm:inline">
            ← sfida
          </Link>
          <NotificationBell />
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 flex-1 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 font-mono mb-2">
            Classifica <span className="text-amber-400">Sfide</span>
          </h1>
          <p className="text-sm text-zinc-500">I migliori developer in modalità 1v1</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-sm text-zinc-500 font-mono animate-pulse">Caricamento<span className="animate-blink">_</span></p>
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-4 py-16 text-center">
            <p className="text-sm text-zinc-600 font-mono">Nessuna sfida completata ancora.</p>
            <Link href="/duel" className="mt-4 inline-block text-xs text-cyan-400 font-mono hover:text-cyan-300 transition-colors">
              Sii il primo → sfida qualcuno
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_4.5rem_4.5rem_4.5rem_5rem] gap-2 px-4 py-3 border-b border-zinc-800 text-[10px] font-mono text-zinc-600 uppercase tracking-wider bg-zinc-900/60">
              <span>#</span>
              <span>Giocatore</span>
              <span className="text-center">Vittorie</span>
              <span className="text-center">Sconfitte</span>
              <span className="text-center">Win%</span>
              <span className="text-center">Punti tot.</span>
            </div>

            {entries.map(entry => (
              <div
                key={entry.userId}
                className={`grid grid-cols-[2.5rem_1fr_4.5rem_4.5rem_4.5rem_5rem] gap-2 items-center px-4 py-3 border-b border-zinc-900/60 last:border-0 transition-colors hover:bg-zinc-900/30 ${entry.rank <= 3 ? 'bg-amber-400/[0.02]' : ''}`}
              >
                {/* Rank */}
                <span className={`text-sm font-mono font-bold ${
                  entry.rank === 1 ? 'text-amber-400' :
                  entry.rank === 2 ? 'text-zinc-300' :
                  entry.rank === 3 ? 'text-amber-700' :
                  'text-zinc-600'
                }`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                </span>

                {/* Player */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar url={entry.profilePhotoUrl} name={entry.username} px={28} />
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-zinc-200 truncate">{entry.username}</p>
                    <p className="text-[10px] text-zinc-600 font-mono">{entry.totalDuels} sfide</p>
                  </div>
                </div>

                <span className="text-sm font-mono text-emerald-400 font-bold text-center">{entry.wins}</span>
                <span className="text-sm font-mono text-red-400 text-center">{entry.losses}</span>
                <span className={`text-sm font-mono font-bold text-center ${entry.winRate >= 60 ? 'text-cyan-400' : entry.winRate >= 40 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {entry.winRate}%
                </span>
                <span className="text-sm font-mono text-zinc-300 text-center">{entry.totalScore.toLocaleString('it-IT')}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
