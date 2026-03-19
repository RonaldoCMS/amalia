'use client'

import { useState, useCallback, useRef } from 'react'
import { UserService } from '../services/user.service'
import { UserSearchResult } from '@amalia/shared'

export function useUserSearch() {
  const service = useRef(new UserService()).current
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((query: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (!query.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await service.searchUsers(query.trim(), 20)
        setResults(data)
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [service])

  const clear = useCallback(() => {
    setResults([])
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return { results, isSearching, search, clear }
}
