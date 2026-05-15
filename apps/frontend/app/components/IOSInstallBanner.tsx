'use client'

import { useEffect, useState } from 'react'
import { isIOSSafariNotPWA } from '@/lib/ios-pwa'

const DISMISSED_KEY = 'ios-install-banner-dismissed'

export function IOSInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIOSSafariNotPWA()) return
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return
    setShow(true)
  }, [])

  if (!show) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 px-4 pb-safe">
      <div className="mb-4 rounded-2xl bg-zinc-900 ring-1 ring-zinc-700 shadow-xl p-4 flex items-start gap-3">
        {/* App icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="Amelia" className="w-12 h-12 rounded-xl flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 leading-snug">
            Installa Amelia
          </p>
          <p className="mt-0.5 text-xs text-zinc-400 leading-snug">
            Tocca&nbsp;
            {/* Safari share icon */}
            <svg
              className="inline-block w-4 h-4 align-middle text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="condividi"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            &nbsp;poi &ldquo;<strong>Aggiungi alla schermata Home</strong>&rdquo; per ricevere le notifiche e usarla come app.
          </p>
        </div>

        <button
          onClick={dismiss}
          aria-label="Chiudi"
          className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 mt-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
