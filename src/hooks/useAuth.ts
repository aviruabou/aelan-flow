// src/hooks/useAuth.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { useEffect, useCallback } from 'react'
import { supabase, db } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { requestFcmToken } from '@/lib/firebase'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

// ─── Send OTP ─────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

// ─── Verify OTP ───────────────────────────────────────────

export async function verifyOtp(phone: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  if (error) throw error
}

// ─── Sign out ─────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  useAuthStore.getState().reset()
}

// ─── Fetch user profile from public.users ─────────────────

async function fetchProfile(authId: string): Promise<UserProfile | null> {
  const { data, error } = await db.users()
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle()

  if (error) {
    console.error('Profile fetch error:', error)
    return null
  }
  return data
}

// ─── Sync FCM token to profile ────────────────────────────

async function syncFcmToken(userId: string): Promise<void> {
  try {
    const token = await requestFcmToken()
    if (!token) return
    await db.users().update({ fcm_token: token }).eq('id', userId)
  } catch {
    // Non-critical — don't block auth flow
  }
}

// ─── Main auth hook ───────────────────────────────────────

export function useAuth() {
  const {
    session, authUser, profile, role,
    isVerified, isLoading, isHydrated,
    setSession, setProfile, setLoading, setHydrated,
    reset,
  } = useAuthStore()

  // Load profile after session is established
  const loadProfile = useCallback(async (authId: string) => {
    setLoading(true)
    const p = await fetchProfile(authId)
    setProfile(p)
    if (p) syncFcmToken(p.id)
    setLoading(false)
  }, [setLoading, setProfile])

  useEffect(() => {
    // Get initial session (persisted from previous visit)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
      setHydrated(true)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          reset()
          setLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [loadProfile, reset, setHydrated, setLoading, setSession])

  return {
    session,
    authUser,
    profile,
    role,
    isVerified,
    isLoading,
    isHydrated,
    isAuthenticated: !!session,
    isAdmin:      role === 'admin',
    isDriver:     role === 'driver',
    isCustomer:   role === 'customer',
    isTaxiOwner:  role === 'taxi_owner',
    sendOtp,
    verifyOtp,
    signOut,
  }
}
