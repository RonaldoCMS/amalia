'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 700)
    const hideTimer = setTimeout(() => setVisible(false), 1100)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{ transition: 'opacity 400ms ease' }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Icon */}
      <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-6">
        <span className="text-5xl font-extrabold text-zinc-950 leading-none select-none">A</span>
      </div>

      {/* Name */}
      <span className="text-3xl font-bold text-zinc-100 tracking-tight">amalia</span>

      {/* Tagline */}
      <span className="text-sm text-zinc-500 mt-2 tracking-wide">La tua maestra di codice</span>

      {/* Loader dot */}
      <span className="mt-10 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
    </div>
  )
}
