// src/components/ui/index.tsx
// MereSimi Studios Ltd — Honiara Taxi Network
// All shared primitive components

import { useState, type ReactNode, type CSSProperties } from 'react'

// ─── Design tokens ────────────────────────────────────────

export const C = {
  obsidian:    '#0A0C0F',
  surface:     '#111318',
  elevated:    '#1A1D24',
  border:      '#252932',
  borderLight: '#2E3340',
  gold:        '#F5A623',
  goldDim:     '#C4841C',
  goldGlow:    'rgba(245,166,35,0.15)',
  emerald:     '#00C896',
  emeraldDim:  '#009E78',
  crimson:     '#E53E3E',
  crimsonDim:  '#C53030',
  sky:         '#3B8BEB',
  skyDim:      '#2D6EC4',
  text:        '#F0F2F5',
  textMuted:   '#8891A5',
  textDim:     '#4A5268',
} as const

// ─── Badge ────────────────────────────────────────────────

type BadgeColor = 'gold' | 'emerald' | 'crimson' | 'sky' | 'muted'

const BADGE_COLORS: Record<BadgeColor, { bg: string; text: string; border: string }> = {
  gold:    { bg: C.goldGlow,                    text: C.gold,    border: 'rgba(245,166,35,0.3)'  },
  emerald: { bg: 'rgba(0,200,150,0.10)',         text: C.emerald, border: 'rgba(0,200,150,0.3)'   },
  crimson: { bg: 'rgba(229,62,62,0.10)',         text: C.crimson, border: 'rgba(229,62,62,0.3)'   },
  sky:     { bg: 'rgba(59,139,235,0.10)',        text: C.sky,     border: 'rgba(59,139,235,0.3)'  },
  muted:   { bg: 'rgba(255,255,255,0.05)',       text: C.textMuted, border: 'rgba(255,255,255,0.1)' },
}

export function Badge({
  color = 'gold',
  children,
  size = 'sm',
}: {
  color?:    BadgeColor
  children:  ReactNode
  size?:     'sm' | 'md'
}) {
  const c = BADGE_COLORS[color]
  return (
    <span style={{
      background:    c.bg,
      color:         c.text,
      border:        `1px solid ${c.border}`,
      padding:       size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius:  20,
      fontSize:      size === 'sm' ? 11 : 12,
      fontWeight:    600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase' as const,
      whiteSpace:    'nowrap' as const,
      display:       'inline-flex',
      alignItems:    'center',
      gap:           4,
    }}>{children}</span>
  )
}

// ─── Button ───────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

const BTN_VARIANTS: Record<ButtonVariant, { bg: string; bgHover: string; color: string; border: string }> = {
  primary:   { bg: C.gold,    bgHover: C.goldDim,    color: '#000',    border: 'none'                    },
  secondary: { bg: 'transparent', bgHover: C.elevated, color: C.text,  border: `1px solid ${C.border}`  },
  danger:    { bg: C.crimson, bgHover: C.crimsonDim,  color: '#fff',    border: 'none'                    },
  success:   { bg: C.emerald, bgHover: C.emeraldDim,  color: '#000',    border: 'none'                    },
  ghost:     { bg: 'transparent', bgHover: 'rgba(255,255,255,0.05)', color: C.textMuted, border: 'none'  },
}

const BTN_PADS: Record<ButtonSize, string> = {
  sm: '6px 14px',
  md: '10px 20px',
  lg: '14px 28px',
}

export function Button({
  children,
  onClick,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  fullWidth = false,
  style: extraStyle = {},
  type = 'button',
}: {
  children:   ReactNode
  onClick?:   () => void
  variant?:   ButtonVariant
  size?:      ButtonSize
  disabled?:  boolean
  fullWidth?: boolean
  style?:     CSSProperties
  type?:      'button' | 'submit'
}) {
  const [hovered, setHovered] = useState(false)
  const v = BTN_VARIANTS[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    hovered && !disabled ? v.bgHover : v.bg,
        color:         v.color,
        border:        v.border,
        padding:       BTN_PADS[size],
        borderRadius:  8,
        fontSize:      size === 'sm' ? 12 : size === 'lg' ? 15 : 13,
        fontWeight:    700,
        cursor:        disabled ? 'not-allowed' : 'pointer',
        opacity:       disabled ? 0.5 : 1,
        width:         fullWidth ? '100%' : 'auto',
        fontFamily:    "'Syne', sans-serif",
        letterSpacing: '0.3px',
        transition:    'all 0.15s ease',
        display:       'inline-flex',
        alignItems:    'center',
        justifyContent:'center',
        gap:           6,
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────

export function Avatar({
  initials,
  src,
  size  = 36,
  color = C.gold,
}: {
  initials?: string
  src?:      string | null
  size?:     number
  color?:    string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        style={{
          width: size, height: size, borderRadius: '50%',
          border: `1.5px solid ${color}66`, objectFit: 'cover', flexShrink: 0,
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      border: `1.5px solid ${color}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0,
      fontFamily: "'Syne', sans-serif",
    }}>
      {(initials ?? '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  hint,
}: {
  label?:       string
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  type?:        string
  disabled?:    boolean
  hint?:        string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          color: C.textMuted, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.8px', textTransform: 'uppercase',
          display: 'block', marginBottom: 6,
        }}>{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: C.elevated,
          border: `1px solid ${focused ? C.gold + '88' : C.border}`,
          borderRadius: 8, padding: '10px 14px', color: C.text,
          fontSize: 14, boxSizing: 'border-box',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'border-color 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {hint && <p style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────

export function Modal({
  title,
  onClose,
  children,
  maxWidth = 520,
}: {
  title:     string
  onClose:   () => void
  children:  ReactNode
  maxWidth?: number
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div
        className="animate-slide-up"
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, width: '100%', maxWidth,
          maxHeight: '90vh', overflow: 'auto',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
        }}>
          <h3 style={{
            margin: 0, color: C.text, fontSize: 17,
            fontWeight: 700, fontFamily: "'Syne', sans-serif",
          }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: C.textMuted,
              fontSize: 20, cursor: 'pointer', lineHeight: 1,
              padding: '2px 6px', borderRadius: 4,
            }}
          >✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  color = C.gold,
  icon,
}: {
  label: string
  value: string
  sub?:  string
  color?: string
  icon?:  string
}) {
  return (
    <div style={{
      background: C.elevated, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '16px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            color: C.textMuted, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6,
          }}>{label}</div>
          <div style={{
            color: C.text, fontSize: 26, fontWeight: 800,
            fontFamily: "'Syne', sans-serif", lineHeight: 1,
          }}>{value}</div>
          {sub && <div style={{ color: C.textMuted, fontSize: 11, marginTop: 3 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 22, opacity: 0.5 }}>{icon}</div>}
      </div>
    </div>
  )
}

// ─── BottomNav ────────────────────────────────────────────

export function BottomNav({
  tabs,
  active,
  onChange,
}: {
  tabs:     { id: string; label: string }[]
  active:   string
  onChange: (id: string) => void
}) {
  return (
    <div style={{
      background: C.surface, borderTop: `1px solid ${C.border}`,
      display: 'flex', flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, background: 'none', border: 'none',
            padding: '12px 0',
            color:      active === t.id ? C.gold : C.textMuted,
            fontSize:   11, fontWeight: active === t.id ? 700 : 400,
            borderTop:  active === t.id ? `2px solid ${C.gold}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}
        >{t.label}</button>
      ))}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────

export function Header({
  role,
  userName,
  onSignOut,
  rightSlot,
}: {
  role:       string
  userName:   string
  onSignOut:  () => void
  rightSlot?: ReactNode
}) {
  const roleColor: Record<string, BadgeColor> = {
    customer:   'sky',
    driver:     'emerald',
    taxi_owner: 'gold',
    admin:      'crimson',
  }
  const roleLabel: Record<string, string> = {
    customer:   'Customer',
    driver:     'Driver',
    taxi_owner: 'Taxi Owner',
    admin:      'Administrator',
  }

  return (
    <div style={{
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: 18,
            fontWeight: 900, color: C.gold,
          }}>HTN</span>
          <Badge color={roleColor[role] ?? 'gold'}>{roleLabel[role] ?? role}</Badge>
        </div>
        <div style={{ color: C.textMuted, fontSize: 12, marginTop: 1 }}>{userName}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {rightSlot}
        <Button variant="ghost" size="sm" onClick={onSignOut}>Sign Out</Button>
      </div>
    </div>
  )
}

// ─── Loading spinner ──────────────────────────────────────

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${C.border}`,
      borderTopColor: C.gold,
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ─── Empty state ──────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  body,
}: { icon: string; title: string; body?: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ color: C.text, fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{title}</div>
      {body && <div style={{ color: C.textMuted, fontSize: 14, maxWidth: 260 }}>{body}</div>}
    </div>
  )
}
