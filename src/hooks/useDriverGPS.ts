// src/hooks/useDriverGPS.ts
// MereSimi Studios Ltd — Honiara Taxi Network
// Transmits driver GPS coordinates to Supabase live_locations table
// Only runs when driver status is 'online' or 'busy'

import { useEffect, useRef, useCallback } from 'react'
import { db } from '@/lib/supabase'
import type { Database } from '@/types/database'

type DriverStatus = Database['public']['Enums']['driver_status']

const GPS_INTERVAL_MS = Number(import.meta.env.VITE_GPS_INTERVAL_MS ?? 20_000)

interface UseDriverGPSOptions {
  driverId:  string | null
  vehicleId: string | null
  status:    DriverStatus
}

export function useDriverGPS({ driverId, vehicleId, status }: UseDriverGPSOptions) {
  const watchIdRef        = useRef<number | null>(null)
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastCoordsRef     = useRef<GeolocationCoordinates | null>(null)
  const isActiveRef       = useRef(false)

  const isActive = status === 'online' || status === 'busy'

  // ─── Transmit one location record ───────────────────────

  const transmit = useCallback(async (coords: GeolocationCoordinates) => {
    if (!driverId) return
    try {
      const { error } = await db.liveLocations().insert({
        driver_id:  driverId,
        vehicle_id: vehicleId ?? undefined,
        latitude:   coords.latitude,
        longitude:  coords.longitude,
        heading:    coords.heading   ?? undefined,
        speed_kmh:  coords.speed != null ? coords.speed * 3.6 : undefined,
        accuracy_m: coords.accuracy  ?? undefined,
      })
      if (error) console.error('[GPS] Transmit error:', error.message)
    } catch (err) {
      console.error('[GPS] Unexpected error:', err)
    }
  }, [driverId, vehicleId])

  // ─── Start / stop based on driver status ────────────────

  useEffect(() => {
    if (!isActive || !driverId) {
      // Stop GPS
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isActiveRef.current = false
      return
    }

    if (isActiveRef.current) return   // already running
    isActiveRef.current = true

    // Watch position (updates lastCoordsRef on every GPS event)
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => { lastCoordsRef.current = pos.coords },
        (err) => console.error('[GPS] Watch error:', err.message),
        {
          enableHighAccuracy: true,
          maximumAge:         5_000,
          timeout:            10_000,
        },
      )

      // Transmit on interval (not on every GPS event — saves bandwidth)
      intervalRef.current = setInterval(() => {
        if (lastCoordsRef.current) {
          transmit(lastCoordsRef.current)
        }
      }, GPS_INTERVAL_MS)

      // Transmit immediately on first fix
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lastCoordsRef.current = pos.coords
          transmit(pos.coords)
        },
        (err) => console.error('[GPS] Initial fix error:', err.message),
        { enableHighAccuracy: true, timeout: 15_000 },
      )
    } else {
      console.warn('[GPS] Geolocation not supported in this environment.')
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isActiveRef.current = false
    }
  }, [isActive, driverId, transmit])

  return {
    isTransmitting: isActive,
    lastCoords: lastCoordsRef.current,
  }
}
