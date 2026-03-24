// Firebase Cloud Messaging Service Worker
// This file must be in the public folder and will be served from the root

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBW0av7SMOhLemxfjWuAwQ6Sm_nIRh2sXA",
  authDomain: "amalia-1d651.firebaseapp.com",
  projectId: "amalia-1d651",
  storageBucket: "amalia-1d651.firebasestorage.app",
  messagingSenderId: "359096464555",
  appId: "1:359096464555:web:41394f75d3c560910373ee",
  measurementId: "G-29CELL3S9F"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Nuova notifica';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: payload.data?.type || 'default',
    data: {
      url: payload.data?.url || '/',
      referenceId: payload.data?.referenceId,
      type: payload.data?.type,
    },
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Get the URL from notification data or default to homepage
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
