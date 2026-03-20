import { useState, useCallback, useRef } from 'react'
import { ChallengeResponse, EvaluationResponse, GenerateChallengeRequest, EvaluateChallengeRequest } from '@amalia/shared'
import { ChallengeService } from '../services/challenge.service'

interface UseChallengeReturn {
  challenge: ChallengeResponse | null
  evaluation: EvaluationResponse | null
  isGenerating: boolean
  isEvaluating: boolean
  error: string | null
  generate: (config: GenerateChallengeRequest, lang?: string) => Promise<void>
  evaluate: (request: EvaluateChallengeRequest, lang?: string) => Promise<void>
  reset: () => void
}

export function useChallenge(): UseChallengeReturn {
  const service = useRef(new ChallengeService())

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (config: GenerateChallengeRequest, lang?: string) => {
    setIsGenerating(true)
    setError(null)
    setEvaluation(null)
    try {
      const data = await service.current.generate(config, lang)
      setChallenge(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const evaluate = useCallback(async (request: EvaluateChallengeRequest, lang?: string) => {
    setIsEvaluating(true)
    setError(null)
    try {
      const data = await service.current.evaluate(request, lang)
      setEvaluation(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setIsEvaluating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setChallenge(null)
    setEvaluation(null)
    setError(null)
  }, [])

  return { challenge, evaluation, isGenerating, isEvaluating, error, generate, evaluate, reset }
}