// src/types/database.ts
// MereSimi Studios Ltd — Honiara Taxi Network
// Auto-generate the real version with: supabase gen types typescript --linked > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {

      // ── users ──────────────────────────────────────────────
      users: {
        Row: {
          id:           string
          auth_id:      string | null
          role:         Database['public']['Enums']['user_role']
          full_name:    string
          phone:        string
          email:        string | null
          photo_url:    string | null
          status:       Database['public']['Enums']['account_status']
          is_verified:  boolean
          fcm_token:    string | null
          created_at:   string
          updated_at:   string
          last_seen_at: string | null
          deleted_at:   string | null
        }
        Insert: {
          id?:          string
          auth_id?:     string | null
          role:         Database['public']['Enums']['user_role']
          full_name:    string
          phone:        string
          email?:       string | null
          photo_url?:   string | null
          status?:      Database['public']['Enums']['account_status']
          is_verified?: boolean
          fcm_token?:   string | null
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }

      // ── drivers ────────────────────────────────────────────
      drivers: {
        Row: {
          id:                   string
          user_id:              string
          status:               Database['public']['Enums']['driver_status']
          licence_number:       string
          licence_expiry:       string
          licence_scan_url:     string | null
          licence_verified:     boolean
          licence_verified_by:  string | null
          licence_verified_at:  string | null
          photo_url:            string | null
          rating_avg:           number
          rating_count:         number
          total_trips:          number
          total_earnings:       number
          current_vehicle_id:   string | null
          office_visit_date:    string | null
          office_visited_by:    string | null
          agreements_signed_at: string | null
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                   string
          user_id:               string
          status?:               Database['public']['Enums']['driver_status']
          licence_number:        string
          licence_expiry:        string
          licence_scan_url?:     string | null
          licence_verified?:     boolean
          photo_url?:            string | null
          rating_avg?:           number
          rating_count?:         number
          total_trips?:          number
          total_earnings?:       number
          current_vehicle_id?:   string | null
          office_visit_date?:    string | null
          agreements_signed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>
      }

      // ── taxi_owners ────────────────────────────────────────
      taxi_owners: {
        Row: {
          id:                   string
          user_id:              string
          business_name:        string | null
          status:               Database['public']['Enums']['owner_status']
          office_visit_date:    string | null
          office_visited_by:    string | null
          agreements_signed_at: string | null
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                   string
          user_id:               string
          business_name?:        string | null
          status?:               Database['public']['Enums']['owner_status']
          office_visit_date?:    string | null
          agreements_signed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['taxi_owners']['Insert']>
      }

      // ── vehicles ───────────────────────────────────────────
      vehicles: {
        Row: {
          id:                     string
          owner_id:               string
          plate_number:           string
          make:                   string
          model:                  string
          year:                   number
          colour:                 string
          seating_capacity:       number
          photo_url:              string | null
          status:                 Database['public']['Enums']['vehicle_status']
          taxi_licence_number:    string
          taxi_licence_expiry:    string
          taxi_licence_scan_url:  string | null
          taxi_licence_verified:  boolean
          licence_verified_by:    string | null
          licence_verified_at:    string | null
          insurance_expiry:       string | null
          registration_expiry:    string | null
          current_driver_id:      string | null
          is_visible_on_map:      boolean
          created_at:             string
          updated_at:             string
        }
        Insert: {
          id?:                    string
          owner_id:               string
          plate_number:           string
          make:                   string
          model:                  string
          year:                   number
          colour:                 string
          seating_capacity?:      number
          photo_url?:             string | null
          status?:                Database['public']['Enums']['vehicle_status']
          taxi_licence_number:    string
          taxi_licence_expiry:    string
          taxi_licence_scan_url?: string | null
          taxi_licence_verified?: boolean
          insurance_expiry?:      string | null
          registration_expiry?:   string | null
          current_driver_id?:     string | null
          is_visible_on_map?:     boolean
        }
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>
      }

      // ── vehicle_assignments ────────────────────────────────
      vehicle_assignments: {
        Row: {
          id:            string
          vehicle_id:    string
          driver_id:     string
          assigned_by:   string | null
          assigned_at:   string
          unassigned_at: string | null
          unassigned_by: string | null
          reason:        string | null
          is_current:    boolean
        }
        Insert: {
          id?:            string
          vehicle_id:     string
          driver_id:      string
          assigned_by?:   string | null
          assigned_at?:   string
          unassigned_at?: string | null
          reason?:        string | null
          is_current?:    boolean
        }
        Update: Partial<Database['public']['Tables']['vehicle_assignments']['Insert']>
      }

      // ── licences ───────────────────────────────────────────
      licences: {
        Row: {
          id:             string
          entity_type:    string
          entity_id:      string
          licence_type:   Database['public']['Enums']['licence_type']
          licence_number: string
          issued_date:    string | null
          expiry_date:    string
          status:         Database['public']['Enums']['licence_status']
          scan_url:       string | null
          verified:       boolean
          verified_by:    string | null
          verified_at:    string | null
          notes:          string | null
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:             string
          entity_type:     string
          entity_id:       string
          licence_type:    Database['public']['Enums']['licence_type']
          licence_number:  string
          issued_date?:    string | null
          expiry_date:     string
          status?:         Database['public']['Enums']['licence_status']
          scan_url?:       string | null
          verified?:       boolean
          notes?:          string | null
        }
        Update: Partial<Database['public']['Tables']['licences']['Insert']>
      }

      // ── subscriptions ──────────────────────────────────────
      subscriptions: {
        Row: {
          id:             string
          user_id:        string | null
          vehicle_id:     string | null
          plan:           Database['public']['Enums']['subscription_plan']
          status:         Database['public']['Enums']['subscription_status']
          amount_sbd:     number
          period_start:   string
          period_end:     string
          paid_at:        string | null
          payment_method: string
          payment_ref:    string | null
          verified_by:    string | null
          auto_renew:     boolean
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:             string
          user_id?:        string | null
          vehicle_id?:     string | null
          plan:            Database['public']['Enums']['subscription_plan']
          status?:         Database['public']['Enums']['subscription_status']
          amount_sbd:      number
          period_start:    string
          period_end:      string
          paid_at?:        string | null
          payment_method?: string
          payment_ref?:    string | null
          auto_renew?:     boolean
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }

      // ── trips ──────────────────────────────────────────────
      trips: {
        Row: {
          id:                  string
          customer_id:         string
          driver_id:           string | null
          vehicle_id:          string | null
          status:              Database['public']['Enums']['trip_status']
          pickup_lat:          number
          pickup_lng:          number
          pickup_address:      string | null
          dropoff_lat:         number | null
          dropoff_lng:         number | null
          dropoff_address:     string | null
          requested_at:        string
          driver_assigned_at:  string | null
          driver_arrived_at:   string | null
          trip_started_at:     string | null
          trip_completed_at:   string | null
          cancelled_at:        string | null
          cancellation_reason: string | null
          estimated_fare_sbd:  number | null
          final_fare_sbd:      number | null
          payment_method:      string | null
          payment_confirmed:   boolean | null
          distance_km:         number | null
          duration_minutes:    number | null
          customer_rating:     number | null
          customer_review:     string | null
          driver_rating:       number | null
          created_at:          string
          updated_at:          string
        }
        Insert: {
          id?:                  string
          customer_id:          string
          driver_id?:           string | null
          vehicle_id?:          string | null
          status?:              Database['public']['Enums']['trip_status']
          pickup_lat:           number
          pickup_lng:           number
          pickup_address?:      string | null
          dropoff_lat?:         number | null
          dropoff_lng?:         number | null
          dropoff_address?:     string | null
          estimated_fare_sbd?:  number | null
        }
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }

      // ── trip_dispatch ──────────────────────────────────────
      trip_dispatch: {
        Row: {
          id:           string
          trip_id:      string
          driver_id:    string
          status:       Database['public']['Enums']['dispatch_status']
          sent_at:      string
          responded_at: string | null
          expires_at:   string
        }
        Insert: {
          id?:          string
          trip_id:      string
          driver_id:    string
          status?:      Database['public']['Enums']['dispatch_status']
          expires_at?:  string
        }
        Update: Partial<Database['public']['Tables']['trip_dispatch']['Insert']>
      }

      // ── live_locations ─────────────────────────────────────
      live_locations: {
        Row: {
          id:          string
          driver_id:   string
          vehicle_id:  string | null
          latitude:    number
          longitude:   number
          heading:     number | null
          speed_kmh:   number | null
          accuracy_m:  number | null
          recorded_at: string
        }
        Insert: {
          id?:         string
          driver_id:   string
          vehicle_id?: string | null
          latitude:    number
          longitude:   number
          heading?:    number | null
          speed_kmh?:  number | null
          accuracy_m?: number | null
        }
        Update: Partial<Database['public']['Tables']['live_locations']['Insert']>
      }

      // ── notifications ──────────────────────────────────────
      notifications: {
        Row: {
          id:          string
          user_id:     string
          type:        Database['public']['Enums']['notification_type']
          title:       string
          body:        string
          data:        Json
          read_at:     string | null
          sent_at:     string | null
          fcm_success: boolean | null
          created_at:  string
        }
        Insert: {
          id?:          string
          user_id:      string
          type:         Database['public']['Enums']['notification_type']
          title:        string
          body:         string
          data?:        Json
          read_at?:     string | null
          sent_at?:     string | null
          fcm_success?: boolean | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }

      // ── documents ──────────────────────────────────────────
      documents: {
        Row: {
          id:               string
          entity_type:      string
          entity_id:        string
          document_type:    Database['public']['Enums']['document_type']
          storage_path:     string
          original_name:    string | null
          file_size_bytes:  number | null
          mime_type:        string | null
          uploaded_by:      string | null
          is_verified:      boolean
          verified_by:      string | null
          verified_at:      string | null
          notes:            string | null
          created_at:       string
          expires_at:       string | null
        }
        Insert: {
          id?:               string
          entity_type:       string
          entity_id:         string
          document_type:     Database['public']['Enums']['document_type']
          storage_path:      string
          original_name?:    string | null
          file_size_bytes?:  number | null
          mime_type?:        string | null
          uploaded_by?:      string | null
          is_verified?:      boolean
          notes?:            string | null
          expires_at?:       string | null
        }
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }

      // ── signed_agreements ──────────────────────────────────
      signed_agreements: {
        Row: {
          id:               string
          user_id:          string
          agreement_type:   Database['public']['Enums']['agreement_type']
          agreement_ver:    string
          signed_at:        string
          ip_address:       string | null
          user_agent:       string | null
          pdf_storage_path: string | null
          hash:             string | null
        }
        Insert: {
          id?:               string
          user_id:           string
          agreement_type:    Database['public']['Enums']['agreement_type']
          agreement_ver?:    string
          signed_at?:        string
          ip_address?:       string | null
          user_agent?:       string | null
          pdf_storage_path?: string | null
          hash?:             string | null
        }
        Update: Partial<Database['public']['Tables']['signed_agreements']['Insert']>
      }

      // ── payments ───────────────────────────────────────────
      payments: {
        Row: {
          id:              string
          subscription_id: string | null
          payer_id:        string
          amount_sbd:      number
          payment_method:  string
          mslen_ref:       string | null
          status:          Database['public']['Enums']['payment_status']
          verified_by:     string | null
          verified_at:     string | null
          notes:           string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          subscription_id?: string | null
          payer_id:         string
          amount_sbd:       number
          payment_method?:  string
          mslen_ref?:       string | null
          status?:          Database['public']['Enums']['payment_status']
          notes?:           string | null
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }

      // ── audit_logs ─────────────────────────────────────────
      audit_logs: {
        Row: {
          id:          string
          actor_id:    string | null
          action:      Database['public']['Enums']['audit_action']
          target_type: string | null
          target_id:   string | null
          old_value:   Json | null
          new_value:   Json | null
          ip_address:  string | null
          user_agent:  string | null
          metadata:    Json
          created_at:  string
        }
        Insert: {
          id?:          string
          actor_id?:    string | null
          action:       Database['public']['Enums']['audit_action']
          target_type?: string | null
          target_id?:   string | null
          old_value?:   Json | null
          new_value?:   Json | null
          ip_address?:  string | null
          user_agent?:  string | null
          metadata?:    Json
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }

      // ── favourite_drivers ──────────────────────────────────
      favourite_drivers: {
        Row: {
          id:          string
          customer_id: string
          driver_id:   string
          created_at:  string
        }
        Insert: {
          id?:         string
          customer_id: string
          driver_id:   string
        }
        Update: Partial<Database['public']['Tables']['favourite_drivers']['Insert']>
      }

      // ── sos_alerts ─────────────────────────────────────────
      sos_alerts: {
        Row: {
          id:           string
          user_id:      string
          trip_id:      string | null
          latitude:     number
          longitude:    number
          triggered_at: string
          resolved_at:  string | null
          resolved_by:  string | null
          notes:        string | null
        }
        Insert: {
          id?:          string
          user_id:      string
          trip_id?:     string | null
          latitude:     number
          longitude:    number
          resolved_by?: string | null
          notes?:       string | null
        }
        Update: Partial<Database['public']['Tables']['sos_alerts']['Insert']>
      }

      // ── ratings ────────────────────────────────────────────
      ratings: {
        Row: {
          id:          string
          trip_id:     string
          rater_id:    string
          rated_id:    string
          rating_type: string
          score:       number
          review:      string | null
          created_at:  string
        }
        Insert: {
          id?:         string
          trip_id:     string
          rater_id:    string
          rated_id:    string
          rating_type: string
          score:       number
          review?:     string | null
        }
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>
      }

      // ── trip_events ────────────────────────────────────────
      trip_events: {
        Row: {
          id:          string
          trip_id:     string
          event_type:  string
          actor_id:    string | null
          metadata:    Json
          latitude:    number | null
          longitude:   number | null
          occurred_at: string
        }
        Insert: {
          id?:         string
          trip_id:     string
          event_type:  string
          actor_id?:   string | null
          metadata?:   Json
          latitude?:   number | null
          longitude?:  number | null
        }
        Update: Partial<Database['public']['Tables']['trip_events']['Insert']>
      }
    }

    // ── Enums ──────────────────────────────────────────────
    Enums: {
      user_role:          'customer' | 'driver' | 'taxi_owner' | 'admin'
      account_status:     'pending' | 'active' | 'suspended' | 'banned' | 'pending_office_visit' | 'pending_admin_approval'
      driver_status:      'offline' | 'online' | 'busy' | 'suspended' | 'licence_expired' | 'pending_verification'
      owner_status:       'pending' | 'active' | 'suspended' | 'pending_office_visit' | 'pending_admin_approval'
      vehicle_status:     'active' | 'inactive' | 'suspended' | 'licence_expired' | 'pending_verification' | 'unassigned'
      trip_status:        'requested' | 'driver_assigned' | 'driver_en_route' | 'in_progress' | 'completed' | 'cancelled_customer' | 'cancelled_driver' | 'no_drivers_available' | 'expired'
      dispatch_status:    'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
      licence_type:       'driver_licence' | 'taxi_licence'
      licence_status:     'valid' | 'expired' | 'suspended' | 'pending_verification'
      subscription_plan:  'customer_monthly' | 'vehicle_monthly'
      subscription_status:'active' | 'expired' | 'cancelled' | 'pending_payment'
      notification_type:  'booking_request' | 'booking_accepted' | 'booking_declined' | 'driver_arrived' | 'trip_started' | 'trip_completed' | 'trip_cancelled' | 'licence_expiry_warning' | 'licence_expired' | 'subscription_expiry' | 'account_verified' | 'account_suspended' | 'sos_alert' | 'system'
      document_type:      'driver_licence_scan' | 'taxi_licence_scan' | 'driver_photo' | 'vehicle_photo' | 'insurance_document' | 'registration_document' | 'signed_agreement_pdf' | 'identity_document' | 'other'
      agreement_type:     'platform_terms' | 'user_agreement' | 'privacy_policy' | 'road_safety' | 'driver_compliance' | 'vehicle_compliance' | 'solomon_islands_road_law'
      payment_status:     'pending' | 'verified' | 'failed' | 'refunded'
      audit_action:       'user_created' | 'user_updated' | 'user_suspended' | 'user_activated' | 'driver_verified' | 'driver_suspended' | 'driver_licence_expired' | 'vehicle_verified' | 'vehicle_deactivated' | 'vehicle_licence_expired' | 'subscription_created' | 'subscription_expired' | 'subscription_renewed' | 'trip_created' | 'trip_completed' | 'trip_cancelled' | 'document_uploaded' | 'document_verified' | 'agreement_signed' | 'admin_action' | 'login' | 'logout'
    }

    Functions: {
      find_nearest_drivers: {
        Args:    { p_lat: number; p_lng: number; p_limit?: number }
        Returns: Array<{
          driver_id:   string
          user_id:     string
          vehicle_id:  string
          distance_m:  number
          latitude:    number
          longitude:   number
          fcm_token:   string | null
        }>
      }
      accept_booking: {
        Args:    { p_dispatch_id: string; p_trip_id: string; p_driver_id: string }
        Returns: { success: boolean; message: string }
      }
    }
  }
}
