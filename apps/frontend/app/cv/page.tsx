'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLanguage } from '../../i18n/LanguageProvider'
import { CvService } from '../../services/cv.service'
import { PublicCvItem } from '@amalia/shared'
import { Footer } from '../components/Footer'

export default function CvGalleryPage() {
  const t = useTranslations('CV')
  const { locale } = useLanguage()
  const [cvs, setCvs] = useState<PublicCvItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    new CvService().getGallery(locale)
      .then(setCvs)
      .catch(() => setCvs([]))
      .finally(() => setIsLoading(false))
  }, [locale])

  return (
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-mono text-zinc-100">
                myCV<span className="text-violet-400">_</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {t('galleryTitle')}
              </p>
            </div>
            <Link
              href="/cv/create"
              className="px-4 py-2 text-sm font-mono font-semibold rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-400 hover:bg-violet-400/20 transition"
            >
              {t('createCV')}
            </Link>
          </div>

          {/* Amalia badge explained */}
          <div className="mt-4 p-3 rounded-xl border border-violet-400/20 bg-violet-400/5 flex items-start gap-3">
            <span className="text-lg">✨</span>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              {t('galleryDescription')}{' '}
              <span className="text-violet-400">✓ Verified</span>
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && cvs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-600 font-mono text-sm">{t('galleryEmpty')}</p>
            <Link href="/cv/create" className="inline-block mt-4 text-sm font-mono text-violet-400 hover:underline">
              {t('galleryEmptyAction')}
            </Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cvs.map(cv => (
            <Link
              key={cv.id}
              href={`/cv/${cv.username}`}
              className="group block border border-zinc-800 rounded-xl bg-zinc-900/40 p-5 hover:border-violet-400/30 hover:bg-zinc-900/60 transition-all"
            >
              {/* Avatar placeholder + name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono font-bold text-base shrink-0">
                  {cv.username[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold font-mono text-zinc-100">@{cv.username}</p>
                  <p className="text-[11px] font-mono text-violet-400">{cv.title}</p>
                </div>
              </div>

              {/* Bio */}
              {cv.bio && (
                <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{cv.bio}</p>
              )}

              {/* Top skills */}
              {cv.topSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {cv.topSkills.map(skill => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Amalia stats row */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60">
                <div className="text-center">
                  <p className="text-xs font-bold font-mono text-cyan-400">{cv.amaliaStats.challengesCompleted}</p>
                  <p className="text-[9px] font-mono text-zinc-600">{t('challenges')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold font-mono text-emerald-400">{cv.amaliaStats.accuracy}%</p>
                  <p className="text-[9px] font-mono text-zinc-600">{t('accuracy')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold font-mono text-amber-400">{cv.amaliaStats.totalScore}</p>
                  <p className="text-[9px] font-mono text-zinc-600">{t('points')}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-mono text-violet-400 group-hover:underline">{t('viewCV')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
