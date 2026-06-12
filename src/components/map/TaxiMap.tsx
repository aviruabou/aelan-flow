// src/components/map/TaxiMap.tsx
// MereSimi Studios Ltd — Honiara Taxi Network

import { useEffect, useRef } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps'
import {
  HONIARA_CENTER,
  DEFAULT_ZOOM,
  HTN_MAP_STYLES,
  buildTaxiMarkerSvg,
  svgToDataUrl,
} from '@/lib/maps'
import type { LiveDriver } from '@/hooks/useLiveDrivers'

interface CustomerPosition { lat: number; lng: number }

interface TaxiMapProps {
  drivers:             LiveDriver[]
  selectedDriverId:    string | null
  onDriverClick:       (driver: LiveDriver | null) => void
  customerPosition:    CustomerPosition | null
  activeDriverPosition?: { lat: number; lng: number } | null
  showRoute?:          boolean
}

// Route polyline (inside Map context)
function TripRoute({ from, to }: { from: CustomerPosition; to: CustomerPosition }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const line = new google.maps.Polyline({
      path:          [from, to],
      geodesic:      true,
      strokeColor:   '#F5A623',
      strokeOpacity: 0.8,
      strokeWeight:  3,
    })
    line.setMap(map)
    return () => { line.setMap(null) }
  }, [map, from, to])
  return null
}

// Driver marker
function DriverMarker({
  driver, isSelected, onClick,
}: { driver: LiveDriver; isSelected: boolean; onClick: () => void }) {
  const st = driver.status === 'online' ? 'available' : driver.status === 'busy' ? 'busy' : 'offline'
  return (
    <AdvancedMarker
      position={{ lat: driver.latitude, lng: driver.longitude }}
      onClick={onClick}
      title={`${driver.full_name} — ${driver.plate_number}`}
      zIndex={isSelected ? 10 : 1}
    >
      <img
        src={svgToDataUrl(buildTaxiMarkerSvg(st, isSelected))}
        alt={driver.full_name}
        style={{
          width: isSelected ? 40 : 32,
          height: isSelected ? 40 : 32,
          transition: 'all 0.3s ease',
          filter: isSelected ? 'drop-shadow(0 0 8px rgba(245,166,35,0.8))' : 'none',
        }}
      />
    </AdvancedMarker>
  )
}

// Inner map content
function MapInner({ drivers, selectedDriverId, onDriverClick, customerPosition, activeDriverPosition, showRoute }: TaxiMapProps) {
  const map = useMap()
  const didPan = useRef(false)

  useEffect(() => {
    if (map && customerPosition && !didPan.current) {
      map.panTo(customerPosition)
      didPan.current = true
    }
  }, [map, customerPosition])

  return (
    <>
      {drivers.filter(d => d.status !== 'offline').map(driver => (
        <DriverMarker
          key={driver.driver_id}
          driver={driver}
          isSelected={driver.driver_id === selectedDriverId}
          onClick={() => onDriverClick(driver.driver_id === selectedDriverId ? null : driver)}
        />
      ))}
      {customerPosition && (
        <AdvancedMarker position={customerPosition} title="Your location" zIndex={20}>
          <Pin background="#3B8BEB" borderColor="#ffffff" glyphColor="#ffffff" scale={1.2} />
        </AdvancedMarker>
      )}
      {showRoute && customerPosition && activeDriverPosition && (
        <TripRoute from={customerPosition} to={activeDriverPosition} />
      )}
    </>
  )
}

export function TaxiMap(props: TaxiMapProps) {
  const { drivers, customerPosition } = props
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
  const center = customerPosition ?? HONIARA_CENTER

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 320, borderRadius: 12, overflow: 'hidden', border: '1px solid #252932', position: 'relative' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="htn-main-map"
          defaultCenter={center}
          defaultZoom={DEFAULT_ZOOM}
          styles={HTN_MAP_STYLES}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapInner {...props} />
        </Map>
      </APIProvider>
      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(10,12,15,0.85)', border: '1px solid #252932', borderRadius: 8, padding: '6px 10px' }}>
        <span style={{ color: '#00C896', fontSize: 12, fontWeight: 700 }}>
          {drivers.filter(d => d.status === 'online').length} available
        </span>
      </div>
    </div>
  )
}

export function formatDistance(distanceM: number): string {
  return distanceM < 1000 ? `${Math.round(distanceM)} m` : `${(distanceM / 1000).toFixed(1)} km`
}
