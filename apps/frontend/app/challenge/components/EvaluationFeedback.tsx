'use client'

import { EvaluationResponse } from '@amelia/shared'

interface EvaluationFeedbackProps {
  evaluation: EvaluationResponse
  onNext: () => void
}

export function EvaluationFeedback({ evaluation, onNext }: EvaluationFeedbackProps) {
  return (
    <div className={`rounded-lg p-4 mb-4 ${evaluation.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${evaluation.correct ? 'text-green-700' : 'text-red-700'}`}>
        {evaluation.correct ? 'Corretto' : 'Sbagliato'}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">{evaluation.feedback}</p>
      <button
        onClick={onNext}
        className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Prossima sfida →
      </button>
    </div>
  )
}