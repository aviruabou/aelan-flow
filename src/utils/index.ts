// src/utils/index.ts
// MereSimi Studios Ltd — Honiara Taxi Network
// Utility functions

/** Format SBD currency */
export function formatSBD(amount: number): string {
  return `SBD ${amount.toFixed(2)}`
}

/** Format distance in metres to readable string */
export function formatDistance(metres: number): string {
  return metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`
}

/** Get initials from a full name */
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
