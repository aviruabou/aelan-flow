// src/stores/bookingStore.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { create } from 'zustand'
import type { BookingPhase, BookingDriver } from '@/hooks/useBooking'
import type { Database } from '@/types/database'

type Trip = Database['public']['Tables']['trips']['Row']

interface BookingState {
  phase:   BookingPhase
  trip:    Trip | null
  driver:  BookingDriver | null
  setPhase:  (phase: BookingPhase) => void
  setTrip:   (trip: Trip | null) => void
  setDriver: (driver: BookingDriver | null) => void
  reset:     () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  phase:     'idle',
  trip:      null,
  driver:    null,
  setPhase:  (phase)  => set({ phase }),
  setTrip:   (trip)   => set({ trip }),
  setDriver: (driver) => set({ driver }),
  reset:     ()       => set({ phase: 'idle', trip: null, driver: null }),
}))
