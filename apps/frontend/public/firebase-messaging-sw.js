// Firebase Messaging is now handled by sw.js (next-pwa).
// This file unregisters itself so browsers with a cached registration migrate cleanly.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() =>
      self.clients.matchAll({ type: 'window' }).then((clients) =>
        clients.forEach((client) => client.navigate(client.url))
      )
    )
  );
});


// Initialize Firebase in the service worker
// These placeholders will be replaced during build with values from .env.local
