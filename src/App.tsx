// src/App.tsx
// MereSimi Studios Ltd — Honiara Taxi Network
// Root component: handles auth state, routing between dashboards

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'

// Screens
import { LoginScreen }         from '@/features/auth/LoginScreen'
import { RegistrationFlow }    from '@/features/auth/RegistrationFlow'
import { CustomerDashboard }   from '@/dashboards/CustomerDashboard'
import { DriverDashboard }     from '@/dashboards/DriverDashboard'
import { TaxiOwnerDashboard }  from '@/dashboards/TaxiOwnerDashboard'
import { AdminDashboard }      from '@/dashboards/AdminDashboard'
import { SplashScreen }        from '@/components/ui/SplashScreen'

// Global styles
import './index.css'

// ─── Auth + routing shell ─────────────────────────────────

function AppShell() {
  const {
    isAuthenticated,
    isLoading,
    isHydrated,
    role,
    profile,
  } = useAuth()

  // Hydrating from persisted session
  if (!isHydrated || isLoading) {
    return <SplashScreen />
  }

  // Not logged in
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Logged in but no profile yet (new user mid-registration)
  if (!profile) {
    return <RegistrationFlow />
  }

  // Route by role
  switch (role) {
    case 'customer':   return <CustomerDashboard />
    case 'driver':     return <DriverDashboard />
    case 'taxi_owner': return <TaxiOwnerDashboard />
    case 'admin':      return <AdminDashboard />
    default:           return <LoginScreen />
  }
}

// ─── Root ─────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
