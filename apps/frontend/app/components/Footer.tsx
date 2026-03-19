'use client'

import Link from 'next/link'

export function Footer() {
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
              Piattaforma di sfide di programmazione generate dall&apos;AI. Allena le tue skill, connettiti con altri developer.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Navigazione</h4>
            <ul className="space-y-1.5">
              <li><Link href="/feed" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">feed</Link></li>
              <li><Link href="/cv" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">myCV</Link></li>
              <li><Link href="/challenge" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">challenge</Link></li>
              <li><Link href="/match" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">dev match</Link></li>
              <li><Link href="/profile" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">profilo</Link></li>
              <li><Link href="/history" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono">storico</Link></li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Creato da</h4>
            <p className="text-xs text-zinc-400 font-mono">Fabio Danubbio</p>
            <p className="text-xs text-zinc-600 mt-1">Full Stack Developer — Nola, Napoli</p>
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
            © {new Date().getFullYear()} amalia — built for developers · powered by ai
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
