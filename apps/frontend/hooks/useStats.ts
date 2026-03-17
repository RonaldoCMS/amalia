import { useState, useCallback, useRef, useEffect } from 'react'
import { UserStats } from '@amalia/shared'
import { ChallengeService } from '../services/challenge.service'

interface UseStatsReturn {
  stats: UserStats
  refresh: () => Promise<void>
}

const DEFAULT_STATS: UserStats = { totalScore: 0, correctCount: 0, wrongCount: 0 }

export function useStats(): UseStatsReturn {
  const service = useRef(new ChallengeService())
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS)

  const refresh = useCallback(async () => {
    try {
      const data = await service.current.getStats()
      setStats(data)
    } catch {
      // silently fail — stats are non-critical
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, refresh }
}
