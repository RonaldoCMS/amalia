'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { NotificationItem } from '@amalia/shared'
import { NotificationService } from '../../services/notification.service'
import { useFCM } from '../../hooks/useFCM'
import { FCMTokenService } from '../../services/fcm-token.service'

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
  requestPushPermission: () => Promise<boolean>
  pushPermissionStatus: NotificationPermission | null
  isPushSupported: boolean
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  snacks: [],
  requestPushPermission: async () => false,
  pushPermissionStatus: null,
  isPushSupported: false,
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
  const tokenRegistered = useRef(false)

  // FCM integration
  const { 
    token: fcmToken, 
    isSupported: isPushSupported, 
    permissionStatus: pushPermissionStatus,
    requestPermission,
    onForegroundMessage,
  } = useFCM()
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

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermission()
    return granted
  }, [requestPermission])

  // Register FCM token with backend when available
  useEffect(() => {
    if (!isAuthenticated || !fcmToken || tokenRegistered.current) return

    const registerToken = async () => {
      try {
        await FCMTokenService.registerToken(fcmToken)
        tokenRegistered.current = true
        console.log('✅ FCM token registered with backend')
      } catch (error) {
        console.error('Failed to register FCM token with backend:', error)
      }
    }

    registerToken()
  }, [isAuthenticated, fcmToken])

  // Listen to foreground messages
  useEffect(() => {
    if (!isPushSupported) return

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground FCM message received:', payload)
      
      // Show snackbar for foreground notification
      const title = payload.notification?.title || 'Nuova notifica'
      const body = payload.notification?.body || ''
      const id = payload.data?.referenceId || Date.now().toString()

      setSnacks(prev => [...prev, { id, title, body }])
      
      // Refresh notifications list
      refresh()
    })

    return unsubscribe
  }, [isPushSupported, onForegroundMessage, refresh])

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        snacks, 
        refresh, 
        markAllRead, 
        dismissSnack,
        requestPushPermission,
        pushPermissionStatus,
        isPushSupported,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
