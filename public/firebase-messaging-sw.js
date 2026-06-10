// public/firebase-messaging-sw.js
// MereSimi Studios Ltd — Honiara Taxi Network
// Service worker for Firebase background push notifications.
// Must be at /public/firebase-messaging-sw.js (served from root).

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// NOTE: These values are safe to expose (they are public Firebase config)
// Real values must match your .env.local VITE_FIREBASE_* variables
firebase.initializeApp({
  apiKey:            self.FIREBASE_API_KEY            || 'REPLACE_ME',
  authDomain:        self.FIREBASE_AUTH_DOMAIN        || 'REPLACE_ME',
  projectId:         self.FIREBASE_PROJECT_ID         || 'REPLACE_ME',
  storageBucket:     self.FIREBASE_STORAGE_BUCKET     || 'REPLACE_ME',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID|| 'REPLACE_ME',
  appId:             self.FIREBASE_APP_ID             || 'REPLACE_ME',
})

const messaging = firebase.messaging()

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const { title, body } = payload.notification ?? {}
  const data            = payload.data ?? {}

  self.registration.showNotification(title ?? 'Honiara Taxi Network', {
    body:    body ?? '',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-72.png',
    tag:     data.type ?? 'htn-notification',
    data,
    vibrate: [200, 100, 200],
    actions: data.type === 'booking_request'
      ? [
          { action: 'accept',  title: '✓ Accept' },
          { action: 'decline', title: '✕ Decline' },
        ]
      : [],
  })
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data ?? {}

  let url = '/'
  if (data.trip_id) url = `/?trip=${data.trip_id}`

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data })
          return client.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})
