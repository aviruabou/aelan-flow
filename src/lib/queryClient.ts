// src/lib/queryClient.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 seconds
      staleTime:           30_000,
      // Keep unused data in cache for 5 minutes
      gcTime:              5 * 60_000,
      // Retry failed requests up to 3 times
      retry:               3,
      retryDelay:          (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      // Refetch when window regains focus (important for mobile)
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect for stable data
      refetchOnReconnect:  'always',
    },
    mutations: {
      retry: 1,
    },
  },
})
