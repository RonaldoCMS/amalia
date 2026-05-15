import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { AuthService } from '../services/auth.service'
import { LoginRequest, RegisterRequest, UserRole } from '@amalia/shared'
export interface BanInfo {
  banned: true
  bannedUntil: string | null
  banReason: string | null
  permanent: boolean
}

function readBanInfo(): BanInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ban_info')
    if (!raw) return null
    const info: BanInfo = JSON.parse(raw)
    if (!info.permanent && info.bannedUntil) {
      if (new Date(info.bannedUntil) <= new Date()) {
        localStorage.removeItem('ban_info')
        return null
      }
    }
    return info
  } catch {
    localStorage.removeItem('ban_info')
    return null
  }
}
function decodeJwtRole(token: string | null): UserRole {
  if (!token) return 'user' as UserRole
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return (payload.role as UserRole) || ('user' as UserRole)
  } catch {
    return 'user' as UserRole
  }
}

export function useAuth() {
  const service = useRef(new AuthService())
  const [token, setTokenState] = useState<string | null>(null)
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage only on the client after mount to avoid SSR hydration mismatch
  useEffect(() => {
    setTokenState(localStorage.getItem('token'))
    setBanInfo(readBanInfo())
  }, [])

  const userRole = useMemo(() => decodeJwtRole(token), [token])

  const login = useCallback(async (request: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await service.current.login(request)
      localStorage.setItem('token', data.accessToken)
      setTokenState(data.accessToken)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (request: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await service.current.register(request)
      localStorage.setItem('token', data.accessToken)
      setTokenState(data.accessToken)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('ban_info')
    setTokenState(null)
    setBanInfo(null)
  }, [])

  const setToken = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken)
    setTokenState(newToken)
  }, [])

  return {
    token,
    isAuthenticated: !!token,
    isLoading,
    error,
    userRole,
    isBanned: !!banInfo,
    banInfo,
    login,
    register,
    logout,
    setToken,
  }
}