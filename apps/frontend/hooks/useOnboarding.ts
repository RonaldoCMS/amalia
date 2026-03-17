import { useState, useCallback, useRef, useEffect } from 'react'
import { OnboardingResponse, OnboardingRequest } from '@amalia/shared'
import { OnboardingService } from '../services/onboarding.service'

interface UseOnboardingReturn {
  data: OnboardingResponse | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  save: (request: OnboardingRequest) => Promise<OnboardingResponse>
}

export function useOnboarding(): UseOnboardingReturn {
  const service = useRef(new OnboardingService())
  const [data, setData] = useState<OnboardingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    service.current.get()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  const save = useCallback(async (request: OnboardingRequest): Promise<OnboardingResponse> => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await service.current.save(request)
      setData(result)
      return result
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
      throw e
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { data, isLoading, isSaving, error, save }
}
