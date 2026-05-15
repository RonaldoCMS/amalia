'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const COOKIE_CONSENT_KEY = 'cookie-consent'

type CookieConsent = 'accepted' | 'rejected' | 'partial' | null

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieBanner() {
  const t = useTranslations('Cookies')
  const pathname = usePathname()
  const [consent, setConsent] = useState<CookieConsent>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setConsent(parsed.consent)
        } catch {
          // Invalid stored value, show banner
        }
      }
    }
  }, [])

  const saveConsent = (consentType: CookieConsent, prefs?: CookiePreferences) => {
    const data = {
      consent: consentType,
      preferences: prefs || preferences,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data))
    setConsent(consentType)
  }

  const handleAcceptAll = () => {
    saveConsent('accepted', {
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  const handleRejectAll = () => {
    saveConsent('rejected', {
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  const handleSavePreferences = () => {
    saveConsent('partial', preferences)
  }

  // Don't show banner if consent was already given
  if (consent !== null) return null

  // Only show on login page
  if (pathname !== '/login') return null

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center pointer-events-none">
      {/* Overlay (optional, for better visibility) */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto" />

      {/* Banner */}
      <div className="relative pointer-events-auto max-w-4xl w-full mx-4 mb-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="p-6">
          {!showDetails ? (
            // Simple view
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍪</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-cyan-400 font-mono mb-2">
                    {t('title')}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {t('description')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors"
                >
                  {t('acceptAll')}
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors"
                >
                  {t('rejectAll')}
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-6 py-2.5 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold rounded-lg transition-colors border border-zinc-700"
                >
                  {t('customize')}
                </button>
              </div>
            </div>
          ) : (
            // Detailed view
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-cyan-400 font-mono">
                  {t('customizeTitle')}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Necessary cookies */}
                <div className="flex items-start justify-between gap-4 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">{t('necessaryTitle')}</span>
                      <span className="text-xs text-zinc-500 font-mono">{t('alwaysActive')}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{t('necessaryDesc')}</p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-11 h-6 bg-cyan-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-start justify-between gap-4 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-semibold text-zinc-200">{t('analyticsTitle')}</span>
                    <p className="text-xs text-zinc-400 mt-1">{t('analyticsDesc')}</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                      preferences.analytics ? 'bg-cyan-500 justify-end' : 'bg-zinc-600 justify-start'
                    }`}
                    aria-label="Toggle analytics"
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>

                {/* Marketing cookies */}
                <div className="flex items-start justify-between gap-4 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-semibold text-zinc-200">{t('marketingTitle')}</span>
                    <p className="text-xs text-zinc-400 mt-1">{t('marketingDesc')}</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                      preferences.marketing ? 'bg-cyan-500 justify-end' : 'bg-zinc-600 justify-start'
                    }`}
                    aria-label="Toggle marketing"
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors"
                >
                  {t('savePreferences')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors"
                >
                  {t('acceptAll')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
