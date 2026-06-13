// src/App.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools }  from '@tanstack/react-query-devtools'
import { queryClient }         from '@/lib/queryClient'
import { useAuth }             from '@/hooks/useAuth'
import { LoginScreen }         from '@/features/auth/LoginScreen'
import { RegistrationFlow }    from '@/features/auth/RegistrationFlow'
import { CustomerDashboard }   from '@/dashboards/CustomerDashboard'
import { DriverDashboard }     from '@/dashboards/DriverDashboard'
import { TaxiOwnerDashboard }  from '@/dashboards/TaxiOwnerDashboard'
import { AdminDashboard }      from '@/dashboards/AdminDashboard'
import { SplashScreen }        from '@/components/ui/SplashScreen'
import './index.css'

function AppShell() {
  const { isAuthenticated, isLoading, isHydrated, role, profile } = useAuth()

  if (!isHydrated || isLoading) return <SplashScreen />
  if (!isAuthenticated)         return <LoginScreen />
  if (!profile)                 return <RegistrationFlow />

  switch (role) {
    case 'customer':   return <CustomerDashboard />
    case 'driver':     return <DriverDashboard />
    case 'taxi_owner': return <TaxiOwnerDashboard />
    case 'admin':      return <AdminDashboard />
    default:           return <LoginScreen />
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
