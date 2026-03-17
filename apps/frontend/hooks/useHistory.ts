import { useState, useRef, useEffect } from 'react'
import { ChallengeHistoryItem } from '@amalia/shared'
import { UserService } from '../services/user.service'

interface UseHistoryReturn {
  history: ChallengeHistoryItem[]
  isLoading: boolean
}

export function useHistory(): UseHistoryReturn {
  const service = useRef(new UserService())
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    service.current.getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setIsLoading(false))
  }, [])

  return { history, isLoading }
}
