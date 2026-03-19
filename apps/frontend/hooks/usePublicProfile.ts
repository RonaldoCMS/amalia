'use client'

import { useState, useCallback, useRef } from 'react'
import { UserService } from '../services/user.service'
import { PublicUserProfile } from '@amalia/shared'

export function usePublicProfile() {
  const service = useRef(new UserService()).current
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const data = await service.getPublicProfile(userId)
      setProfile(data)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  return { profile, isLoading, load }
}
