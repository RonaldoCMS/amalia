'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { NotificationItem } from '@amalia/shared'
import { NotificationService } from '../../services/notification.service'

interface Snack {
  id: string
  title: string
  body: string
}

interface NotificationContextType {
  notifications: NotificationItem[]
  unreadCount: number
  snacks: Snack[]
  refresh: () => Promise<void>
  markAllRead: () => Promise<void>
  dismissSnack: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  snacks: [],
  refresh: async () => {},
  markAllRead: async () => {},
  dismissSnack: () => {},
})

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const service = useRef(new NotificationService())
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [snacks, setSnacks] = useState<Snack[]>([])
  const prevUnread = useRef(0)
  const seenIds = useRef(new Set<string>())

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const [items, { count }] = await Promise.all([
        service.current.getAll(),
        service.current.getUnreadCount(),
      ])
      setNotifications(items)

      // Mostra snackbar per nuove notifiche
      if (count > prevUnread.current) {
        const newItems = items.filter(n => !n.read && !seenIds.current.has(n.id))
        for (const n of newItems) {
          seenIds.current.add(n.id)
          setSnacks(prev => [...prev, { id: n.id, title: n.title, body: n.body }])
        }
      }

      prevUnread.current = count
      setUnreadCount(count)
    } catch {
      // silently fail
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      seenIds.current.clear()
      prevUnread.current = 0
      return
    }
    refresh()
    const interval = setInterval(refresh, 8000)
    return () => clearInterval(interval)
  }, [isAuthenticated, refresh])

  // Auto-dismiss snackbar dopo 5s
  useEffect(() => {
    if (snacks.length === 0) return
    const timer = setTimeout(() => {
      setSnacks(prev => prev.slice(1))
    }, 5000)
    return () => clearTimeout(timer)
  }, [snacks])

  const markAllRead = useCallback(async () => {
    try {
      await service.current.markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
  }, [])

  const dismissSnack = useCallback((id: string) => {
    setSnacks(prev => prev.filter(s => s.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, snacks, refresh, markAllRead, dismissSnack }}>
      {children}
    </NotificationContext.Provider>
  )
}
