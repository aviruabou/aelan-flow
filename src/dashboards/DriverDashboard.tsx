// src/dashboards/DriverDashboard.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { useState, useEffect } from 'react'
import { Badge, Button, Avatar, StatCard, BottomNav, Header, EmptyState, Spinner, C } from '@/components/ui'
import { useAuth, signOut } from '@/hooks/useAuth'
import { useDriverGPS } from '@/hooks/useDriverGPS'
import { useDriverDispatch } from '@/hooks/useBooking'
import { useDriverTrips } from '@/hooks/useTrips'
import { db } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'

type DriverStatus = Database['public']['Enums']['driver_status']

// ─── Incoming Request Modal ───────────────────────────────

function IncomingRequestModal({ dispatch, onAccept, onDecline }: {
  dispatch: { id: string; trip_id: string; expires_at: string }
  onAccept:  () => void
  onDecline: () => void
}) {
  const initialSec = Math.max(0, Math.round((new Date(dispatch.expires_at).getTime() - Date.now()) / 1000))
  const [sec, setSec] = useState(initialSec)

  // FIX: use useEffect (not useState) for side effects with cleanup
  useEffect(() => {
    if (sec <= 0) { onDecline(); return }
    const t = setInterval(() => {
      setSec(s => {
        if (s <= 1) { clearInterval(t); onDecline(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="animate-slide-up" style={{ background: C.surface, border: `1px solid ${C.gold}66`, borderRadius: 20, width: '100%', maxWidth: 480, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: '1px', marginBottom: 4 }}>🔔 NEW BOOKING REQUEST</div>
            <div style={{ color: C.text, fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Incoming Ride</div>
          </div>
          <div style={{ background: 'rgba(229,62,62,0.15)', border: `1px solid ${C.crimson}44`, borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ color: C.crimson, fontSize: 22, fontWeight: 800 }}>{sec}</div>
            <div style={{ color: C.crimson, fontSize: 10 }}>secs</div>
          </div>
        </div>
        <div style={{ background: C.elevated, borderRadius: 12, padding: 14, marginBottom: 20, border: `1px solid ${C.border}` }}>
          <div style={{ color: C.textMuted, fontSize: 12 }}>Trip ID: {dispatch.trip_id.slice(0, 8)}…</div>
          <div style={{ color: C.text, fontSize: 13, marginTop: 4 }}>A customer is waiting nearby. Accept to confirm the booking.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Button variant="danger"  fullWidth onClick={onDecline}>✕ Decline</Button>
          <Button variant="success" fullWidth onClick={onAccept}>✓ Accept</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────

export function DriverDashboard() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab]               = useState('home')
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('offline')

  // Fetch driver record
  const { data: driverRecord, isLoading } = useQuery({
    queryKey: ['driver-record', profile?.id],
    queryFn:  async () => {
      const { data } = await db.drivers().select('*').eq('user_id', profile!.id).single()
      return data
    },
    enabled: !!profile?.id,
  })

  // Sync local status state with DB on first load
  useEffect(() => {
    if (driverRecord?.status && driverRecord.status !== 'pending_verification') {
      setDriverStatus(driverRecord.status as DriverStatus)
    }
  }, [driverRecord?.status])

  // Update status in DB
  const updateStatus = useMutation({
    mutationFn: async (status: DriverStatus) => {
      const { error } = await db.drivers().update({ status }).eq('user_id', profile!.id)
      if (error) throw error
    },
    onSuccess: (_data, status) => {
      setDriverStatus(status)
      qc.invalidateQueries({ queryKey: ['driver-record', profile?.id] })
    },
  })

  // GPS transmission (only when online or busy)
  useDriverGPS({
    driverId:  driverRecord?.id ?? null,
    vehicleId: driverRecord?.current_vehicle_id ?? null,
    status:    driverStatus,
  })

  // Incoming dispatch listener
  const { incomingDispatch, accept, decline } = useDriverDispatch(driverRecord?.id ?? null)

  // Trip history
  const { data: trips, isLoading: tripsLoading } = useDriverTrips(driverRecord?.id ?? null)

  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    online:  { color: C.emerald,  label: 'Online',   icon: '🟢' },
    busy:    { color: C.gold,     label: 'On Trip',  icon: '🟡' },
    offline: { color: C.textDim,  label: 'Offline',  icon: '⚫' },
  }
  const sc = statusConfig[driverStatus] ?? statusConfig.offline

  if (isLoading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.obsidian }}>
        <Spinner size={40} />
      </div>
    )
  }

  // Pending verification screen
  if (!driverRecord || driverRecord.status === 'pending_verification') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.obsidian }}>
        <Header role="driver" userName={profile?.full_name ?? ''} onSignOut={signOut} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 340 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🏢</div>
            <div style={{ color: C.text, fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>
              Office Visit Required
            </div>
            <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 20 }}>
              Your account is pending verification. Please visit the HTN office with your original Driver's Licence to be activated.
            </div>
            <div style={{ background: C.elevated, border: `1px solid ${C.gold}44`, borderRadius: 12, padding: 16 }}>
              <div style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>⚠ Status: Pending Verification</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.obsidian }}>
      <Header
        role="driver"
        userName={profile?.full_name ?? ''}
        onSignOut={signOut}
        rightSlot={
          <div style={{
            background: `${sc.color}22`, border: `1px solid ${sc.color}44`,
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, fontWeight: 700, color: sc.color,
          }}>
            {sc.icon} {sc.label}
          </div>
        }
      />

      <div className="scroll-y" style={{ flex: 1, padding: 16 }}>

        {tab === 'home' && (
          <div>
            {/* Status toggle */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>
                Driver Status
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['online', 'offline'] as DriverStatus[]).map(s => {
                  const sc2 = statusConfig[s]
                  const isActive = driverStatus === s
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus.mutate(s)}
                      disabled={updateStatus.isPending}
                      style={{
                        background:    isActive ? `${sc2.color}22` : 'transparent',
                        border:        `1.5px solid ${isActive ? sc2.color : C.border}`,
                        color:         isActive ? sc2.color : C.textMuted,
                        borderRadius:  10, padding: '12px 8px',
                        cursor:        'pointer', fontSize: 13, fontWeight: 700,
                        transition:    'all 0.15s',
                      }}
                    >
                      {sc2.icon} {sc2.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <StatCard label="Rating"       value={`${driverRecord.rating_avg?.toFixed(1) ?? '0.0'} ⭐`} color={C.gold}    />
              <StatCard label="Total Trips"  value={driverRecord.total_trips?.toLocaleString() ?? '0'}      color={C.sky}     />
              <StatCard label="Total Earned" value={`SBD ${driverRecord.total_earnings?.toFixed(0) ?? '0'}`} color={C.emerald} />
              <StatCard label="Licence"      value={driverRecord.licence_verified ? 'Valid ✓' : 'Pending'}  color={driverRecord.licence_verified ? C.emerald : C.gold} />
            </div>

            {/* Status banner */}
            <div style={{
              background: driverStatus === 'online' ? 'rgba(0,200,150,0.05)' : C.elevated,
              border: `1px solid ${driverStatus === 'online' ? `${C.emerald}33` : C.border}`,
              borderRadius: 16, padding: 20, textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>
                {driverStatus === 'online' ? '📡' : driverStatus === 'busy' ? '🚗' : '😴'}
              </div>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>
                {driverStatus === 'online'  ? 'Waiting for booking requests…'         :
                 driverStatus === 'busy'    ? 'Currently on a trip'                    :
                                             'You are offline — go Online to receive bookings'}
              </div>
              {driverStatus === 'online' && (
                <div style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>
                  Your GPS location is being transmitted
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'trips' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
              Trip History
            </div>
            {tripsLoading
              ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              : !trips?.length
                ? <EmptyState icon="🚗" title="No trips yet" body="Go online to start receiving bookings." />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {trips.map(t => (
                      <div key={t.id} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: C.textMuted, fontSize: 12 }}>
                            {new Date(t.created_at).toLocaleDateString()}
                          </span>
                          <Badge color={t.status === 'completed' ? 'emerald' : 'crimson'}>
                            {t.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div style={{ color: C.text, fontSize: 13 }}>📍 {t.pickup_address ?? 'Pickup location'}</div>
                        {t.final_fare_sbd && (
                          <div style={{ color: C.emerald, fontWeight: 700, marginTop: 4 }}>SBD {t.final_fare_sbd}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>
              Driver Profile
            </div>
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Avatar
                  initials={profile?.full_name?.split(' ').map(n => n[0]).join('') ?? '?'}
                  src={driverRecord.photo_url}
                  size={64}
                  color={C.emerald}
                />
                <div>
                  <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>
                    {profile?.full_name}
                  </div>
                  <div style={{ color: C.textMuted, fontSize: 13 }}>{profile?.phone}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <Badge color="gold">Driver</Badge>
                    {driverRecord.licence_verified && <Badge color="emerald">✓ Verified</Badge>}
                  </div>
                </div>
              </div>
              {[
                { label: 'Licence Number', value: driverRecord.licence_number || '—' },
                { label: 'Licence Expiry', value: driverRecord.licence_expiry ? new Date(driverRecord.licence_expiry).toLocaleDateString() : '—' },
                { label: 'Licence Status', value: driverRecord.licence_verified ? 'Verified ✓' : 'Pending verification' },
                { label: 'Member Since',   value: new Date(driverRecord.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.textMuted, fontSize: 13 }}>{label}</span>
                  <span style={{ color: C.text,      fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <Button variant="danger" fullWidth onClick={signOut}>Sign Out</Button>
          </div>
        )}

      </div>

      <BottomNav
        tabs={[
          { id: 'home',    label: '🏠 Home'    },
          { id: 'trips',   label: '🚗 Trips'   },
          { id: 'profile', label: '👤 Profile' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {incomingDispatch && (
        <IncomingRequestModal
          dispatch={incomingDispatch}
          onAccept={async () => {
            const ok = await accept()
            if (ok) setDriverStatus('busy')
          }}
          onDecline={decline}
        />
      )}
    </div>
  )
}
