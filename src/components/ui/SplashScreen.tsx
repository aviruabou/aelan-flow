// src/components/ui/SplashScreen.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

export function SplashScreen() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0A0C0F', gap: 20,
    }}>
      <div style={{ fontSize: 64 }}>🚖</div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 22,
        fontWeight: 900, color: '#F5A623', letterSpacing: 3,
      }}>
        HTN
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <div className="dot-1" style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623' }} />
        <div className="dot-2" style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623' }} />
        <div className="dot-3" style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623' }} />
      </div>
      <div style={{ color: '#4A5268', fontSize: 12, marginTop: 4 }}>
        MereSimi Studios Ltd
      </div>
    </div>
  )
}
