import { useState, useCallback, useRef } from 'react'
import { AuthService } from '../services/auth.service'
import { LoginRequest, RegisterRequest } from '@amelia/shared'

interface UseAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const service = useRef(new AuthService())
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== 'undefined' && !!localStorage.getItem('token')
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (request: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await service.current.login(request)
      localStorage.setItem('token', data.accessToken)
      setIsAuthenticated(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
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
      setIsAuthenticated(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, isLoading, error, login, register, logout }
}