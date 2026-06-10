// src/hooks/useBooking.ts
// MereSimi Studios Ltd — Honiara Taxi Network
// Manages the full booking lifecycle from customer perspective:
//   request → dispatching → driver accepted → tracking → complete

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, db, acceptBooking } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Trip         = Database['public']['Tables']['trips']['Row']
type TripStatus   = Database['public']['Enums']['trip_status']
type DriverRow    = Database['public']['Tables']['drivers']['Row']

const DISPATCH_TIMEOUT_MS = Number(import.meta.env.VITE_DISPATCH_TIMEOUT_MS ?? 30_000)

// ─── Types ────────────────────────────────────────────────

export interface BookingDriver {
  driver_id:    string
  user_id:      string
  vehicle_id:   string | null
  full_name:    string
  plate_number: string
  rating_avg:   number
  photo_url:    string | null
}

export type BookingPhase =
  | 'idle'
  | 'requesting'     // creating trip record
  | 'dispatching'    // waiting for a driver to accept (up to 30s)
  | 'accepted'       // driver confirmed
  | 'driver_en_route'
  | 'in_progress'
  | 'completed'
  | 'no_drivers'
  | 'cancelled'
  | 'error'

// ─── Hook ─────────────────────────────────────────────────

export function useBooking(customerId: string | null) {
  const qc                  = useQueryClient()
  const [phase, setPhase]   = useState<BookingPhase>('idle')
  const [trip, setTrip]     = useState<Trip | null>(null)
  const [driver, setDriver] = useState<BookingDriver | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const timeoutRef          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef          = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ─── Cleanup helpers ──────────────────────────────────

  const clearTimeout_ = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const unsubscribeChannel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  // ─── Subscribe to trip status changes ─────────────────

  const subscribeToTrip = useCallback((tripId: string) => {
    unsubscribeChannel()

    channelRef.current = supabase
      .channel(`booking-trip-${tripId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'trips',
          filter: `id=eq.${tripId}`,
        },
        async (payload) => {
          const updated = payload.new as Trip
          setTrip(updated)

          switch (updated.status as TripStatus) {
            case 'driver_assigned': {
              clearTimeout_()
              setPhase('accepted')
              // Fetch driver details
              if (updated.driver_id) {
                const { data } = await db.drivers()
                  .select(`
                    id,
                    rating_avg,
                    photo_url,
                    current_vehicle_id,
                    users!inner ( full_name ),
                    vehicles ( plate_number )
                  `)
                  .eq('id', updated.driver_id)
                  .single()
                if (data) {
                  setDriver({
                    driver_id:    data.id,
                    user_id:      (data as any).users.id ?? '',
                    vehicle_id:   data.current_vehicle_id,
                    full_name:    (data as any).users.full_name,
                    plate_number: (data as any).vehicles?.plate_number ?? '–',
                    rating_avg:   data.rating_avg,
                    photo_url:    data.photo_url,
                  })
                }
              }
              break
            }
            case 'driver_en_route':
              setPhase('driver_en_route')
              break
            case 'in_progress':
              setPhase('in_progress')
              break
            case 'completed':
              setPhase('completed')
              unsubscribeChannel()
              qc.invalidateQueries({ queryKey: ['trips', customerId] })
              break
            case 'cancelled_customer':
            case 'cancelled_driver':
              setPhase('cancelled')
              unsubscribeChannel()
              break
            case 'no_drivers_available':
              clearTimeout_()
              setPhase('no_drivers')
              unsubscribeChannel()
              break
          }
        },
      )
      .subscribe()
  }, [customerId, qc])

  // ─── Request a taxi ───────────────────────────────────

  const requestTaxi = useMutation({
    mutationFn: async ({
      pickupLat,
      pickupLng,
      pickupAddress,
    }: {
      pickupLat:     number
      pickupLng:     number
      pickupAddress: string
    }) => {
      if (!customerId) throw new Error('Not authenticated')

      setPhase('requesting')
      setError(null)
      setDriver(null)

      // 1. Create trip record
      const { data: newTrip, error: tripErr } = await db.trips()
        .insert({
          customer_id:    customerId,
          pickup_lat:     pickupLat,
          pickup_lng:     pickupLng,
          pickup_address: pickupAddress,
        })
        .select()
        .single()

      if (tripErr) throw tripErr
      setTrip(newTrip)

      // 2. Dispatch via Edge Function
      const { error: fnErr } = await supabase.functions.invoke('dispatch-booking', {
        body: {
          trip_id:    newTrip.id,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
        },
      })
      if (fnErr) throw fnErr

      setPhase('dispatching')

      // 3. Start listening for acceptance
      subscribeToTrip(newTrip.id)

      // 4. Timeout if no driver accepts
      timeoutRef.current = setTimeout(() => {
        setPhase('no_drivers')
        unsubscribeChannel()
      }, DISPATCH_TIMEOUT_MS + 5_000) // slight buffer over server-side timeout

      return newTrip
    },
    onError: (err: Error) => {
      setPhase('error')
      setError(err.message)
    },
  })

  // ─── Cancel booking ───────────────────────────────────

  const cancelBooking = useCallback(async () => {
    if (!trip) return
    clearTimeout_()
    unsubscribeChannel()

    await db.trips()
      .update({ status: 'cancelled_customer', cancelled_at: new Date().toISOString() })
      .eq('id', trip.id)

    setPhase('cancelled')
    setTrip(null)
    setDriver(null)
  }, [trip])

  // ─── Reset to idle ────────────────────────────────────

  const reset = useCallback(() => {
    clearTimeout_()
    unsubscribeChannel()
    setPhase('idle')
    setTrip(null)
    setDriver(null)
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout_()
    unsubscribeChannel()
  }, [])

  return {
    phase,
    trip,
    driver,
    error,
    isActive:       phase !== 'idle' && phase !== 'completed' && phase !== 'cancelled' && phase !== 'error' && phase !== 'no_drivers',
    requestTaxi:    requestTaxi.mutate,
    isRequesting:   requestTaxi.isPending,
    cancelBooking,
    reset,
  }
}

// ─── Driver side: accept booking ──────────────────────────

export function useDriverDispatch(driverId: string | null) {
  const [incomingDispatch, setIncomingDispatch] = useState<{
    id:       string
    trip_id:  string
    expires_at: string
  } | null>(null)

  useEffect(() => {
    if (!driverId) return

    const channel = supabase
      .channel(`driver-dispatch-${driverId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'trip_dispatch',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          const dispatch = payload.new as {
            id:         string
            trip_id:    string
            status:     string
            expires_at: string
          }
          if (dispatch.status === 'pending') {
            setIncomingDispatch({
              id:         dispatch.id,
              trip_id:    dispatch.trip_id,
              expires_at: dispatch.expires_at,
            })
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  const accept = useCallback(async () => {
    if (!incomingDispatch || !driverId) return false
    const result = await acceptBooking(
      incomingDispatch.id,
      incomingDispatch.trip_id,
      driverId,
    )
    setIncomingDispatch(null)
    return result.success
  }, [incomingDispatch, driverId])

  const decline = useCallback(async () => {
    if (!incomingDispatch) return
    await db.tripDispatch()
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', incomingDispatch.id)
    setIncomingDispatch(null)
  }, [incomingDispatch])

  return { incomingDispatch, accept, decline }
}
