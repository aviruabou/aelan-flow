/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL:                  string
  readonly VITE_SUPABASE_ANON_KEY:             string
  readonly VITE_GOOGLE_MAPS_API_KEY:           string
  readonly VITE_FIREBASE_API_KEY:              string
  readonly VITE_FIREBASE_AUTH_DOMAIN:          string
  readonly VITE_FIREBASE_PROJECT_ID:           string
  readonly VITE_FIREBASE_STORAGE_BUCKET:       string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID:  string
  readonly VITE_FIREBASE_APP_ID:               string
  readonly VITE_FIREBASE_VAPID_KEY:            string
  readonly VITE_APP_NAME:                      string
  readonly VITE_APP_VERSION:                   string
  readonly VITE_COMPANY_NAME:                  string
  readonly VITE_MAP_CENTER_LAT:                string
  readonly VITE_MAP_CENTER_LNG:                string
  readonly VITE_MAP_DEFAULT_ZOOM:              string
  readonly VITE_SERVICE_RADIUS_KM:             string
  readonly VITE_CUSTOMER_SUB_PRICE:            string
  readonly VITE_VEHICLE_SUB_PRICE:             string
  readonly VITE_GPS_INTERVAL_MS:               string
  readonly VITE_DISPATCH_TIMEOUT_MS:           string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
