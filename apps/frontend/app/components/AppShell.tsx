'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '../context/AuthContext'
import { NotificationProvider } from '../context/NotificationContext'
import { Navbar } from './Navbar'
import { SnackBar } from './SnackBar'
import { IOSInstallBanner } from './IOSInstallBanner'
import { backendClient } from '@/lib/backend'

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBanned, token } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  // Proactive ban check: call /user/me so BanGuard fires on app load.
  // Skip if already on /ban to avoid infinite reload loop.
  useEffect(() => {
    if (!isAuthenticated || !token || pathname === '/ban') return
    backendClient
      .get('/user/me', { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => {/* interceptor handles ban redirect */})
  }, [isAuthenticated, token, pathname])

  // Redirect banned users away from every page except /ban
  useEffect(() => {
    if (isBanned && pathname !== '/ban') {
      router.replace('/ban')
    }
  }, [isBanned, pathname, router])

  // Redirect non-banned authenticated users away from /ban
  useEffect(() => {
    if (!isBanned && pathname === '/ban' && isAuthenticated) {
      router.replace('/feed')
    }
  }, [isBanned, pathname, isAuthenticated, router])

  const showNavbar = pathname !== '/ban'

  return (
    <NotificationProvider isAuthenticated={isAuthenticated}>
      {showNavbar && <Navbar />}
      {children}
      <SnackBar />
      <IOSInstallBanner />
    </NotificationProvider>
  )
}
