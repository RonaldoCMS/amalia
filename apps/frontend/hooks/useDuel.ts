import { useState, useCallback, useRef, useEffect } from 'react'
import { DuelService } from '../services/duel.service'
import {
  DuelStateResponse, DuelAnswerResponse,
  DuelLeaderboardEntry, DuelLanguageQueueCount,
} from '@amalia/shared'

type Phase = 'idle' | 'queue' | 'active' | 'completed'

export function useDuel() {
  const svc = useRef(new DuelService())
  const [phase, setPhase] = useState<Phase>('idle')
  const [duelId, setDuelId] = useState<string | null>(null)
  const [duel, setDuel] = useState<DuelStateResponse | null>(null)
  const [lastAnswer, setLastAnswer] = useState<DuelAnswerResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [queueCounts, setQueueCounts] = useState<DuelLanguageQueueCount[]>([])
  const [leaderboard, setLeaderboard] = useState<DuelLeaderboardEntry[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await svc.current.getLeaderboard()
      setLeaderboard(data)
    } catch { /* ignore */ }
  }, [])

  const [banUntil, setBanUntil] = useState<Date | null>(null)

  const joinQueue = useCallback(async (language?: string) => {
    setError(null)
    setBanUntil(null)
    setLastAnswer(null)
    setDuel(null)
    try {
      const res = await svc.current.joinQueue(language)
      if (res.status === 'matched' && res.duelId) {
        setDuelId(res.duelId)
        setPhase('active')
      } else {
        setPhase('queue')
      }
    } catch (e: any) {
      // 403 with ban timestamp in message
      if (e?.response?.status === 403) {
        const banDate = new Date(e.response.data?.message ?? '')
        if (!isNaN(banDate.getTime())) {
          setBanUntil(banDate)
        } else {
          setError('Non puoi partecipare a sfide in questo momento')
        }
      } else {
        setError('Errore durante la ricerca')
      }
    }
  }, [])

  const leaveQueue = useCallback(async () => {
    stopPolling()
    try { await svc.current.leaveQueue() } catch { /* ignore */ }
    setPhase('idle')
    setDuelId(null)
  }, [stopPolling])

  const submitAnswer = useCallback(async (answer: string) => {
    if (!duelId) return
    setError(null)
    try {
      const res = await svc.current.submitAnswer(duelId, { answer })
      setLastAnswer(res)
    } catch { setError('Errore nell\'invio della risposta') }
  }, [duelId])

  const forfeit = useCallback(async () => {
    if (!duelId) return
    setError(null)
    try {
      await svc.current.forfeit(duelId)
      setPhase('completed')
    } catch { setError('Errore durante l\'abbandono della sfida') }
  }, [duelId])

  const reset = useCallback(() => {
    stopPolling()
    setPhase('idle')
    setDuelId(null)
    setDuel(null)
    setLastAnswer(null)
    setError(null)
  }, [stopPolling])

  // On mount: restore active/queue state (handles page refresh/crash)
  useEffect(() => {
    // Instant activation when coming from an accepted invite
    const pendingId = sessionStorage.getItem('pendingDuelId')
    if (pendingId) {
      sessionStorage.removeItem('pendingDuelId')
      setDuelId(pendingId)
      setPhase('active')
      return
    }
    const restore = async () => {
      try {
        if (!localStorage.getItem('token')) return
        const status = await svc.current.getQueueStatus()
        if (status.status === 'matched' && status.duelId) {
          setDuelId(status.duelId)
          setPhase('active')
        } else if (status.status === 'waiting') {
          setPhase('queue')
        }
      } catch { /* no token or network error - stay idle */ }
    }
    restore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll queue counts when idle (also refreshes when back from queue)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await svc.current.getLanguageQueueCounts()
        setQueueCounts(data)
      } catch { /* ignore */ }
    }
    // Always keep counts fresh (idle + queue phases)
    if (phase !== 'idle' && phase !== 'queue') return
    if (phase === 'idle') loadLeaderboard()
    fetchCounts()
    const id = setInterval(fetchCounts, 3000)
    return () => clearInterval(id)
  }, [phase, loadLeaderboard])

  // Poll queue status when in queue
  useEffect(() => {
    if (phase !== 'queue') return
    const poll = async () => {
      try {
        const res = await svc.current.getQueueStatus()
        if (res.status === 'matched' && res.duelId) {
          setDuelId(res.duelId)
          setPhase('active')
        } else if (res.status === 'none') {
          setPhase('idle')
        }
      } catch { /* keep polling */ }
    }
    const id = setInterval(poll, 2000)
    pollRef.current = id
    return () => clearInterval(id)
  }, [phase])

  // Poll duel state when active
  useEffect(() => {
    if (phase !== 'active' || !duelId) return
    let mounted = true
    const poll = async () => {
      try {
        const d = await svc.current.getDuel(duelId)
        if (!mounted) return
        setDuel(d)
        if (d.status === 'completed' || d.status === 'cancelled') {
          setPhase('completed')
        }
        // Reset lastAnswer when round advances
        if (d.currentRound && d.currentRound.myAnswer === null) {
          setLastAnswer(null)
        }
      } catch { /* keep polling */ }
    }
    poll() // immediate first call
    const id = setInterval(poll, 2000)
    pollRef.current = id
    return () => { mounted = false; clearInterval(id) }
  }, [phase, duelId])

  return {
    phase, duel, duelId, lastAnswer, error, banUntil,
    queueCounts, leaderboard,
    joinQueue, leaveQueue, submitAnswer, forfeit, reset,
  }
}
