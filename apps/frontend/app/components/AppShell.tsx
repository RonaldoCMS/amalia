'use client'

import { ReactNode } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { NotificationProvider } from '../context/NotificationContext'
import { Navbar } from './Navbar'
import { SnackBar } from './SnackBar'

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext()

  return (
    <NotificationProvider isAuthenticated={isAuthenticated}>
      <Navbar />
      {children}
      <SnackBar />
    </NotificationProvider>
  )
}
