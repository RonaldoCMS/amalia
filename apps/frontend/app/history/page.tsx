'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useHistory } from '../../hooks/useHistory'
import { useStats } from '../../hooks/useStats'
import { ChallengeHistoryItem, ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amalia/shared'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'
import { useLanguage } from '../../i18n/LanguageProvider'
import { LOCALE_DATE_MAP } from '../../i18n/config'

const levelColors: Record<ChallengeLevel, string> = {
  [ChallengeLevel.Beginner]: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  [ChallengeLevel.Intermediate]: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  [ChallengeLevel.Hard]: 'text-red-400 border-red-400/30 bg-red-400/10',
}

const typeColors: Record<ChallengeType, string> = {
  [ChallengeType.Fill]: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
  [ChallengeType.Quiz]: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  [ChallengeType.Bug]: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  [ChallengeType.Write]: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
}

type FilterType = 'all' | ChallengeType
type FilterLevel = 'all' | ChallengeLevel
type FilterLang = 'all' | ChallengeLanguage

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  )
}

function HistoryRow({ item, locale }: { item: ChallengeHistoryItem; locale: string }) {
  const date = new Date(item.createdAt).toLocaleDateString(LOCALE_DATE_MAP[locale as keyof typeof LOCALE_DATE_MAP] || 'it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="flex items-start gap-4 px-4 py-3 border border-zinc-800 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors">
      <div className="mt-0.5 shrink-0">
        {item.correct === true && (
          <span className="text-emerald-400 font-mono text-sm font-bold">✓</span>
        )}
        {item.correct === false && (
          <span className="text-red-400 font-mono text-sm font-bold">✗</span>
        )}
        {item.correct === null && (
          <span className="text-zinc-600 font-mono text-sm">—</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 font-mono truncate">{item.challenge.title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.challenge.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge label={item.challenge.language} className="text-cyan-400 border-cyan-400/30 bg-cyan-400/10" />
          <Badge label={item.challenge.level} className={levelColors[item.challenge.level]} />
          <Badge label={item.challenge.type} className={typeColors[item.challenge.type]} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="font-mono text-sm font-bold text-cyan-400">
          {item.score !== null ? `+${item.score}` : '—'}
        </div>
        <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">{date}</div>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()
  const { history, isLoading } = useHistory()
  const { stats } = useStats()
  const t = useTranslations('History')
  const { locale } = useLanguage()

  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [levelFilter, setLevelFilter] = useState<FilterLevel>('all')
  const [langFilter, setLangFilter] = useState<FilterLang>('all')

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const filtered = useMemo(() => {
    return history.filter(item => {
      if (typeFilter !== 'all' && item.challenge.type !== typeFilter) return false
      if (levelFilter !== 'all' && item.challenge.level !== levelFilter) return false
      if (langFilter !== 'all' && item.challenge.language !== langFilter) return false
      return true
    })
  }, [history, typeFilter, levelFilter, langFilter])

  const filterBtn = (active: boolean) =>
    `text-[10px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
      active
        ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
        : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
    }`

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-zinc-100 font-mono">
            <span className="text-cyan-400">{'>'}</span> challenge history
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{t('count', { count: history.length })}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-1.5">
            <button className={filterBtn(typeFilter === 'all')} onClick={() => setTypeFilter('all')}>{t('filterAllTypes')}</button>
            {Object.values(ChallengeType).map(t => (
              <button key={t} className={filterBtn(typeFilter === t)} onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className={filterBtn(levelFilter === 'all')} onClick={() => setLevelFilter('all')}>{t('filterAllLevels')}</button>
            {Object.values(ChallengeLevel).map(l => (
              <button key={l} className={filterBtn(levelFilter === l)} onClick={() => setLevelFilter(l)}>{l}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className={filterBtn(langFilter === 'all')} onClick={() => setLangFilter('all')}>{t('filterAllLangs')}</button>
            {Object.values(ChallengeLanguage).map(l => (
              <button key={l} className={filterBtn(langFilter === l)} onClick={() => setLangFilter(l)}>{l}</button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-sm text-zinc-500 font-mono py-12 text-center">
            <span className="text-cyan-400">$</span> loading history<span className="animate-blink">_</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-zinc-600 font-mono py-12 text-center border border-dashed border-zinc-800 rounded-lg">
            {history.length === 0 ? t('emptyDefault') : t('emptyFiltered')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(item => (
              <HistoryRow key={item.id} item={item} locale={locale} />
            ))}
          </div>
        )}
      </main>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
        <AdBanner format="horizontal" />
      </div>

      <Footer />
    </div>
  )
}
