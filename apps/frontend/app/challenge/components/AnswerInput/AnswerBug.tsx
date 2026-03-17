'use client'

import { useState } from 'react'

interface AnswerBugProps {
  onSubmit: (answer: string) => void
  disabled?: boolean
}

export function AnswerBug({ onSubmit, disabled }: AnswerBugProps) {
  const [value, setValue] = useState('')

  return (
    <div className="mb-4">
      <p className="text-xs text-zinc-500 font-mono mb-2">
        <span className="text-cyan-400">$</span> Scrivi la riga corretta
      </p>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="// la riga con il bug corretto..."
        disabled={disabled}
        rows={3}
        className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[#0d0d14] border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 resize-none transition-colors"
      />
      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={disabled || !value.trim()}
        className="mt-3 w-full py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-mono font-medium hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 transition-colors"
      >
        Verifica
      </button>
    </div>
  )
}