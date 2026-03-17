import { useState, useCallback, useRef, useEffect } from 'react'
import { UserProfile, UpdatePasswordRequest } from '@amelia/shared'
import { UserService } from '../services/user.service'

interface UseProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  reload: () => void
  updatePassword: (request: UpdatePasswordRequest) => Promise<void>
  deleteAccount: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const service = useRef(new UserService())
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setIsLoading(true)
    service.current.getProfile()
      .then(setProfile)
      .catch(() => setError('Failed to load profile'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const updatePassword = useCallback(async (request: UpdatePasswordRequest) => {
    await service.current.updatePassword(request)
  }, [])

  const deleteAccount = useCallback(async () => {
    await service.current.deleteAccount()
  }, [])

  return { profile, isLoading, error, reload: load, updatePassword, deleteAccount }
}
