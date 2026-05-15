/// <reference lib="webworker" />
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare const self: ServiceWorkerGlobalScope

const firebaseConfig = {
  apiKey: 'AIzaSyBW0av7SMOhLemxfjWuAwQ6Sm_nIRh2sXA',
  authDomain: 'amalia-1d651.firebaseapp.com',
  projectId: 'amalia-1d651',
  storageBucket: 'amalia-1d651.firebasestorage.app',
  messagingSenderId: '359096464555',
  appId: '1:359096464555:web:41394f75d3c560910373ee',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const messaging = getMessaging(app)

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title ?? 'Nuova notifica'
  const options: NotificationOptions = {
    body: payload.notification?.body ?? '',
    icon: '/icons/android/launchericon-192x192.png',
    badge: '/icons/android/launchericon-96x96.png',
    tag: payload.data?.type ?? 'default',
    data: { url: payload.data?.url ?? '/' },
  }
  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string = (event.notification.data?.url as string) ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url === url)
      if (existing && 'focus' in existing) return (existing as WindowClient).focus()
      return self.clients.openWindow(url)
    })
  )
})

export {}
