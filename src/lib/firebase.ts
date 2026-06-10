// src/lib/firebase.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { initializeApp, getApps } from 'firebase/app'
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type Messaging,
} from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialise only once (Vite HMR can re-run this module)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

// ─── Messaging ────────────────────────────────────────────

let messaging: Messaging | null = null

export async function initMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging
  const supported = await isSupported()
  if (!supported) {
    console.warn('FCM not supported in this browser/environment.')
    return null
  }
  messaging = getMessaging(app)
  return messaging
}

// Request permission and return the FCM token
export async function requestFcmToken(): Promise<string | null> {
  try {
    const m = await initMessaging()
    if (!m) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission denied.')
      return null
    }

    const token = await getToken(m, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    return token ?? null
  } catch (err) {
    console.error('FCM token error:', err)
    return null
  }
}

// Subscribe to foreground messages (app is open)
export async function onForegroundMessage(
  handler: (payload: {
    notification?: { title?: string; body?: string }
    data?: Record<string, string>
  }) => void,
) {
  const m = await initMessaging()
  if (!m) return () => {}
  return onMessage(m, handler)
}

export { app }
