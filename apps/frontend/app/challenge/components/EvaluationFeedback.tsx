'use client'

import { EvaluationResponse } from '@amalia/shared'

interface EvaluationFeedbackProps {
  evaluation: EvaluationResponse
  onNext: () => void
}

export function EvaluationFeedback({ evaluation, onNext }: EvaluationFeedbackProps) {
  const isCorrect = evaluation.correct

  return (
    <div className={`rounded-lg p-4 mb-4 border ${
      isCorrect
        ? 'bg-emerald-400/5 border-emerald-400/20'
        : 'bg-red-400/5 border-red-400/20'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-mono text-sm font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
          <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${
            isCorrect ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isCorrect ? 'Corretto' : 'Sbagliato'}
          </span>
        </div>
        {isCorrect && evaluation.score > 0 && (
          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">
            +{evaluation.score} pts
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">{evaluation.feedback}</p>
      <button
        onClick={onNext}
        className="text-xs font-mono font-medium px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors"
      >
        Prossima sfida →
      </button>
    </div>
  )
}