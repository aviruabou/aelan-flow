// src/stores/authStore.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type UserRole    = Database['public']['Enums']['user_role']
type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  // Supabase auth
  session:     Session | null
  authUser:    User    | null

  // App user profile
  profile:     UserProfile | null
  role:        UserRole    | null
  isVerified:  boolean

  // UI state
  isLoading:   boolean
  isHydrated:  boolean

  // Actions
  setSession:  (session: Session | null) => void
  setProfile:  (profile: UserProfile | null) => void
  setLoading:  (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
  reset:       () => void
}

const initialState = {
  session:    null,
  authUser:   null,
  profile:    null,
  role:       null,
  isVerified: false,
  isLoading:  true,
  isHydrated: false,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (session) =>
        set({
          session,
          authUser: session?.user ?? null,
        }),

      setProfile: (profile) =>
        set({
          profile,
          role:       profile?.role ?? null,
          isVerified: profile?.is_verified ?? false,
        }),

      setLoading:  (isLoading)  => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),

      reset: () => set(initialState),
    }),
    {
      name:    'htn-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive state
      partialize: (state) => ({
        role:       state.role,
        isVerified: state.isVerified,
      }),
    },
  ),
)

// ─── Selectors ────────────────────────────────────────────

export const selectIsAdmin        = (s: AuthState) => s.role === 'admin'
export const selectIsDriver       = (s: AuthState) => s.role === 'driver'
export const selectIsCustomer     = (s: AuthState) => s.role === 'customer'
export const selectIsTaxiOwner    = (s: AuthState) => s.role === 'taxi_owner'
export const selectIsAuthenticated = (s: AuthState) => !!s.session
export const selectUserId         = (s: AuthState) => s.profile?.id ?? null
