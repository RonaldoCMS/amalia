'use client'

import { useState } from 'react'

interface AnswerFillProps {
  onSubmit: (answer: string) => void
  disabled?: boolean
}

export function AnswerFill({ onSubmit, disabled }: AnswerFillProps) {
  const [value, setValue] = useState('')

  return (
    <div className="mb-4">
      <p className="text-xs text-zinc-500 font-mono mb-2">
        <span className="text-cyan-400">$</span> Scrivi cosa va al posto di ___BLANK___
      </p>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
        placeholder="la tua risposta..."
        disabled={disabled}
        className="w-full font-mono text-sm px-4 py-3 rounded-lg bg-[#0d0d14] border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 disabled:opacity-40 transition-colors"
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