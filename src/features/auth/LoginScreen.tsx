// src/features/auth/LoginScreen.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { useState } from 'react'
import { sendOtp, verifyOtp } from '@/hooks/useAuth'
import { Badge, Button, Input } from '@/components/ui'

type Step = 'phone' | 'otp'

export function LoginScreen() {
  const [step,    setStep]    = useState<Step>('phone')
  const [phone,   setPhone]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSendOtp = async () => {
    setError(null)
    if (!phone.trim()) return
    setLoading(true)
    try {
      await sendOtp(phone.trim())
      setStep('otp')
    } catch (e: any) {
      setError(e.message ?? 'Failed to send OTP. Check your number.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError(null)
    if (!otp.trim()) return
    setLoading(true)
    try {
      await verifyOtp(phone.trim(), otp.trim())
      // App.tsx will re-render to the correct dashboard via useAuth
    } catch (e: any) {
      setError(e.message ?? 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100%', background: '#0A0C0F',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🚖</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 30,
            fontWeight: 900, color: '#F0F2F5', margin: 0,
          }}>Honiara Taxi</h1>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: 18,
            fontWeight: 900, color: '#F5A623', letterSpacing: 4, marginBottom: 6,
          }}>NETWORK</div>
          <div style={{ color: '#8891A5', fontSize: 13, marginBottom: 12 }}>
            Honiara, Solomon Islands
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['Android', 'iOS', 'Web', 'Windows'].map(p => (
              <Badge key={p} color="muted">{p}</Badge>
            ))}
          </div>
          <div style={{ color: '#4A5268', fontSize: 11, marginTop: 8 }}>
            MereSimi Studios Ltd
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111318', border: '1px solid #252932',
          borderRadius: 20, padding: 28, marginBottom: 20,
        }}>
          {step === 'phone' ? (
            <>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontSize: 20,
                fontWeight: 800, color: '#F0F2F5', marginBottom: 20,
              }}>Sign In</h2>

              <Input
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="+677 XXXXXXX"
                type="tel"
              />

              {error && (
                <div style={{
                  background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  color: '#E53E3E', fontSize: 13,
                }}>{error}</div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleSendOtp}
                disabled={!phone.trim() || loading}
              >
                {loading ? 'Sending…' : 'Send OTP Code →'}
              </Button>
            </>
          ) : (
            <>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontSize: 20,
                fontWeight: 800, color: '#F0F2F5', marginBottom: 6,
              }}>Enter OTP</h2>
              <p style={{ color: '#8891A5', fontSize: 13, marginBottom: 20 }}>
                Code sent to {phone}
              </p>

              <Input
                label="6-Digit Code"
                value={otp}
                onChange={setOtp}
                placeholder="000000"
                type="number"
              />

              {error && (
                <div style={{
                  background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.3)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  color: '#E53E3E', fontSize: 13,
                }}>{error}</div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleVerifyOtp}
                disabled={otp.length < 6 || loading}
              >
                {loading ? 'Verifying…' : 'Verify & Sign In →'}
              </Button>

              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
                style={{
                  background: 'none', border: 'none', color: '#8891A5',
                  fontSize: 13, cursor: 'pointer', marginTop: 12,
                  width: '100%', textAlign: 'center',
                }}
              >← Change number</button>
            </>
          )}
        </div>

        {/* Register link */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#8891A5', fontSize: 13 }}>New to HTN? </span>
          <button
            onClick={() => {
              // Registration flow is handled by App.tsx
              // when a new auth user has no profile
            }}
            style={{
              background: 'none', border: 'none', color: '#F5A623',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Create Account →
          </button>
        </div>
      </div>
    </div>
  )
}
