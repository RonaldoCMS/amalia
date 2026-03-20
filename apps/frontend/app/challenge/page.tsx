'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthContext } from '../context/AuthContext'
import { useChallenge } from '../../hooks/useChallenge'
import { useConfigurationChallenge } from '../../hooks/useConfigurationChallenge'
import { useStats } from '../../hooks/useStats'
import { useLanguage } from '../../i18n/LanguageProvider'
import { UserService } from '../../services/user.service'
import { ChallengeHeader } from './components/ChallengeHeader'
import { CodeDisplay } from './components/CodeDisplay'
import { EvaluationFeedback } from './components/EvaluationFeedback'
import { AnswerFill } from './components/AnswerInput/AnswerFill'
import { AnswerQuiz } from './components/AnswerInput/AnswerQuiz'
import { AnswerBug } from './components/AnswerInput/AnswerBug'
import { AnswerWrite } from './components/AnswerInput/AnswerWrite'
import { ConfigurationPanel } from '../components/ConfigurationPanel'
import { Footer } from '../components/Footer'
import { AdBanner, AdInterstitial } from '../components/AdBanner'
import { ChallengeType, ChallengeLanguage } from '@amalia/shared'

const AD_EVERY_N = 5

export default function ChallengePage() {
  const { isAuthenticated, logout } = useAuthContext()
  const router = useRouter()
  const { configuration } = useConfigurationChallenge()
  const { challenge, evaluation, isGenerating, isEvaluating, error, generate, evaluate, reset } = useChallenge()
  const { stats, refresh: refreshStats } = useStats()
  const { locale } = useLanguage()
  const t = useTranslations('Challenge')
  const userService = useRef(new UserService())
  const [completedCount, setCompletedCount] = useState(0)
  const [showAdInterstitial, setShowAdInterstitial] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    // Redirect to onboarding if not completed
    userService.current.getProfile().then(p => {
      if (!p.onboardingCompleted) router.replace('/onboarding')
    }).catch(() => {})
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleGenerate = (langOverride?: ChallengeLanguage) =>
    generate({ ...configuration, language: langOverride ?? configuration.language }, locale)

  const handleAnswer = (userAnswer: string) => {
    if (!challenge) return
    evaluate({
      challenge,
      type: configuration.type,
      level: configuration.level,
      language: configuration.language,
      userAnswer,
    }, locale).then(() => refreshStats())
  }

  const handleNext = () => {
    const next = completedCount + 1
    setCompletedCount(next)
    if (next > 0 && next % AD_EVERY_N === 0) {
      setShowAdInterstitial(true)
    } else {
      reset()
      generate(configuration, locale)
    }
  }

  const handleAdClose = () => {
    setShowAdInterstitial(false)
    reset()
    generate(configuration, locale)
  }

  const handleNewConfig = () => {
    reset()
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
    <div className="min-h-screen bg-grid relative flex flex-col pb-16 sm:pb-0">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/3 to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Phase 1: Configuration */}
        {!challenge && !isGenerating && !error && (
          <div className="max-w-xl mx-auto">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-100 mb-1">{t('configTitle')}</h2>
              <p className="text-sm text-zinc-500">{t('configSubtitle')}</p>
            </div>
            <ConfigurationPanel onStart={handleGenerate} />
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="font-mono text-sm text-zinc-500">
              <span className="text-cyan-400">$</span> generating challenge<span className="animate-blink">_</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto">
            <p className="font-mono text-xs text-red-400 p-4 rounded-lg bg-red-400/5 border border-red-400/20">
              ✗ {error}
            </p>
            <button
              onClick={handleNewConfig}
              className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
            >
              ← {t('backToConfig')}
            </button>
          </div>
        )}

        {/* Phase 2: Active Challenge */}
        {challenge && (
          <div className="max-w-3xl mx-auto">
            {/* Terminal window */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono ml-2 hidden sm:inline">
                    challenge.{configuration.language.toLowerCase()}
                  </span>
                </div>
                <button
                  onClick={handleNewConfig}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
                >
                  {t('newChallenge')}
                </button>
              </div>

              <div className="p-4 sm:p-6">
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
                  <div className="font-mono text-xs text-zinc-500 py-4">
                    <span className="text-cyan-400">$</span> evaluating<span className="animate-blink">_</span>
                  </div>
                )}
                {evaluation && (
                  <EvaluationFeedback evaluation={evaluation} onNext={handleNext} />
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 mt-1">
              <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
                <span>{configuration.language}</span>
                <span>{configuration.level}</span>
                <span>{configuration.type}</span>
              </div>
              <span className="text-[10px] text-zinc-700 font-mono">amalia v0.1</span>
            </div>
          </div>
        )}
      </main>

      {/* Ad space prima del footer */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6">
        <AdBanner format="horizontal" />
      </div>

      <Footer />

      {/* Ad interstitial ogni N quiz */}
      {showAdInterstitial && <AdInterstitial onClose={handleAdClose} />}
    </div>
  )
}