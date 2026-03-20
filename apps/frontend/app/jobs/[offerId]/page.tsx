'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useOfferDetail } from '../../../hooks/useJobs'
import { useAuthContext } from '../../context/AuthContext'
import { Footer } from '../../components/Footer'
import { JobService } from '../../../services/job.service'
import { JobHardSkillReq } from '@amalia/shared'

export default function OfferDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = use(params)
  const { isAuthenticated } = useAuthContext()
  const { offer, isLoading } = useOfferDetail(offerId)
  const router = useRouter()

  if (!isAuthenticated) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <p className="text-zinc-600 font-mono text-sm">offerta non trovata</p>
      </div>
    )
  }

  const statusColor: Record<string, string> = {
    active: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    expired: 'text-zinc-500 border-zinc-700 bg-zinc-900',
    closed: 'text-red-400 border-red-400/30 bg-red-400/10',
  }

  const handleClose = async () => {
    if (!confirm('Vuoi chiudere questa offerta?')) return
    try {
      const svc = new JobService()
      await svc.closeOffer(offerId)
      router.refresh()
      window.location.reload()
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0" />

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        <button onClick={() => router.push('/jobs')} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 mb-4 inline-block transition-colors">
          ← torna alla job board
        </button>

        {/* Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-lg font-semibold text-zinc-100 font-mono">{offer.title}</h1>
          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border whitespace-nowrap ${statusColor[offer.status] ?? statusColor.active}`}>
            {offer.status}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5 text-xs font-mono text-zinc-500">
          {offer.sector && <span>📁 {offer.sector}</span>}
          {offer.contractType && <span>📄 {offer.contractType}</span>}
          {offer.workMode && <span>🏠 {offer.workMode}</span>}
          {offer.location && <span>📍 {offer.location}</span>}
          {(offer.salaryMin || offer.salaryMax) && <span>💰 {offer.salaryMin ?? '?'}–{offer.salaryMax ?? '?'}k</span>}
          <span>📅 {offer.yearsRequired} anni exp</span>
          <span>👥 {offer.applicationsCount} invii</span>
        </div>

        {/* Description */}
        <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/30 mb-5">
          <p className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">{offer.description}</p>
        </div>

        {/* Skills */}
        {offer.hardSkills.length > 0 && (
          <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/30 mb-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">hard skills</h3>
            <div className="flex flex-wrap gap-2">
              {offer.hardSkills.map((s: JobHardSkillReq) => (
                <span key={s.name} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                  {s.name} <span className="text-cyan-400/50">({s.minLevel})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {offer.softSkills && offer.softSkills.length > 0 && (
          <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/30 mb-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">soft skills</h3>
            <div className="flex flex-wrap gap-2">
              {offer.softSkills.map((s: string) => (
                <span key={s} className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-400">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Expiry */}
        <div className="text-[10px] font-mono text-zinc-600 mb-6">
          scadenza: {new Date(offer.expiresAt).toLocaleDateString('it-IT')}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {offer.status === 'active' && (
            <>
              <button
                onClick={() => router.push(`/jobs/${offerId}/candidates`)}
                className="flex-1 py-2.5 rounded-lg text-sm font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors"
              >
                🔍 trova candidati
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg text-sm font-mono border border-red-400/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-colors"
              >
                chiudi offerta
              </button>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
