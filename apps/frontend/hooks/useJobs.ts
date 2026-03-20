import { useState, useCallback, useRef, useEffect } from 'react'
import { JobService } from '../services/job.service'
import {
  JobOfferItem, JobApplicationItem, JobOfferDetail,
  JobCandidateItem, JobMessageItem, CreateJobOfferRequest,
} from '@amalia/shared'

export function useMyOffers() {
  const service = useRef(new JobService())
  const [offers, setOffers] = useState<JobOfferItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await service.current.getMyOffers()
      setOffers(data)
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const createOffer = useCallback(async (data: CreateJobOfferRequest) => {
    const item = await service.current.createOffer(data)
    setOffers(prev => [item, ...prev])
    return item
  }, [])

  return { offers, isLoading, reload: load, createOffer }
}

export function useReceivedOffers() {
  const service = useRef(new JobService())
  const [offers, setOffers] = useState<JobApplicationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await service.current.getReceivedOffers()
      setOffers(data)
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return { offers, isLoading, reload: load }
}

export function useOfferDetail(offerId: string | null) {
  const service = useRef(new JobService())
  const [offer, setOffer] = useState<JobOfferDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!offerId) return
    service.current.getOfferDetail(offerId)
      .then(setOffer)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [offerId])

  return { offer, isLoading }
}

export function useCandidates(offerId: string | null) {
  const service = useRef(new JobService())
  const [candidates, setCandidates] = useState<JobCandidateItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!offerId) return
    try {
      const data = await service.current.getCandidates(offerId)
      setCandidates(data)
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }, [offerId])

  useEffect(() => { load() }, [load])

  const sendToDevs = useCallback(async (developerIds: string[]) => {
    if (!offerId) return
    const result = await service.current.sendOfferToDevs(offerId, developerIds)
    // Reload to refresh candidate list (sent devs will be excluded)
    await load()
    return result
  }, [offerId, load])

  return { candidates, isLoading, reload: load, sendToDevs }
}

export function useJobChat(applicationId: string) {
  const service = useRef(new JobService())
  const [messages, setMessages] = useState<JobMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const data = await service.current.getMessages(applicationId)
      setMessages(data)
    } catch { /* ignore */ }
  }, [applicationId])

  useEffect(() => {
    fetchMessages().finally(() => setIsLoading(false))
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchMessages])

  const send = useCallback(async (content: string) => {
    const msg = await service.current.sendMessage(applicationId, content)
    setMessages(prev => [...prev, msg])
  }, [applicationId])

  return { messages, isLoading, send }
}
