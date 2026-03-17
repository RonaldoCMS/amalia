'use client'

import { useState } from 'react'

interface AnswerWriteProps {
  onSubmit: (answer: string) => void
  disabled?: boolean
}

export function AnswerWrite({ onSubmit, disabled }: AnswerWriteProps) {
  const [value, setValue] = useState('')

  return (
    <div className="mb-4">
      <p className="text-xs text-zinc-500 font-mono mb-2">
        <span className="text-cyan-400">$</span> Scrivi la tua implementazione
      </p>
      <div className="rounded-lg bg-[#0d0d14] border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/50">
          <span className="text-[10px] text-zinc-600 font-mono">solution</span>
        </div>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={'function solution() {\n  // il tuo codice...\n}'}
          disabled={disabled}
          rows={8}
          className="w-full font-mono text-sm px-4 py-3 bg-transparent text-zinc-200 placeholder-zinc-700 focus:outline-none disabled:opacity-40 resize-none"
        />
      </div>
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