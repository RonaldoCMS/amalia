'use client'

import { useChallenge } from '../../hooks/useChallenge'
import { useConfigurationChallenge } from '../../hooks/useConfigurationChallenge'
import { ChallengeHeader } from './components/ChallengeHeader'
import { CodeDisplay } from './components/CodeDisplay'
import { EvaluationFeedback } from './components/EvaluationFeedback'
import { AnswerFill } from './components/AnswerInput/AnswerFill'
import { AnswerQuiz } from './components/AnswerInput/AnswerQuiz'
import { AnswerBug } from './components/AnswerInput/AnswerBug'
import { AnswerWrite } from './components/AnswerInput/AnswerWrite'
import { ChallengeType } from '@amelia/shared'

export default function ChallengePage() {
  const { configuration } = useConfigurationChallenge()
  const { challenge, evaluation, isGenerating, isEvaluating, error, generate, evaluate, reset } = useChallenge()

  const handleStart = () => generate(configuration)

  const handleAnswer = (userAnswer: string) => {
    if (!challenge) return
    evaluate({
      challenge,
      type: configuration.type,
      level: configuration.level,
      language: configuration.language,
      userAnswer,
    })
  }

  const handleNext = () => {
    reset()
    generate(configuration)
  }

  const renderAnswerInput = () => {
    if (!challenge || evaluation) return null
    switch (configuration.type) {
      case ChallengeType.Fill: return <AnswerFill onSubmit={handleAnswer} disabled={isEvaluating} />
      case ChallengeType.Quiz: return <AnswerQuiz options={challenge.options} onSubmit={handleAnswer} disabled={isEvaluating} />
      case ChallengeType.Bug: return <AnswerBug onSubmit={handleAnswer} disabled={isEvaluating} />
      case ChallengeType.Write: return <AnswerWrite onSubmit={handleAnswer} disabled={isEvaluating} />
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-8">Amelia</h1>

      {!challenge && !isGenerating && (
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Inizia sfida
        </button>
      )}

      {isGenerating && (
        <p className="text-sm text-gray-500 text-center py-8">Amelia sta preparando la sfida...</p>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center py-4">{error}</p>
      )}

      {challenge && (
        <>
          <ChallengeHeader
            title={challenge.title}
            description={challenge.description}
            type={configuration.type}
            level={configuration.level}
            language={configuration.language}
          />
          <CodeDisplay code={challenge.code} />
          {renderAnswerInput()}
          {isEvaluating && (
            <p className="text-sm text-gray-500 text-center py-4">Amelia sta valutando...</p>
          )}
          {evaluation && (
            <EvaluationFeedback evaluation={evaluation} onNext={handleNext} />
          )}
        </>
      )}
    </main>
  )
}