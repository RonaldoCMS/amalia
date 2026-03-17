import { useState, useCallback, useRef } from 'react'
import { AuthService } from '../services/auth.service'
import { LoginRequest, RegisterRequest } from '@amalia/shared'

export function useAuth() {
  const service = useRef(new AuthService())
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (request: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await service.current.login(request)
      localStorage.setItem('token', data.accessToken)
      setToken(data.accessToken)
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
      setToken(data.accessToken)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
  }, [])

  return { token, isLoading, error, login, register, logout }
}