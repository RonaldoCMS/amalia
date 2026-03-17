import { useState, useCallback, useRef, useEffect } from 'react'
import { MatchSuggestion, MatchItem, LikeResponse } from '@amalia/shared'
import { MatchService } from '../services/match.service'

interface UseMatchReturn {
  suggestions: MatchSuggestion[]
  matches: MatchItem[]
  isLoading: boolean
  like: (userId: string) => Promise<LikeResponse>
  refreshMatches: () => Promise<void>
  archiveMatch: (matchId: string) => Promise<void>
}

export function useMatch(): UseMatchReturn {
  const service = useRef(new MatchService())
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        service.current.getSuggestions(),
        service.current.getMatches(),
      ])
      setSuggestions(s)
      setMatches(m)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    loadAll().finally(() => setIsLoading(false))

    const interval = setInterval(() => {
      service.current.getMatches().then(setMatches).catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [loadAll])

  const like = useCallback(async (userId: string): Promise<LikeResponse> => {
    const result = await service.current.like(userId)
    setSuggestions(prev => prev.filter(s => s.userId !== userId))
    if (result.matched) {
      service.current.getMatches().then(setMatches).catch(() => {})
    }
    return result
  }, [])

  const refreshMatches = useCallback(async () => {
    const m = await service.current.getMatches()
    setMatches(m)
  }, [])

  const archiveMatch = useCallback(async (matchId: string) => {
    await service.current.archiveMatch(matchId)
    setMatches(prev => prev.filter(m => m.matchId !== matchId))
  }, [])

  return { suggestions, matches, isLoading, like, refreshMatches, archiveMatch }
}
