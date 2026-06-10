// src/lib/maps.ts
// MereSimi Studios Ltd — Honiara Taxi Network

import { Loader } from '@googlemaps/js-api-loader'

// Honiara region constants
export const HONIARA_CENTER = {
  lat: Number(import.meta.env.VITE_MAP_CENTER_LAT ?? -9.4333),
  lng: Number(import.meta.env.VITE_MAP_CENTER_LNG ?? 160.0520),
} as const

export const DEFAULT_ZOOM   = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM ?? 13)
export const SERVICE_RADIUS = Number(import.meta.env.VITE_SERVICE_RADIUS_KM ?? 30) // km

// ─── Google Maps dark theme for HTN ───────────────────────

export const HTN_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',                                      stylers: [{ color: '#0D1117' }] },
  { elementType: 'labels.text.stroke',                            stylers: [{ color: '#0D1117' }] },
  { elementType: 'labels.text.fill',                              stylers: [{ color: '#4A5268' }] },
  { featureType: 'road',          elementType: 'geometry',        stylers: [{ color: '#1A2030' }] },
  { featureType: 'road',          elementType: 'geometry.stroke', stylers: [{ color: '#253050' }] },
  { featureType: 'road',          elementType: 'labels.text.fill',stylers: [{ color: '#8891A5' }] },
  { featureType: 'road.highway',  elementType: 'geometry',        stylers: [{ color: '#1E2840' }] },
  { featureType: 'road.highway',  elementType: 'geometry.stroke', stylers: [{ color: '#2E3A55' }] },
  { featureType: 'water',         elementType: 'geometry',        stylers: [{ color: '#071220' }] },
  { featureType: 'water',         elementType: 'labels.text.fill',stylers: [{ color: '#3B5070' }] },
  { featureType: 'poi',           elementType: 'geometry',        stylers: [{ color: '#111820' }] },
  { featureType: 'poi.park',      elementType: 'geometry',        stylers: [{ color: '#0D1A18' }] },
  { featureType: 'transit',       elementType: 'geometry',        stylers: [{ color: '#111820' }] },
  { featureType: 'administrative',elementType: 'geometry',        stylers: [{ color: '#1A2030' }] },
  { featureType: 'administrative',elementType: 'labels.text.fill',stylers: [{ color: '#6B7A96' }] },
]

// ─── Loader singleton ─────────────────────────────────────

let loaderInstance: Loader | null = null

export function getMapsLoader(): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey:  import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'],
      language: 'en',
      region:   'SB',   // Solomon Islands
    })
  }
  return loaderInstance
}

// ─── Utility: distance between two lat/lng points (km) ───

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R  = 6371
  const dL = ((lat2 - lat1) * Math.PI) / 180
  const dN = ((lng2 - lng1) * Math.PI) / 180
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dN / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Taxi marker SVG (rendered on Google Maps) ────────────

export function buildTaxiMarkerSvg(
  status: 'available' | 'busy' | 'offline',
  selected = false,
): string {
  const colors = {
    available: '#00C896',
    busy:      '#F5A623',
    offline:   '#4A5268',
  }
  const fill   = colors[status]
  const stroke = selected ? '#F5A623' : fill
  const size   = selected ? 36 : 28

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="#1A1D24" stroke="${stroke}" stroke-width="${selected ? 2.5 : 1.5}"/>
      <text x="18" y="23" text-anchor="middle" font-size="16">🚖</text>
      <circle cx="27" cy="9" r="5" fill="${fill}"/>
    </svg>
  `.trim()
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
