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
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
        placeholder="Scrivi cosa va al posto di ___BLANK___"
        disabled={disabled}
        className="w-full font-mono text-sm px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 disabled:opacity-50"
      />
      <button
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={disabled || !value.trim()}
        className="mt-3 w-full py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        Verifica
      </button>
    </div>
  )
}