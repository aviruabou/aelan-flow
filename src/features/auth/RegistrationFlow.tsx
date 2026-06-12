// src/features/auth/RegistrationFlow.tsx
// MereSimi Studios Ltd — Honiara Taxi Network
// Shown after a new user authenticates but has no profile row.
// Creates public.users row + signed_agreements rows.

import { useState } from 'react'
import { supabase, db } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input, Badge } from '@/components/ui'
import type { Database } from '@/types/database'

type UserRole      = Database['public']['Enums']['user_role']
type AgreementType = Database['public']['Enums']['agreement_type']

const AGREEMENT_TYPES: AgreementType[] = [
  'platform_terms',
  'user_agreement',
  'privacy_policy',
  'road_safety',
  'driver_compliance',
  'vehicle_compliance',
  'solomon_islands_road_law',
]

const AGREEMENT_LABELS: Record<AgreementType, string> = {
  platform_terms:            'Platform Terms and Conditions',
  user_agreement:            'User Agreement',
  privacy_policy:            'Privacy Policy',
  road_safety:               'Road Safety Agreement',
  driver_compliance:         'Driver Compliance Agreement',
  vehicle_compliance:        'Vehicle Compliance Agreement',
  solomon_islands_road_law:  'Solomon Islands Road Law Compliance',
}

const ROLES: { id: UserRole; icon: string; label: string; desc: string }[] = [
  { id: 'customer',   icon: '👤', label: 'Customer',   desc: 'Book taxis and track your rides' },
  { id: 'driver',     icon: '🚗', label: 'Driver',     desc: 'Accept bookings and earn income' },
  { id: 'taxi_owner', icon: '🚌', label: 'Taxi Owner', desc: 'Manage your fleet and drivers' },
]

type Step = 'details' | 'role' | 'agreements' | 'complete'

export function RegistrationFlow() {
  const authUser   = useAuthStore(s => s.authUser)
  const setProfile = useAuthStore(s => s.setProfile)

  const [step,      setStep]      = useState<Step>('details')
  const [fullName,  setFullName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [role,      setRole]      = useState<UserRole | null>(null)
  const [agreed,    setAgreed]    = useState<Record<AgreementType, boolean>>({} as any)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const allAgreed = AGREEMENT_TYPES.every(t => agreed[t])

  // ─── Submit ─────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!authUser || !role) return
    setLoading(true)
    setError(null)

    try {
      // 1. Create public.users profile
      const accountStatus =
        role === 'customer' ? 'pending' : 'pending_office_visit'

      const { data: profile, error: userErr } = await db.users()
        .insert({
          auth_id:   authUser.id,
          role,
          full_name: fullName.trim(),
          phone:     authUser.phone ?? '',
          email:     email.trim() || null,
          status:    accountStatus,
          is_verified: false,
        })
        .select()
        .single()

      if (userErr) throw userErr

      // 2. Record signed agreements
      const now = new Date().toISOString()
      const agreementRows = AGREEMENT_TYPES.map(t => ({
        user_id:        profile.id,
        agreement_type: t,
        agreement_ver:  '1.0',
        signed_at:      now,
        user_agent:     navigator.userAgent,
      }))
      const { error: agreeErr } = await db.signedAgreements().insert(agreementRows)
      if (agreeErr) throw agreeErr

      // 3. If driver/owner, create placeholder record
      if (role === 'driver') {
        await db.drivers().insert({
          user_id:        profile.id,
          status:         'pending_verification',
          licence_number: '',
          licence_expiry: '2099-01-01', // placeholder until office visit
        })
      }
      if (role === 'taxi_owner') {
        await db.taxiOwners().insert({
          user_id: profile.id,
          status:  'pending_office_visit',
        })
      }

      // 4. Update store — triggers App.tsx to render correct dashboard
      setProfile(profile)
      setStep('complete')
    } catch (e: any) {
      setError(e.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Progress bar ────────────────────────────────────────

  const steps: Step[] = ['details', 'role', 'agreements', 'complete']
  const stepIndex     = steps.indexOf(step)

  return (
    <div style={{
      height: '100%', background: '#0A0C0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {steps.slice(0, 4).map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 3,
              background: i <= stepIndex ? '#F5A623' : '#252932',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step: Details */}
        {step === 'details' && (
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 900, color: '#F0F2F5', marginBottom: 8 }}>
              Create Account
            </h2>
            <p style={{ color: '#8891A5', fontSize: 14, marginBottom: 24 }}>
              Join the Honiara Taxi Network
            </p>
            <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full legal name" />
            <Input label="Email (optional)" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
            <Button
              variant="primary" fullWidth size="lg"
              onClick={() => setStep('role')}
              disabled={!fullName.trim()}
            >Continue →</Button>
          </div>
        )}

        {/* Step: Role */}
        {step === 'role' && (
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 900, color: '#F0F2F5', marginBottom: 8 }}>
              Select Your Role
            </h2>
            <p style={{ color: '#8891A5', fontSize: 14, marginBottom: 24 }}>
              How will you use HTN?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {ROLES.map(r => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    background: role === r.id ? 'rgba(245,166,35,0.08)' : '#1A1D24',
                    border: `1.5px solid ${role === r.id ? '#F5A623' : '#252932'}`,
                    borderRadius: 12, padding: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 28 }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#F0F2F5', fontSize: 15, fontWeight: 700 }}>{r.label}</div>
                    <div style={{ color: '#8891A5', fontSize: 13 }}>{r.desc}</div>
                  </div>
                  {role === r.id && <div style={{ color: '#F5A623', fontSize: 18 }}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={() => setStep('details')}>← Back</Button>
              <Button variant="primary" fullWidth onClick={() => setStep('agreements')} disabled={!role}>Continue →</Button>
            </div>
          </div>
        )}

        {/* Step: Agreements */}
        {step === 'agreements' && (
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 900, color: '#F0F2F5', marginBottom: 8 }}>
              Legal Agreements
            </h2>
            <p style={{ color: '#8891A5', fontSize: 14, marginBottom: 20 }}>
              Read and sign all required documents
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {AGREEMENT_TYPES.map(t => (
                <div
                  key={t}
                  onClick={() => setAgreed(a => ({ ...a, [t]: !a[t] }))}
                  style={{
                    background: agreed[t] ? 'rgba(0,200,150,0.06)' : '#1A1D24',
                    border: `1px solid ${agreed[t] ? 'rgba(0,200,150,0.4)' : '#252932'}`,
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    background: agreed[t] ? '#00C896' : 'transparent',
                    border: `2px solid ${agreed[t] ? '#00C896' : '#252932'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {agreed[t] && <span style={{ color: '#000', fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ color: '#F0F2F5', fontSize: 13 }}>{AGREEMENT_LABELS[t]}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#E53E3E', fontSize: 13,
              }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={() => setStep('role')}>← Back</Button>
              <Button
                variant="primary" fullWidth
                onClick={handleSubmit}
                disabled={!allAgreed || loading}
              >
                {loading ? 'Creating…' : 'Sign & Create Account'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>
              {role === 'customer' ? '✅' : '🏢'}
            </div>
            {role === 'customer' ? (
              <>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 900, color: '#F0F2F5', marginBottom: 12 }}>
                  Account Ready!
                </h2>
                <p style={{ color: '#8891A5', fontSize: 14, marginBottom: 24 }}>
                  Subscribe for SBD 20/month to start booking taxis.
                </p>
                <Button variant="primary" fullWidth size="lg" onClick={() => window.location.reload()}>
                  Go to Dashboard →
                </Button>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 900, color: '#F0F2F5', marginBottom: 12 }}>
                  Office Visit Required
                </h2>
                <div style={{
                  background: '#1A1D24', border: '1px solid rgba(245,166,35,0.4)',
                  borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'left',
                }}>
                  <div style={{ color: '#F5A623', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                    ⚠️ Mandatory Steps Before Activation
                  </div>
                  {[
                    'Visit the HTN office in person',
                    'Present your original licence document',
                    'Have your licence scanned by HTN staff',
                    role === 'driver' ? 'Have your photo taken' : 'Present original Taxi Licence',
                    'Await administrator approval (1–2 business days)',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(245,166,35,0.15)',
                        border: '1px solid rgba(245,166,35,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#F5A623', fontSize: 11, fontWeight: 800, flexShrink: 0,
                      }}>{i + 1}</div>
                      <span style={{ color: '#F0F2F5', fontSize: 13 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <Button variant="primary" fullWidth size="lg" onClick={() => window.location.reload()}>
                  Go to Dashboard →
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
