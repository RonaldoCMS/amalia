'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useMyOffers, useReceivedOffers } from '../../hooks/useJobs'
import { useAuthContext } from '../context/AuthContext'
import { Footer } from '../components/Footer'
import { JobOfferItem, JobApplicationItem, JobOfferStatus } from '@amalia/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

/* ── status badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    expired: 'text-zinc-500 border-zinc-700 bg-zinc-900',
    closed: 'text-red-400 border-red-400/30 bg-red-400/10',
    sent: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    viewed: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    replied: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    ignored: 'text-zinc-500 border-zinc-700 bg-zinc-900',
  }
  return (
    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border whitespace-nowrap ${map[status] ?? map.sent}`}>
      {status}
    </span>
  )
}

/* ── match badge ── */
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

/* ── single offer card (my offers) ── */
function OfferCard({ offer, t }: { offer: JobOfferItem; t: (key: string) => string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/jobs/${offer.id}`)}
      className="w-full text-left border border-zinc-800 rounded-xl bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-zinc-100 font-mono truncate">{offer.title}</h3>
        <StatusBadge status={offer.status} />
      </div>
      <p className="text-xs text-zinc-500 font-mono line-clamp-2 mb-3">{offer.description}</p>
      <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-zinc-600">
        {offer.sector && <span>📁 {offer.sector}</span>}
        {offer.contractType && <span>📄 {offer.contractType}</span>}
        {offer.workMode && <span>🏠 {offer.workMode}</span>}
        {offer.location && <span>📍 {offer.location}</span>}
        {(offer.salaryMin || offer.salaryMax) && (
          <span>💰 {offer.salaryMin ?? '?'}–{offer.salaryMax ?? '?'}k</span>
        )}
        <span className="ml-auto text-zinc-600">👥 {offer.applicationsCount ?? 0} {t('submissions')}</span>
      </div>
    </button>
  )
}

/* ── single received application card ── */
function ReceivedCard({ app, t }: { app: JobApplicationItem; t: (key: string) => string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/jobs/chat/${app.id}`)}
      className="w-full text-left border border-zinc-800 rounded-xl bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-zinc-100 font-mono truncate">{app.offerTitle}</h3>
        <div className="flex items-center gap-2">
          <MatchBadge score={app.matchPercentage} />
          <StatusBadge status={app.status} />
        </div>
      </div>
      <p className="text-xs text-zinc-500 font-mono mb-2">
        {t('from')} <span className="text-zinc-400">{app.recruiterUsername}</span>
      </p>
      <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-zinc-600">
        {app.contractType && <span>📄 {app.contractType}</span>}
        {app.workMode && <span>🏠 {app.workMode}</span>}
        {app.location && <span>📍 {app.location}</span>}
      </div>
    </button>
  )
}

/* ── Main Page ── */
export default function JobsPage() {
  const { isAuthenticated } = useAuthContext()
  const t = useTranslations('Jobs')
  const [tab, setTab] = useState<'mine' | 'received'>('mine')
  const { offers, isLoading: loadingMine } = useMyOffers()
  const { offers: received, isLoading: loadingReceived } = useReceivedOffers()
  const router = useRouter()

  if (!isAuthenticated) return null

  const isLoading = tab === 'mine' ? loadingMine : loadingReceived

  return (
    <div className="min-h-screen bg-grid flex flex-col relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0" />

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-zinc-100 font-mono">{t('title')}</h1>
          <button
            onClick={() => router.push('/jobs/create')}
            className="text-xs font-mono px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors"
          >
            {t('createOffer')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('mine')}
            className={`text-xs font-mono px-4 py-2 rounded-lg border transition-colors ${
              tab === 'mine'
                ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t('tabMyOffers')}
          </button>
          <button
            onClick={() => setTab('received')}
            className={`text-xs font-mono px-4 py-2 rounded-lg border transition-colors ${
              tab === 'received'
                ? 'border-violet-400/50 bg-violet-400/15 text-violet-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t('tabReceived')}
            {received.length > 0 && (
              <span className="ml-2 text-[10px] bg-violet-400/20 text-violet-400 px-1.5 py-0.5 rounded-full">{received.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : tab === 'mine' ? (
          offers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-600 font-mono text-sm mb-4">{t('emptyMyOffers')}</p>
              <button
                onClick={() => router.push('/jobs/create')}
                className="text-xs font-mono px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                {t('emptyMyOffersAction')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {offers.map(o => <OfferCard key={o.id} offer={o} t={t} />)}
            </div>
          )
        ) : received.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm">{t('emptyReceived')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {received.map(a => <ReceivedCard key={a.id} app={a} t={t} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
