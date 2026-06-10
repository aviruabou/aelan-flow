// src/hooks/useLiveDrivers.ts
// MereSimi Studios Ltd — Honiara Taxi Network
// Combines:
//   1. Initial fetch of nearby drivers (React Query, refreshes every 60s)
//   2. Realtime position updates via Supabase channel (INSERT on live_locations)

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, db } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────

export interface LiveDriver {
  driver_id:    string
  user_id:      string
  vehicle_id:   string | null
  latitude:     number
  longitude:    number
  heading:      number | null
  distance_m:   number
  // joined from users / drivers / vehicles
  full_name:    string
  plate_number: string
  rating_avg:   number
  total_trips:  number
  photo_url:    string | null
  status:       string
  fcm_token:    string | null
  verified:     boolean
}

interface LivePosition {
  latitude:  number
  longitude: number
  heading:   number | null
}

// ─── Fetch via RPC ────────────────────────────────────────

async function fetchNearbyDrivers(
  lat: number,
  lng: number,
): Promise<LiveDriver[]> {
  const { data, error } = await supabase.rpc('find_nearest_drivers', {
    p_lat:   lat,
    p_lng:   lng,
    p_limit: 20,
  })
  if (error) throw error

  // Enrich with driver profile data
  if (!data || data.length === 0) return []

  const driverIds = data.map((d: { driver_id: string }) => d.driver_id)

  const { data: profiles } = await db.drivers()
    .select(`
      id,
      rating_avg,
      total_trips,
      photo_url,
      status,
      current_vehicle_id,
      users!inner ( full_name, is_verified ),
      vehicles ( plate_number )
    `)
    .in('id', driverIds)

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p]),
  )

  return data.map((d: any) => {
    const profile = profileMap.get(d.driver_id) as any
    return {
      driver_id:    d.driver_id,
      user_id:      d.user_id,
      vehicle_id:   d.vehicle_id,
      latitude:     d.latitude,
      longitude:    d.longitude,
      heading:      null,
      distance_m:   d.distance_m,
      full_name:    profile?.users?.full_name   ?? 'Driver',
      plate_number: profile?.vehicles?.plate_number ?? '–',
      rating_avg:   profile?.rating_avg         ?? 0,
      total_trips:  profile?.total_trips        ?? 0,
      photo_url:    profile?.photo_url          ?? null,
      status:       profile?.status             ?? 'online',
      fcm_token:    d.fcm_token,
      verified:     profile?.users?.is_verified ?? false,
    } satisfies LiveDriver
  })
}

// ─── Main hook ────────────────────────────────────────────

export function useLiveDrivers(centerLat: number, centerLng: number) {
  // Live positions map: driver_id → position
  const [livePositions, setLivePositions] = useState<
    Map<string, LivePosition>
  >(new Map())

  // Initial + periodic fetch
  const { data: baseDrivers = [], isLoading, error } = useQuery({
    queryKey:        ['nearby-drivers', centerLat, centerLng],
    queryFn:         () => fetchNearbyDrivers(centerLat, centerLng),
    refetchInterval: 60_000,
    staleTime:       30_000,
    enabled:         !!centerLat && !!centerLng,
  })

  // Realtime position updates
  useEffect(() => {
    const channel = supabase
      .channel('live-driver-positions')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'live_locations',
        },
        (payload) => {
          const loc = payload.new as {
            driver_id: string
            latitude:  number
            longitude: number
            heading:   number | null
          }
          setLivePositions((prev) => {
            const next = new Map(prev)
            next.set(loc.driver_id, {
              latitude:  loc.latitude,
              longitude: loc.longitude,
              heading:   loc.heading,
            })
            return next
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Merge base data with live positions
  const drivers: LiveDriver[] = baseDrivers.map((d) => {
    const live = livePositions.get(d.driver_id)
    return live
      ? { ...d, latitude: live.latitude, longitude: live.longitude, heading: live.heading }
      : d
  })

  return { drivers, isLoading, error }
}

// ─── Hook: track a single active trip's driver ────────────

export function useTripDriverLocation(driverId: string | null) {
  const [position, setPosition] = useState<LivePosition | null>(null)

  useEffect(() => {
    if (!driverId) return

    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'live_locations',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          const loc = payload.new as {
            latitude:  number
            longitude: number
            heading:   number | null
          }
          setPosition({
            latitude:  loc.latitude,
            longitude: loc.longitude,
            heading:   loc.heading,
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [driverId])

  return position
}
