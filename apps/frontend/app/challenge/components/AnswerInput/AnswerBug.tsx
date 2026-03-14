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
      <p className="text-xs text-gray-500 mb-2">Scrivi la riga corretta:</p>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Scrivi la riga con il bug corretto..."
        disabled={disabled}
        rows={3}
        className="w-full font-mono text-sm px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 disabled:opacity-50 resize-none"
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