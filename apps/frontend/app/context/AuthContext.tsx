'use client'

import { createContext, useContext, ReactNode } from 'react' 
import { LoginRequest, RegisterRequest, UserRole } from '@amalia/shared'
import { useAuth, BanInfo } from '@/hooks/useAuth'

interface AuthContextType {
  token: string | null
  isLoading: boolean
  error: string | null
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  setToken: (token: string) => void
  userRole: UserRole
  isBanned: boolean
  banInfo: BanInfo | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}