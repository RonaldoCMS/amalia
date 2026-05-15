'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLanguage } from '../../../i18n/LanguageProvider'
import { CvService } from '../../../services/cv.service'
import { CvSession, CvData, CvAmaliaStats } from '@amalia/shared'
import { Footer } from '../../components/Footer'

// Dynamic import: @react-pdf/renderer only works client-side (wrap both in one component)
// const PdfDownloadButton = dynamic(() => import('./PdfDownloadButton'), { ssr: false })

export default function PublicCvPage() {
  const { username } = useParams<{ username: string }>()
  const t = useTranslations('CV')
  const { locale } = useLanguage()
  const [session, setSession] = useState<CvSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    new CvService().getPublicByUsername(username as string, locale)
      .then(setSession)
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [username, locale])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !session?.cvData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <p className="text-zinc-500 font-mono text-sm">{t('cvNotFound')}</p>
        <Link href="/cv" className="text-violet-400 font-mono text-sm hover:underline">{t('backToGallery')}</Link>
      </div>
    )
  }

  const { cvData, amaliaStats } = session as { cvData: CvData; amaliaStats: CvAmaliaStats | null }
  const publicUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <>
      <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-violet-500/3 to-transparent pointer-events-none" />

        {/* Toolbar */}
        <div className="relative z-10 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cv" className="text-zinc-500 hover:text-zinc-300 font-mono text-xs transition">
              {t('backToGallery')}
            </Link>
            <span className="text-zinc-700">·</span>
            <span className="text-violet-400 font-mono text-xs">@{session.username}</span>
          </div>
          {/* PDF Download button — rendered only on client */}
          {/* {amaliaStats && (
            <Suspense fallback={
              <span className="text-xs font-mono text-zinc-600 px-4 py-2">{t('loadingPDF')}</span>
            }>
              <PdfDownloadButton
                username={session.username}
                cvData={cvData}
                amaliaStats={amaliaStats}
              />
            </Suspense>
          )} */}
        </div>

        {/* CV Content */}
        <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-8 flex-1 space-y-6">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="border border-zinc-800 rounded-2xl bg-zinc-900/40 overflow-hidden">
            {/* Colored top bar */}
            <div className="h-2 bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-mono text-zinc-100">{cvData.name}</h1>
                  <p className="text-violet-400 font-mono text-sm mt-0.5">{cvData.title}</p>
                  {cvData.bio && (
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed max-w-lg">{cvData.bio}</p>
                  )}

                  {/* Contact / links */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {cvData.email && (
                      <a href={`mailto:${cvData.email}`} className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition">
                        ✉ {cvData.email}
                      </a>
                    )}
                    {cvData.githubUrl && (
                      <a href={cvData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Verified badge */}
                <div className="shrink-0 text-right">
                  <div className="inline-flex flex-col items-center gap-1 border border-violet-400/30 bg-violet-400/10 rounded-xl px-3 py-2">
                    <span className="text-lg">✨</span>
                    <span className="text-[9px] font-mono text-violet-400 uppercase tracking-wider font-semibold">Verified by</span>
                    <span className="text-[11px] font-mono text-violet-400 font-bold">Amalia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Skills ────────────────────────────────────────────────── */}
          {cvData.skills.length > 0 && (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">{t('techSkills')}</h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map(skill => (
                  <div
                    key={skill.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono ${
                      skill.verified
                        ? 'border-violet-400/30 bg-violet-400/10 text-violet-300'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400'
                    }`}
                  >
                    {skill.verified && <span className="text-violet-400 text-[10px]">✓</span>}
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span className="text-[9px] opacity-60">· {skill.level}</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono text-zinc-600 mt-3">
                <span className="text-violet-400">✓</span> {t('verifiedBadge')}
              </p>
            </div>
          )}

          {/* ── Soft Skills ──────────────────────────────────────────── */}
          {cvData.softSkills && cvData.softSkills.length > 0 && (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">{t('softSkillsTitle')}</h2>
              <div className="flex flex-wrap gap-2">
                {cvData.softSkills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 text-xs font-mono text-cyan-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Education ────────────────────────────────────────────── */}
          {cvData.education && (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">{t('educationTitle')}</h2>
              <p className="text-sm text-zinc-300 font-mono">{cvData.education}</p>
            </div>
          )}

          {/* ── Projects ─────────────────────────────────────────────── */}
          {cvData.projects.length > 0 && (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">{t('projectsTitle')}</h2>
              <div className="space-y-4">
                {cvData.projects.map((proj, i) => (
                  <div key={i} className="pb-4 border-b border-zinc-800/60 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold font-mono text-zinc-100">{proj.name}</p>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{proj.description}</p>
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map(t => (
                          <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-500">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Experience ───────────────────────────────────────────── */}
          {cvData.experience.length > 0 && (
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-5">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">{t('experienceTitle')}</h2>
              <div className="space-y-4">
                {cvData.experience.map((exp, i) => (
                  <div key={i} className="pb-4 border-b border-zinc-800/60 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold font-mono text-zinc-100">{exp.title}</p>
                        <p className="text-xs font-mono text-zinc-500">{exp.company}</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 shrink-0">{exp.period}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Amalia Stats ──────────────────────────────────────────── */}
          {amaliaStats && (
            <div className="border border-violet-400/20 rounded-xl bg-violet-400/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">✨</span>
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-violet-400">{t('platformStats')}</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold font-mono text-cyan-400">{amaliaStats.challengesCompleted}</p>
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{t('statChallenges')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold font-mono text-emerald-400">{amaliaStats.accuracy}%</p>
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{t('statAccuracy')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold font-mono text-amber-400">{amaliaStats.totalScore}</p>
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{t('statPoints')}</p>
                </div>
              </div>

              {/* Top languages */}
              {amaliaStats.topLanguages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {amaliaStats.topLanguages.map(lang => (
                    <span key={lang} className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                      {lang}
                    </span>
                  ))}
                </div>
              )}

              {/* Badges */}
              {amaliaStats.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {amaliaStats.badges.map(badge => (
                    <span key={badge} className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-400">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Amalia signature ──────────────────────────────────────── */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-900/20 p-5 text-center">
            <p className="text-[10px] font-mono text-zinc-600">CV verificato e generato da</p>
            <p className="text-lg font-bold font-mono text-zinc-300 mt-1">
              amalia<span className="text-violet-400">_</span>
            </p>
            <p className="text-[10px] font-mono text-zinc-600 mt-1">
              {t('platformFooter')}
            </p>
            {publicUrl && (
              <p className="text-[10px] font-mono text-zinc-700 mt-2 break-all">
                {publicUrl}
              </p>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
