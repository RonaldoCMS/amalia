'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('Footer')
  return (
    <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/50 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {/* Brand */}
          <div>
            <span className="font-mono text-sm font-semibold text-zinc-100">
              amalia<span className="text-cyan-400">_</span>
            </span>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-xs">
              {t('description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">{t('navigation')}</h4>
            <ul className="space-y-1.5">
              <li><Link href="/feed" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('feed')}</Link></li>
              <li><Link href="/cv" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('myCV')}</Link></li>
              <li><Link href="/challenge" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('challenge')}</Link></li>
              <li><Link href="/match" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('devMatch')}</Link></li>
              <li><Link href="/jobs" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('jobBoard')}</Link></li>
              <li><Link href="/profile" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('profile')}</Link></li>
              <li><Link href="/history" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">{t('history')}</Link></li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">{t('createdBy')}</h4>
            <p className="text-xs text-zinc-400 font-mono">Fabio Danubbio</p>
            <p className="text-xs text-zinc-600 mt-1">{t('creatorRole')}</p>
            <a
              href="https://www.danubbio.it"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors"
            >
              danubbio.it ↗
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-zinc-700 font-mono">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.danubbio.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
            >
              www.danubbio.it
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
