'use client'

import Link from 'next/link'
import { useAuthContext } from './context/AuthContext'
import { useRouter } from 'next/navigation'
import { Footer } from './components/Footer'
import { AdBanner } from './components/AdBanner'

const features = [
  { icon: '{ }', title: 'Fill the blank', desc: 'Completa il codice mancante nel punto giusto.', colorClass: 'text-cyan-400' },
  { icon: '?!', title: 'Quiz', desc: 'Scegli la risposta corretta tra le opzioni.', colorClass: 'text-violet-400' },
  { icon: '><', title: 'Find the bug', desc: "Trova e correggi l'errore nel codice.", colorClass: 'text-amber-400' },
  { icon: 'fn', title: 'Write code', desc: 'Scrivi la soluzione da zero.', colorClass: 'text-emerald-400' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuthContext()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-grid relative flex flex-col">
      {/* Gradient glow */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
          amalia<span className="text-cyan-400">_</span>
        </span>
        {isAuthenticated ? (
          <button
            onClick={() => router.push('/challenge')}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Vai alle sfide →
          </button>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
              Accedi
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-1.5 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              Registrati
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Powered by AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="font-mono">amalia</span>
          <span className="text-cyan-400 animate-blink">_</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto mb-4 leading-relaxed">
          La tua maestra di codice.
        </p>
        <p className="text-sm text-zinc-500 max-w-lg mx-auto mb-10">
          Sfide di programmazione generate dall&apos;AI per allenare le tue skill.
          Scegli il linguaggio, il livello e il tipo di sfida.
        </p>

        {isAuthenticated ? (
          <button
            onClick={() => router.push('/challenge')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-cyan-500 text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors glow-cyan"
          >
            Inizia una sfida
            <span className="text-base">→</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-cyan-500 text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors glow-cyan"
            >
              Crea un account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-zinc-900 text-zinc-300 font-medium text-sm hover:bg-zinc-800 transition-colors border border-zinc-800"
            >
              Accedi
            </Link>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="group p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all"
            >
              <span className={`inline-block font-mono text-sm font-bold mb-3 ${feat.colorClass}`}>
                {feat.icon}
              </span>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{feat.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ad space */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        <AdBanner format="horizontal" />
      </div>

      <Footer />
    </div>
  )
}