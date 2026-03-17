'use client'

import { useNotifications } from '../context/NotificationContext'

/** Snackbar fluttuanti — renderizzare una volta nel layout */
export function SnackBar() {
  const { snacks, dismissSnack } = useNotifications()

  if (snacks.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {snacks.map(s => (
        <div
          key={s.id}
          className="pointer-events-auto animate-slide-up bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-mono font-semibold text-cyan-400 truncate">{s.title}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{s.body}</p>
            </div>
            <button
              onClick={() => dismissSnack(s.id)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors text-sm shrink-0 leading-none"
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
