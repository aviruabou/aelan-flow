// src/lib/supabase.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
    storageKey:        'htn-auth-session',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-app-name':    'HoniaraTaxiNetwork',
      'x-app-version': import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    },
  },
})

// ─── Typed helper shortcuts ────────────────────────────────

export const db = {
  users:               () => supabase.from('users'),
  drivers:             () => supabase.from('drivers'),
  taxiOwners:          () => supabase.from('taxi_owners'),
  vehicles:            () => supabase.from('vehicles'),
  vehicleAssignments:  () => supabase.from('vehicle_assignments'),
  licences:            () => supabase.from('licences'),
  subscriptions:       () => supabase.from('subscriptions'),
  trips:               () => supabase.from('trips'),
  tripDispatch:        () => supabase.from('trip_dispatch'),
  tripEvents:          () => supabase.from('trip_events'),
  liveLocations:       () => supabase.from('live_locations'),
  ratings:             () => supabase.from('ratings'),
  notifications:       () => supabase.from('notifications'),
  documents:           () => supabase.from('documents'),
  signedAgreements:    () => supabase.from('signed_agreements'),
  payments:            () => supabase.from('payments'),
  auditLogs:           () => supabase.from('audit_logs'),
  favouriteDrivers:    () => supabase.from('favourite_drivers'),
  sosAlerts:           () => supabase.from('sos_alerts'),
}

// ─── Storage bucket helpers ────────────────────────────────

export const storage = {
  documents:     () => supabase.storage.from('documents'),
  driverPhotos:  () => supabase.storage.from('driver-photos'),
  vehiclePhotos: () => supabase.storage.from('vehicle-photos'),
  agreements:    () => supabase.storage.from('agreements'),
}

// ─── Signed URL helper (for private documents, 15 min expiry) ─

export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 900)
  if (error) throw error
  return data.signedUrl
}

// ─── RPC helpers ──────────────────────────────────────────

export async function findNearestDrivers(lat: number, lng: number, limit = 5) {
  const { data, error } = await supabase.rpc('find_nearest_drivers', {
    p_lat:   lat,
    p_lng:   lng,
    p_limit: limit,
  })
  if (error) throw error
  return data
}

export async function acceptBooking(
  dispatchId: string,
  tripId: string,
  driverId: string,
) {
  const { data, error } = await supabase.rpc('accept_booking', {
    p_dispatch_id: dispatchId,
    p_trip_id:     tripId,
    p_driver_id:   driverId,
  })
  if (error) throw error
  return data as { success: boolean; message: string }
}
