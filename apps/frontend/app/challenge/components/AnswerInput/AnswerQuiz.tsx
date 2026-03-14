'use client'

import { useState } from 'react'

interface AnswerQuizProps {
  options: string[]
  onSubmit: (answer: string) => void
  disabled?: boolean
}

export function AnswerQuiz({ options, onSubmit, disabled }: AnswerQuizProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-2 mb-4">
        {options.map((opt, i) => (
          <div
            key={i}
            onClick={() => !disabled && setSelected(opt)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors
              ${selected === opt ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
              ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          >
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
              {['A', 'B', 'C', 'D'][i]}
            </span>
            <span className="text-sm font-mono text-gray-800">{opt.replace(/^[A-D]\.\s*/, '')}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={disabled || !selected}
        className="w-full py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        Verifica
      </button>
    </div>
  )
}