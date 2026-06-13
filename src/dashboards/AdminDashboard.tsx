// src/dashboards/AdminDashboard.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { useState } from 'react'
import { Badge, Button, Avatar, Modal, StatCard, BottomNav, Header, EmptyState, Spinner, C } from '@/components/ui'
import { useAuth, signOut } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function AdminDashboard() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('overview')
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, drivers, vehicles, trips, pendingDrivers, pendingVehicles] = await Promise.all([
        db.users().select('id', { count: 'exact', head: true }),
        db.drivers().select('id', { count: 'exact', head: true }).eq('status', 'online'),
        db.vehicles().select('id', { count: 'exact', head: true }).eq('status', 'active'),
        db.trips().select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400000).toISOString()),
        db.drivers().select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        db.vehicles().select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
      ])
      return {
        totalUsers:      users.count ?? 0,
        onlineDrivers:   drivers.count ?? 0,
        activeVehicles:  vehicles.count ?? 0,
        tripsToday:      trips.count ?? 0,
        pendingDrivers:  pendingDrivers.count ?? 0,
        pendingVehicles: pendingVehicles.count ?? 0,
      }
    },
    refetchInterval: 30_000,
  })

  // Pending drivers
  const { data: pendingDriversList, isLoading: pdLoading } = useQuery({
    queryKey: ['admin-pending-drivers'],
    queryFn: async () => {
      const { data } = await db.drivers()
        .select('*, users!inner(full_name, phone, email)')
        .eq('status', 'pending_verification')
        .order('created_at', { ascending: true })
      return data ?? []
    },
  })

  // All drivers
  const { data: allDrivers, isLoading: driversLoading } = useQuery({
    queryKey: ['admin-all-drivers'],
    queryFn: async () => {
      const { data } = await db.drivers()
        .select('*, users!inner(full_name, phone, status, is_verified)')
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
    enabled: tab === 'drivers',
  })

  // All vehicles
  const { data: allVehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['admin-all-vehicles'],
    queryFn: async () => {
      const { data } = await db.vehicles()
        .select('*, taxi_owners(user_id, users(full_name)), drivers(user_id, users(full_name))')
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
    enabled: tab === 'vehicles',
  })

  // Audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data } = await db.auditLogs()
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })
        .limit(20)
      return data ?? []
    },
    enabled: tab === 'overview',
  })

  // Verify driver
  const verifyDriver = useMutation({
    mutationFn: async (driverId: string) => {
      await db.drivers().update({
        licence_verified:    true,
        licence_verified_by: profile!.id,
        licence_verified_at: new Date().toISOString(),
        status:              'offline',
      }).eq('id', driverId)
      // Log audit
      await db.auditLogs().insert({ actor_id: profile!.id, action: 'driver_verified', target_type: 'driver', target_id: driverId })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-drivers'] })
      qc.invalidateQueries({ queryKey: ['admin-all-drivers'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedDriver(null)
    },
  })

  // Verify vehicle
  const verifyVehicle = useMutation({
    mutationFn: async (vehicleId: string) => {
      await db.vehicles().update({
        taxi_licence_verified: true,
        licence_verified_by:   profile!.id,
        licence_verified_at:   new Date().toISOString(),
        status:                'active',
        is_visible_on_map:     true,
      }).eq('id', vehicleId)
      await db.auditLogs().insert({ actor_id: profile!.id, action: 'vehicle_verified', target_type: 'vehicle', target_id: vehicleId })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-vehicles'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      setSelectedVehicle(null)
    },
  })

  // Suspend user
  const suspendUser = useMutation({
    mutationFn: async (userId: string) => {
      await db.users().update({ status: 'suspended' }).eq('id', userId)
      await db.auditLogs().insert({ actor_id: profile!.id, action: 'user_suspended', target_type: 'user', target_id: userId })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-drivers'] })
    },
  })

  const totalPending = (stats?.pendingDrivers ?? 0) + (stats?.pendingVehicles ?? 0)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.obsidian }}>
      <Header role="admin" userName={profile?.full_name ?? ''} onSignOut={signOut} />

      <div className="scroll-y" style={{ flex: 1, padding: 16 }}>

        {tab === 'overview' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Analytics Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <StatCard label="Total Users"    value={(stats?.totalUsers ?? 0).toLocaleString()} color={C.sky}     icon="👥" />
              <StatCard label="Online Drivers" value={(stats?.onlineDrivers ?? 0).toString()}     color={C.emerald} icon="🚗" />
              <StatCard label="Active Vehicles" value={(stats?.activeVehicles ?? 0).toString()}   color={C.gold}    icon="🚌" />
              <StatCard label="Trips Today"    value={(stats?.tripsToday ?? 0).toString()}        color={C.sky}     icon="📊" />
            </div>

            {/* Pending verifications */}
            {totalPending > 0 && (
              <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>Pending Verifications</div>
                  <Badge color="crimson">{totalPending} pending</Badge>
                </div>
                {pdLoading ? <Spinner /> : (pendingDriversList ?? []).map((d: any) => (
                  <div key={d.id} onClick={() => setSelectedDriver(d)}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{d.users?.full_name}</div>
                      <div style={{ color: C.textMuted, fontSize: 12 }}>Driver • {d.users?.phone}</div>
                    </div>
                    <Badge color="sky">Verify</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Audit log */}
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ color: C.text, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Audit Log</div>
              {(auditLogs ?? []).map((log: any, i: number) => (
                <div key={log.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < (auditLogs?.length ?? 0) - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.action.includes('verified') ? C.emerald : log.action.includes('suspended') || log.action.includes('expired') ? C.crimson : C.sky, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{log.action.replace(/_/g, ' ')}</div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>{log.users?.full_name ?? 'System'} • {new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {!auditLogs?.length && <EmptyState icon="📋" title="No audit logs yet" />}
            </div>
          </div>
        )}

        {tab === 'drivers' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Driver Management</div>
            {driversLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              : !allDrivers?.length ? <EmptyState icon="🚗" title="No drivers registered" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allDrivers.map((d: any) => (
                    <div key={d.id} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <Avatar initials={d.users?.full_name?.split(' ').map((n: string) => n[0]).join('') ?? '?'} size={40} color={d.licence_verified ? C.emerald : C.gold} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{d.users?.full_name}</div>
                          <div style={{ color: C.textMuted, fontSize: 12 }}>{d.users?.phone} • ⭐ {d.rating_avg?.toFixed(1)} • {d.total_trips} trips</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Badge color={d.licence_verified ? 'emerald' : 'gold'}>{d.licence_verified ? 'Verified' : 'Unverified'}</Badge>
                          <Badge color={d.status === 'online' ? 'emerald' : d.status === 'offline' ? 'muted' : d.status === 'pending_verification' ? 'gold' : 'crimson'}>{d.status.replace(/_/g, ' ')}</Badge>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!d.licence_verified && d.status === 'pending_verification' && (
                          <Button variant="success" size="sm" onClick={() => setSelectedDriver(d)}>✓ Verify</Button>
                        )}
                        {d.users?.status !== 'suspended' && (
                          <Button variant="danger" size="sm" onClick={() => suspendUser.mutate(d.user_id)}>Suspend</Button>
                        )}
                        {d.users?.status === 'suspended' && (
                          <Badge color="crimson">Suspended</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {tab === 'vehicles' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Vehicle Management</div>
            {vehiclesLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              : !allVehicles?.length ? <EmptyState icon="🚌" title="No vehicles registered" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {allVehicles.map((v: any) => (
                    <div key={v.id} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ color: C.text, fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{v.plate_number}</div>
                        <Badge color={v.status === 'active' ? 'emerald' : v.status === 'pending_verification' ? 'gold' : 'crimson'}>{v.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>{v.make} {v.model} ({v.year}) • {v.colour}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: C.textMuted }}>Owner: <span style={{ color: C.text }}>{(v.taxi_owners as any)?.users?.full_name ?? '—'}</span></div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>Expires: <span style={{ color: C.text }}>{new Date(v.taxi_licence_expiry).toLocaleDateString()}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {v.status === 'pending_verification' && (
                          <Button variant="success" size="sm" onClick={() => setSelectedVehicle(v)}>✓ Verify</Button>
                        )}
                        {v.status === 'active' && (
                          <Button variant="danger" size="sm" onClick={async () => {
                            await db.vehicles().update({ status: 'suspended', is_visible_on_map: false }).eq('id', v.id)
                            qc.invalidateQueries({ queryKey: ['admin-all-vehicles'] })
                          }}>Deactivate</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>

      <BottomNav
        tabs={[
          { id: 'overview',  label: '📊 Overview' },
          { id: 'drivers',   label: '🚗 Drivers' },
          { id: 'vehicles',  label: '🚌 Vehicles' },
        ]}
        active={tab} onChange={setTab}
      />

      {/* Driver Verification Modal */}
      {selectedDriver && (
        <Modal title={`Verify Driver: ${selectedDriver.users?.full_name}`} onClose={() => setSelectedDriver(null)}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: C.elevated, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              {[
                { label: 'Name',    value: selectedDriver.users?.full_name },
                { label: 'Phone',   value: selectedDriver.users?.phone },
                { label: 'Licence', value: selectedDriver.licence_number || 'Not provided' },
                { label: 'Expiry',  value: selectedDriver.licence_expiry ? new Date(selectedDriver.licence_expiry).toLocaleDateString() : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.textMuted, fontSize: 13 }}>{label}</span>
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.elevated, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 10, fontWeight: 600 }}>VERIFICATION CHECKLIST</div>
              {['Original licence presented at office', 'Document physically inspected', 'Licence scanned and uploaded', 'Driver photo taken and uploaded', 'All 7 legal agreements signed', 'Identity confirmed in person'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                  <input type="checkbox" style={{ accentColor: C.gold, width: 16, height: 16 }} />
                  <span style={{ color: C.text, fontSize: 13 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Button variant="danger" fullWidth onClick={() => setSelectedDriver(null)}>✕ Reject</Button>
            <Button variant="success" fullWidth onClick={() => verifyDriver.mutate(selectedDriver.id)} disabled={verifyDriver.isPending}>
              {verifyDriver.isPending ? 'Verifying…' : '✓ Approve'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Vehicle Verification Modal */}
      {selectedVehicle && (
        <Modal title={`Verify Vehicle: ${selectedVehicle.plate_number}`} onClose={() => setSelectedVehicle(null)}>
          <div style={{ background: C.elevated, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            {[
              { label: 'Plate',   value: selectedVehicle.plate_number },
              { label: 'Vehicle', value: `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})` },
              { label: 'Licence', value: selectedVehicle.taxi_licence_number },
              { label: 'Expiry',  value: new Date(selectedVehicle.taxi_licence_expiry).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textMuted, fontSize: 13 }}>{label}</span>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Button variant="danger" fullWidth onClick={() => setSelectedVehicle(null)}>✕ Reject</Button>
            <Button variant="success" fullWidth onClick={() => verifyVehicle.mutate(selectedVehicle.id)} disabled={verifyVehicle.isPending}>
              {verifyVehicle.isPending ? 'Verifying…' : '✓ Approve'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
