'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCandidates } from '../../../../hooks/useJobs'
import { useAuthContext } from '../../../context/AuthContext'
import { Footer } from '../../../components/Footer'
import { JobCandidateItem } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function MatchBadge({ score }: { score: number }) {
  const color = score >= 70
    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    : score >= 40
    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
    : 'text-zinc-500 border-zinc-700 bg-zinc-900'
  return (
    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border whitespace-nowrap ${color}`}>
      {score}% match
    </span>
  )
}

function Avatar({ url, name, px = 40 }: { url?: string | null; name: string; px?: number }) {
  const style = { width: px, height: px, minWidth: px, minHeight: px }
  if (url) {
    return <img src={url} alt={name} style={style} className="rounded-full object-cover border border-zinc-700 shrink-0" />
  }
  return (
    <div style={style} className="rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold shrink-0">
      <span style={{ fontSize: px * 0.38 }}>{name[0]?.toUpperCase()}</span>
    </div>
  )
}

function CandidateCard({ c, selected, onToggle, t }: { c: JobCandidateItem; selected: boolean; onToggle: () => void; t: (key: string) => string }) {
  return (
    <div className={`border rounded-xl p-5 transition-colors cursor-pointer ${
      selected
        ? 'border-cyan-400/50 bg-cyan-400/5'
        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
    }`} onClick={onToggle}>
      <div className="flex items-center gap-3 mb-3">
        {/* Checkbox */}
        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
          selected ? 'border-cyan-400 bg-cyan-400/20' : 'border-zinc-700 bg-zinc-900'
        }`}>
          {selected && <span className="text-cyan-400 text-xs">✓</span>}
        </div>

        <Avatar url={c.profilePhotoUrl} name={c.username} px={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-zinc-100 font-mono truncate">{c.username}</p>
            <MatchBadge score={c.matchPercentage} />
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {c.yearsOfExperience} {t('yearsExp')}
          </p>
        </div>
      </div>

      {/* Matched skills */}
      {c.matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {c.matchedSkills.map(s => (
            <span key={s.name} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              s.verified
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
                : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-400'
            }`}>
              {s.name} {s.verified ? '✓' : ''} <span className="opacity-50">({s.level})</span>
            </span>
          ))}
        </div>
      )}

      {/* Missing skills */}
      {c.missingSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {c.missingSkills.map(s => (
            <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded border border-red-400/20 bg-red-400/5 text-red-400/60">
              ✗ {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CandidatesPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = use(params)
  const { isAuthenticated } = useAuthContext()
  const { candidates, isLoading, sendToDevs } = useCandidates(offerId)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const t = useTranslations('Jobs')

  if (!isAuthenticated) return null

  const toggleDev = (devId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(devId)) next.delete(devId)
      else next.add(devId)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === candidates.length) setSelected(new Set())
    else setSelected(new Set(candidates.map(c => c.developerId)))
  }

  const handleSend = async () => {
    if (selected.size === 0) return
    setSending(true)
    try {
      await sendToDevs(Array.from(selected))
      setSent(true)
      setSelected(new Set())
    } catch { /* ignore */ }
    finally { setSending(false) }
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0" />

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        <button onClick={() => router.push(`/jobs/${offerId}`)} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 mb-4 inline-block transition-colors">
          {t('backToOffer')}
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-zinc-100 font-mono">{t('candidatesTitle')}</h1>
          <span className="text-xs font-mono text-zinc-600">{candidates.length} {t('candidatesFound')}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm">{t('noCandidates')}</p>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={selectAll} className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                {selected.size === candidates.length ? t('deselectAll') : t('selectAll')}
              </button>
              {selected.size > 0 && (
                <span className="text-[11px] font-mono text-cyan-400">{selected.size} {t('selected')}</span>
              )}
            </div>

            {/* Success */}
            {sent && (
              <div className="text-xs font-mono p-3 rounded-lg border text-emerald-400 bg-emerald-400/5 border-emerald-400/20 mb-4">
                {t('offerSentSuccess')}
              </div>
            )}

            {/* List */}
            <div className="flex flex-col gap-3 mb-6">
              {candidates.map(c => (
                <CandidateCard key={c.developerId} c={c} selected={selected.has(c.developerId)} onToggle={() => toggleDev(c.developerId)} t={t} />
              ))}
            </div>

            {/* Send button */}
            {selected.size > 0 && (
              <div className="sticky bottom-20 sm:bottom-4 z-20">
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-3 rounded-xl text-sm font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors backdrop-blur"
                >
                  {sending ? t('sendingOffer') : `📤 ${t('sendOfferTo')} ${selected.size} ${t('developers')}`}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
