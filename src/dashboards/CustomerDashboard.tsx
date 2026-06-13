// src/dashboards/CustomerDashboard.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { useState, useEffect } from 'react'
import { TaxiMap } from '@/components/map/TaxiMap'
import { Badge, Button, Avatar, Modal, StatCard, BottomNav, Header, EmptyState, Spinner, C } from '@/components/ui'
import { useAuth, signOut } from '@/hooks/useAuth'
import { useLiveDrivers, useTripDriverLocation } from '@/hooks/useLiveDrivers'
import { useBooking } from '@/hooks/useBooking'
import { useCustomerTrips } from '@/hooks/useTrips'
import { useNotifications } from '@/hooks/useNotifications'
import { db } from '@/lib/supabase'
import type { LiveDriver } from '@/hooks/useLiveDrivers'

function SOSModal({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [sent, setSent] = useState(false)
  const trigger = async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await db.sosAlerts().insert({ user_id: userId, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      setSent(true)
    }, () => setSent(true))
  }
  return (
    <Modal title="SOS Emergency" onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🆘</div>
        {sent ? (
          <>
            <div style={{ color: C.emerald, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Alert Sent</div>
            <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 20 }}>Your location has been shared with HTN administrators.</div>
            <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
          </>
        ) : (
          <>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Send Emergency Alert</div>
            <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>This will share your GPS location with HTN administrators immediately.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
              <Button variant="danger" fullWidth onClick={trigger}>Send SOS</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function DriverProfileModal({ driver, onClose, onRequest }: { driver: LiveDriver; onClose: () => void; onRequest: () => void }) {
  const initials = driver.full_name.split(' ').map(n => n[0]).join('')
  return (
    <Modal title="Driver Profile" onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Avatar initials={initials} src={driver.photo_url} size={72} color={driver.status === 'online' ? C.emerald : C.gold} />
        <div style={{ color: C.text, fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginTop: 12 }}>{driver.full_name}</div>
        <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 10 }}>{driver.plate_number}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Badge color={driver.verified ? 'emerald' : 'crimson'}>{driver.verified ? '✓ Verified' : 'Unverified'}</Badge>
          <Badge color={driver.status === 'online' ? 'emerald' : 'gold'}>{driver.status}</Badge>
        </div>
      </div>
      <div style={{ background: C.elevated, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginBottom: 20 }}>
        {[
          { label: 'Rating', value: `⭐ ${driver.rating_avg.toFixed(1)} / 5.0` },
          { label: 'Total Trips', value: driver.total_trips.toLocaleString() },
          { label: 'Distance', value: driver.distance_m < 1000 ? `${Math.round(driver.distance_m)} m away` : `${(driver.distance_m / 1000).toFixed(1)} km away` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textMuted, fontSize: 13 }}>{label}</span>
            <span style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
        <Button variant="primary" fullWidth onClick={onRequest} disabled={driver.status !== 'online'}>
          {driver.status === 'online' ? 'Request Taxi' : 'Not Available'}
        </Button>
      </div>
    </Modal>
  )
}

function BookingModal({ phase, driver, onCancel, onDone }: { phase: string; driver: any; onCancel: () => void; onDone: () => void }) {
  const icons: Record<string, string> = { requesting: '🔍', dispatching: '📡', accepted: '✅', driver_en_route: '🚖', in_progress: '🛣️', no_drivers: '😔', cancelled: '❌', error: '⚠️' }
  const titles: Record<string, string> = { requesting: 'Finding Taxis', dispatching: 'Notifying Drivers', accepted: 'Driver Confirmed', driver_en_route: 'Driver En Route', in_progress: 'Trip In Progress', no_drivers: 'No Drivers Available', cancelled: 'Booking Cancelled', error: 'Something went wrong' }
  const isDone = ['no_drivers', 'cancelled', 'completed', 'error'].includes(phase)
  return (
    <Modal title="Booking" onClose={onDone}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{icons[phase] ?? '🚖'}</div>
        <div style={{ color: C.text, fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>{titles[phase] ?? phase}</div>
        {driver && (phase === 'accepted' || phase === 'driver_en_route' || phase === 'in_progress') && (
          <div style={{ color: C.emerald, fontSize: 14 }}>{driver.full_name} • {driver.plate_number}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {!isDone && phase !== 'in_progress' && (
          <Button variant="danger" fullWidth onClick={onCancel}>Cancel Booking</Button>
        )}
        {isDone && <Button variant="primary" fullWidth onClick={onDone}>Close</Button>}
        {phase === 'in_progress' && <Button variant="secondary" fullWidth onClick={onDone}>Dismiss</Button>}
      </div>
    </Modal>
  )
}

export function CustomerDashboard() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('map')
  const [customerPos, setCustomerPos] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<LiveDriver | null>(null)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showSOS, setShowSOS] = useState(false)

  const { drivers, isLoading: driversLoading } = useLiveDrivers(customerPos?.lat ?? -9.4333, customerPos?.lng ?? 160.052)
  const { data: trips, isLoading: tripsLoading } = useCustomerTrips(profile?.id ?? null)
  const { unreadCount } = useNotifications(profile?.id ?? null)
  const { phase, driver, isActive, requestTaxi, cancelBooking, reset } = useBooking(profile?.id ?? null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setCustomerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCustomerPos({ lat: -9.4333, lng: 160.052 }),
      { enableHighAccuracy: true }
    )
  }, [])

  const handleRequest = () => {
    if (!customerPos) return
    setShowDriverModal(false)
    requestTaxi({ pickupLat: customerPos.lat, pickupLng: customerPos.lng, pickupAddress: 'Current Location' })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.obsidian }}>
      <Header role="customer" userName={profile?.full_name ?? ''} onSignOut={signOut}
        rightSlot={
          <button onClick={() => setShowSOS(true)} style={{ background: C.crimson, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>🆘 SOS</button>
        }
      />

      <div className="scroll-y" style={{ flex: 1, padding: 16 }}>
        {tab === 'map' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Nearby Taxis</div>
                <div style={{ color: C.textMuted, fontSize: 13 }}>{driversLoading ? 'Searching…' : `${drivers.filter(d => d.status === 'online').length} available`}</div>
              </div>
              <Badge color="sky">📍 Honiara</Badge>
            </div>
            <div style={{ height: 300, marginBottom: 16 }}>
              <TaxiMap drivers={drivers} selectedDriverId={selectedDriver?.driver_id ?? null}
                onDriverClick={d => { setSelectedDriver(d); if (d) setShowDriverModal(true) }}
                customerPosition={customerPos}
              />
            </div>
            {driversLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              : drivers.length === 0 ? <EmptyState icon="🚖" title="No taxis online" body="Check back soon." />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {drivers.map(d => (
                    <div key={d.driver_id} onClick={() => { setSelectedDriver(d); setShowDriverModal(true) }}
                      style={{ background: C.surface, border: `1px solid ${selectedDriver?.driver_id === d.driver_id ? C.gold + '66' : C.border}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar initials={d.full_name.split(' ').map(n => n[0]).join('')} src={d.photo_url} size={42} color={d.status === 'online' ? C.emerald : C.gold} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{d.full_name}</div>
                        <div style={{ color: C.textMuted, fontSize: 12 }}>{d.plate_number} • ⭐ {d.rating_avg.toFixed(1)}</div>
                      </div>
                      <Badge color={d.status === 'online' ? 'emerald' : 'gold'}>{d.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {tab === 'trips' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Trip History</div>
            {tripsLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              : !trips?.length ? <EmptyState icon="🚗" title="No trips yet" body="Book your first taxi from the Map tab." />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {trips.map(t => (
                    <div key={t.id} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: C.textMuted, fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString()}</span>
                        <Badge color={t.status === 'completed' ? 'emerald' : t.status.startsWith('cancelled') ? 'crimson' : 'gold'}>{t.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div style={{ color: C.text, fontSize: 13 }}>📍 {t.pickup_address ?? 'Pickup'}</div>
                      {t.dropoff_address && <div style={{ color: C.text, fontSize: 13 }}>🏁 {t.dropoff_address}</div>}
                      {t.final_fare_sbd && <div style={{ color: C.gold, fontWeight: 700, fontSize: 14, marginTop: 4 }}>SBD {t.final_fare_sbd}</div>}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {tab === 'account' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>My Account</div>
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <Avatar initials={profile?.full_name?.split(' ').map(n => n[0]).join('') ?? '?'} size={60} />
                <div>
                  <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{profile?.full_name}</div>
                  <div style={{ color: C.textMuted, fontSize: 13 }}>{profile?.phone}</div>
                  <div style={{ marginTop: 6 }}><Badge color={profile?.status === 'active' ? 'emerald' : 'gold'}>{profile?.status?.replace(/_/g, ' ')}</Badge></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard label="Total Trips" value={(trips?.filter(t => t.status === 'completed').length ?? 0).toString()} color={C.sky} />
                <StatCard label="Subscription" value={profile?.status === 'active' ? 'Active' : 'Inactive'} color={profile?.status === 'active' ? C.emerald : C.crimson} />
              </div>
            </div>
            <Button variant="danger" fullWidth onClick={signOut}>Sign Out</Button>
          </div>
        )}
      </div>

      <BottomNav
        tabs={[{ id: 'map', label: '🗺️ Map' }, { id: 'trips', label: '🚗 Trips' }, { id: 'account', label: `👤 Account${unreadCount > 0 ? ` (${unreadCount})` : ''}` }]}
        active={tab} onChange={setTab}
      />

      {showDriverModal && selectedDriver && (
        <DriverProfileModal driver={selectedDriver} onClose={() => setShowDriverModal(false)} onRequest={handleRequest} />
      )}
      {isActive && <BookingModal phase={phase} driver={driver} onCancel={cancelBooking} onDone={reset} />}
      {showSOS && profile && <SOSModal userId={profile.id} onClose={() => setShowSOS(false)} />}
    </div>
  )
}
