// src/dashboards/TaxiOwnerDashboard.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { useState } from 'react'
import { Badge, Button, Avatar, Modal, StatCard, BottomNav, Header, EmptyState, Spinner, Input, C } from '@/components/ui'
import { useAuth, signOut } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { differenceInDays, parseISO } from 'date-fns'

export function TaxiOwnerDashboard() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('fleet')
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ plate: '', make: '', model: '', year: '', colour: '', licenceNumber: '', licenceExpiry: '' })

  // Fetch owner record
  const { data: ownerRecord } = useQuery({
    queryKey: ['owner-record', profile?.id],
    queryFn: async () => {
      const { data } = await db.taxiOwners().select('*').eq('user_id', profile!.id).single()
      return data
    },
    enabled: !!profile?.id,
  })

  // Fetch vehicles
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['owner-vehicles', ownerRecord?.id],
    queryFn: async () => {
      const { data } = await db.vehicles()
        .select('*, drivers(id, user_id, users(full_name), status)')
        .eq('owner_id', ownerRecord!.id)
        .order('created_at', { ascending: false })
      return data ?? []
    },
    enabled: !!ownerRecord?.id,
  })

  // Fetch subscriptions
  const { data: subscriptions } = useQuery({
    queryKey: ['owner-subscriptions', ownerRecord?.id],
    queryFn: async () => {
      if (!vehicles?.length) return []
      const ids = vehicles.map(v => v.id)
      const { data } = await db.subscriptions().select('*').in('vehicle_id', ids).eq('status', 'active')
      return data ?? []
    },
    enabled: !!vehicles?.length,
  })

  const addVehicle = useMutation({
    mutationFn: async () => {
      await db.vehicles().insert({
        owner_id:            ownerRecord!.id,
        plate_number:        newVehicle.plate,
        make:                newVehicle.make,
        model:               newVehicle.model,
        year:                parseInt(newVehicle.year),
        colour:              newVehicle.colour,
        taxi_licence_number: newVehicle.licenceNumber,
        taxi_licence_expiry: newVehicle.licenceExpiry,
        status:              'pending_verification',
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-vehicles'] })
      setShowAddVehicle(false)
      setNewVehicle({ plate: '', make: '', model: '', year: '', colour: '', licenceNumber: '', licenceExpiry: '' })
    },
  })

  const activeVehicles  = vehicles?.filter(v => v.status === 'active').length ?? 0
  const expiringCount   = vehicles?.filter(v => {
    const days = differenceInDays(parseISO(v.taxi_licence_expiry), new Date())
    return days >= 0 && days <= 30
  }).length ?? 0

  if (ownerRecord?.status === 'pending_office_visit' || ownerRecord?.status === 'pending_admin_approval') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.obsidian }}>
        <Header role="taxi_owner" userName={profile?.full_name ?? ''} onSignOut={signOut} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 340 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🏢</div>
            <div style={{ color: C.text, fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>Office Visit Required</div>
            <div style={{ color: C.textMuted, fontSize: 14 }}>Please visit the HTN office with your original Taxi Licence to be verified and activated.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.obsidian }}>
      <Header role="taxi_owner" userName={profile?.full_name ?? ''} onSignOut={signOut} />

      <div className="scroll-y" style={{ flex: 1, padding: 16 }}>

        {tab === 'fleet' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Fleet Management</div>
              <Button variant="primary" size="sm" onClick={() => setShowAddVehicle(true)}>+ Add Vehicle</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <StatCard label="Total Vehicles" value={(vehicles?.length ?? 0).toString()} color={C.sky} />
              <StatCard label="Active" value={activeVehicles.toString()} color={C.emerald} />
              <StatCard label="Expiring Soon" value={expiringCount.toString()} color={expiringCount > 0 ? C.gold : C.textDim} />
              <StatCard label="Monthly Cost" value={`SBD ${(vehicles?.length ?? 0) * 20}`} sub="SBD 20/vehicle" color={C.gold} />
            </div>

            {isLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
              : !vehicles?.length ? <EmptyState icon="🚌" title="No vehicles registered" body="Add your first vehicle to get started." />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {vehicles.map((v: any) => {
                    const daysToExpiry = differenceInDays(parseISO(v.taxi_licence_expiry), new Date())
                    const isExpiring   = daysToExpiry >= 0 && daysToExpiry <= 30
                    const isExpired    = daysToExpiry < 0
                    return (
                      <div key={v.id} style={{ background: C.elevated, border: `1px solid ${isExpiring || isExpired ? C.gold + '66' : C.border}`, borderRadius: 12, padding: 16 }}>
                        {(isExpiring || isExpired) && (
                          <div style={{ background: C.goldGlow, border: `1px solid ${C.gold}44`, borderRadius: 8, padding: '6px 10px', marginBottom: 10 }}>
                            <span style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>
                              {isExpired ? '⛔ Licence EXPIRED' : `⚠ Licence expiring in ${daysToExpiry} days`}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ color: C.text, fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{v.plate_number}</div>
                          <Badge color={v.status === 'active' ? 'emerald' : v.status === 'pending_verification' ? 'gold' : 'crimson'}>
                            {v.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>{v.make} {v.model} ({v.year}) • {v.colour}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
                          <div style={{ fontSize: 12, color: C.textMuted }}>Driver: <span style={{ color: C.text }}>{(v.drivers as any)?.users?.full_name ?? 'Unassigned'}</span></div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>Exp: <span style={{ color: isExpired ? C.crimson : isExpiring ? C.gold : C.text }}>{new Date(v.taxi_licence_expiry).toLocaleDateString()}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="secondary" size="sm">Manage Driver</Button>
                          <Button variant="secondary" size="sm">View Activity</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
          </div>
        )}

        {tab === 'subscription' && (
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>Subscription</div>
            <div style={{ background: C.elevated, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>Monthly Plan</div>
                <Badge color="emerald">Active</Badge>
              </div>
              <div style={{ color: C.gold, fontSize: 32, fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
                SBD {(vehicles?.length ?? 0) * 20}
              </div>
              <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>SBD 20 × {vehicles?.length ?? 0} vehicles/month</div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                {vehicles?.map((v: any) => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                    <span style={{ color: C.text, fontSize: 13 }}>{v.plate_number} — {v.make} {v.model}</span>
                    <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>SBD 20</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Payment Method</div>
              <div style={{ color: C.textMuted, fontSize: 13 }}>Paid manually via MSLEN to HTN</div>
              <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Contact the office to confirm payments and renew subscriptions.</div>
            </div>
          </div>
        )}

      </div>

      <BottomNav
        tabs={[{ id: 'fleet', label: '🚌 Fleet' }, { id: 'subscription', label: '💳 Subscription' }]}
        active={tab} onChange={setTab}
      />

      {showAddVehicle && (
        <Modal title="Register Vehicle" onClose={() => setShowAddVehicle(false)}>
          <Input label="Plate Number" value={newVehicle.plate} onChange={v => setNewVehicle(p => ({ ...p, plate: v }))} placeholder="H-1234" />
          <Input label="Make" value={newVehicle.make} onChange={v => setNewVehicle(p => ({ ...p, make: v }))} placeholder="Toyota" />
          <Input label="Model" value={newVehicle.model} onChange={v => setNewVehicle(p => ({ ...p, model: v }))} placeholder="Hiace" />
          <Input label="Year" value={newVehicle.year} onChange={v => setNewVehicle(p => ({ ...p, year: v }))} placeholder="2020" type="number" />
          <Input label="Colour" value={newVehicle.colour} onChange={v => setNewVehicle(p => ({ ...p, colour: v }))} placeholder="White" />
          <Input label="Taxi Licence Number" value={newVehicle.licenceNumber} onChange={v => setNewVehicle(p => ({ ...p, licenceNumber: v }))} placeholder="TL-2025-001" />
          <Input label="Licence Expiry Date" value={newVehicle.licenceExpiry} onChange={v => setNewVehicle(p => ({ ...p, licenceExpiry: v }))} placeholder="YYYY-MM-DD" type="date" />
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>
            ⚠ After submitting, you must visit the HTN office with the original Taxi Licence for verification.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setShowAddVehicle(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={() => addVehicle.mutate()} disabled={addVehicle.isPending || !newVehicle.plate || !newVehicle.make}>
              {addVehicle.isPending ? 'Registering…' : 'Register Vehicle'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
