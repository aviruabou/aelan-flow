// src/hooks/useTrips.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Trip = Database['public']['Tables']['trips']['Row']

// ─── Customer: trip history ───────────────────────────────

export function useCustomerTrips(customerId: string | null) {
  return useQuery({
    queryKey: ['trips', 'customer', customerId],
    queryFn:  async () => {
      const { data, error } = await db.trips()
        .select(`
          *,
          drivers (
            id,
            rating_avg,
            photo_url,
            users ( full_name )
          ),
          vehicles ( plate_number, make, model )
        `)
        .eq('customer_id', customerId!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
    enabled:  !!customerId,
    staleTime: 60_000,
  })
}

// ─── Driver: trip history ─────────────────────────────────

export function useDriverTrips(driverId: string | null) {
  return useQuery({
    queryKey: ['trips', 'driver', driverId],
    queryFn:  async () => {
      const { data, error } = await db.trips()
        .select(`
          *,
          users!trips_customer_id_fkey ( full_name, phone )
        `)
        .eq('driver_id', driverId!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
    enabled:  !!driverId,
    staleTime: 60_000,
  })
}

// ─── Driver: submit rating for customer ───────────────────

export function useSubmitRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      tripId, raterId, ratedId, score, review, ratingType,
    }: {
      tripId:      string
      raterId:     string
      ratedId:     string
      score:       number
      review?:     string
      ratingType:  'customer_to_driver' | 'driver_to_customer'
    }) => {
      const { error } = await db.ratings().insert({
        trip_id:     tripId,
        rater_id:    raterId,
        rated_id:    ratedId,
        score,
        review:      review ?? null,
        rating_type: ratingType,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

// ─── Admin: all trips (paginated) ─────────────────────────

export function useAdminTrips(page = 0, pageSize = 25) {
  return useQuery({
    queryKey: ['trips', 'admin', page],
    queryFn:  async () => {
      const from = page * pageSize
      const to   = from + pageSize - 1
      const { data, error, count } = await db.trips()
        .select('*, users!trips_customer_id_fkey(full_name), drivers(users(full_name))', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return { trips: data, total: count ?? 0 }
    },
    staleTime: 30_000,
  })
}
