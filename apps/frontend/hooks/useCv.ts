'use client'

import { useState, useCallback, useRef } from 'react'
import { CvService } from '../services/cv.service'
import { CvSession, CvSendMessageResponse } from '@amalia/shared'

export function useCv() {
  const service = useRef(new CvService()).current
  const [session, setSession] = useState<CvSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMyCV = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await service.getMyCv()
      setSession(data)
    } catch {
      setError('Impossibile caricare il CV')
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const startInterview = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await service.startInterview()
      setSession(data)
    } catch {
      setError('Impossibile avviare l\'intervista')
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const sendMessage = useCallback(async (content: string): Promise<CvSendMessageResponse | null> => {
    if (!session) return null
    setIsSending(true)
    try {
      const res = await service.sendMessage(session.id, content)
      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, { role: 'user', content }, res.message],
        status: res.isDone ? 'generating' : prev.status,
      } : prev)
      return res
    } catch {
      setError('Errore nell\'invio del messaggio')
      return null
    } finally {
      setIsSending(false)
    }
  }, [session, service])

  const generateCv = useCallback(async () => {
    if (!session) return
    setIsGenerating(true)
    setError(null)
    try {
      const data = await service.generateCv(session.id)
      setSession(data)
    } catch {
      setError('Generazione CV fallita. Riprova.')
    } finally {
      setIsGenerating(false)
    }
  }, [session, service])

  const deleteMyCV = useCallback(async () => {
    setIsLoading(true)
    try {
      await service.deleteMyCv()
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  return {
    session,
    isLoading,
    isSending,
    isGenerating,
    error,
    loadMyCV,
    startInterview,
    sendMessage,
    generateCv,
    deleteMyCV,
  }
}
