'use client'

import { useState } from 'react'

interface AnswerQuizProps {
  options: string[]
  onSubmit: (answer: string) => void
  disabled?: boolean
}

const optionKeys = ['A', 'B', 'C', 'D']

export function AnswerQuiz({ options, onSubmit, disabled }: AnswerQuizProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="mb-4">
      <p className="text-xs text-zinc-500 font-mono mb-3">
        <span className="text-cyan-400">$</span> Seleziona la risposta corretta
      </p>
      <div className="flex flex-col gap-2 mb-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !disabled && setSelected(opt)}
            disabled={disabled}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all font-mono
              ${selected === opt
                ? 'border-cyan-500/50 bg-cyan-500/5 text-cyan-300'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`w-6 h-6 rounded shrink-0 flex items-center justify-center text-xs font-bold ${
              selected === opt ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {optionKeys[i]}
            </span>
            <span className="text-sm">{opt.replace(/^[A-D]\.\s*/, '')}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={disabled || !selected}
        className="w-full py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-mono font-medium hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 transition-colors"
      >
        Verifica
      </button>
    </div>
  )
}