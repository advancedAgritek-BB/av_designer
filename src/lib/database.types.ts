export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          project_id: string
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          project_id: string
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          project_id?: string
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_revoked: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          revoked_at: string | null
          revoked_by: string | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_revoked?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_revoked?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          org_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          org_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          org_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount_cents: number
          created_at: string
          description: string
          id: string
          invoice_date: string
          invoice_url: string | null
          org_id: string
          status: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description: string
          id?: string
          invoice_date: string
          invoice_url?: string | null
          org_id: string
          status?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string
          id?: string
          invoice_date?: string
          invoice_url?: string | null
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          mobile: string | null
          name: string
          notes: string | null
          phone: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          mobile?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          mobile?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_price_book: {
        Row: {
          client_id: string
          created_at: string
          discount_percent: number | null
          effective_date: string
          equipment_id: string
          expiration_date: string | null
          id: string
          notes: string | null
          override_price_cents: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          discount_percent?: number | null
          effective_date: string
          equipment_id: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          override_price_cents?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          discount_percent?: number | null
          effective_date?: string
          equipment_id?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          override_price_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_price_book_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_price_book_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: Json | null
          billing_terms: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          learned_patterns: Json | null
          logo_url: string | null
          name: string
          notes: string | null
          parent_id: string | null
          tax_exempt: boolean | null
          tax_exempt_id: string | null
          template_ids: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          billing_terms?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          learned_patterns?: Json | null
          logo_url?: string | null
          name: string
          notes?: string | null
          parent_id?: string | null
          tax_exempt?: boolean | null
          tax_exempt_id?: string | null
          template_ids?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          billing_terms?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          learned_patterns?: Json | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          parent_id?: string | null
          tax_exempt?: boolean | null
          tax_exempt_id?: string | null
          template_ids?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      default_profiles: {
        Row: {
          created_at: string
          default_scale: string | null
          ecosystem: string | null
          equipment_margin: number | null
          id: string
          is_default: boolean
          labor_margin: number | null
          labor_rate: number | null
          name: string
          paper_size: string | null
          platform: string | null
          preferred_brands: string[] | null
          room_type: string | null
          tax_rate: number | null
          tier: string | null
          title_block: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_scale?: string | null
          ecosystem?: string | null
          equipment_margin?: number | null
          id?: string
          is_default?: boolean
          labor_margin?: number | null
          labor_rate?: number | null
          name: string
          paper_size?: string | null
          platform?: string | null
          preferred_brands?: string[] | null
          room_type?: string | null
          tax_rate?: number | null
          tier?: string | null
          title_block?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_scale?: string | null
          ecosystem?: string | null
          equipment_margin?: number | null
          id?: string
          is_default?: boolean
          labor_margin?: number | null
          labor_rate?: number | null
          name?: string
          paper_size?: string | null
          platform?: string | null
          preferred_brands?: string[] | null
          room_type?: string | null
          tax_rate?: number | null
          tier?: string | null
          title_block?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "default_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      drawings: {
        Row: {
          generated_at: string
          id: string
          layers: Json
          overrides: Json
          paper_size: string | null
          room_id: string
          scale: string | null
          type: Database["public"]["Enums"]["drawing_type"]
          updated_at: string
        }
        Insert: {
          generated_at?: string
          id?: string
          layers?: Json
          overrides?: Json
          paper_size?: string | null
          room_id: string
          scale?: string | null
          type: Database["public"]["Enums"]["drawing_type"]
          updated_at?: string
        }
        Update: {
          generated_at?: string
          id?: string
          layers?: Json
          overrides?: Json
          paper_size?: string | null
          room_id?: string
          scale?: string | null
          type?: Database["public"]["Enums"]["drawing_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: Database["public"]["Enums"]["equipment_category"]
          compatibility: Json | null
          cost_cents: number
          created_at: string
          description: string
          dimensions: Json
          electrical: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          manufacturer: string
          model: string
          msrp_cents: number
          organization_id: string | null
          platform_certifications: string[] | null
          preferred_pricing_index: number
          pricing: Json
          sku: string
          spec_sheet_url: string | null
          specifications: Json | null
          subcategory: string
          updated_at: string
          weight_lbs: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["equipment_category"]
          compatibility?: Json | null
          cost_cents?: number
          created_at?: string
          description?: string
          dimensions?: Json
          electrical?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          manufacturer: string
          model: string
          msrp_cents?: number
          organization_id?: string | null
          platform_certifications?: string[] | null
          preferred_pricing_index?: number
          pricing?: Json
          sku: string
          spec_sheet_url?: string | null
          specifications?: Json | null
          subcategory: string
          updated_at?: string
          weight_lbs?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["equipment_category"]
          compatibility?: Json | null
          cost_cents?: number
          created_at?: string
          description?: string
          dimensions?: Json
          electrical?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          manufacturer?: string
          model?: string
          msrp_cents?: number
          organization_id?: string | null
          platform_certifications?: string[] | null
          preferred_pricing_index?: number
          pricing?: Json
          sku?: string
          spec_sheet_url?: string | null
          specifications?: Json | null
          subcategory?: string
          updated_at?: string
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_imports: {
        Row: {
          column_mapping: Json
          completed_at: string | null
          created_count: number
          distributor: string
          error_count: number
          errors: Json | null
          filename: string
          id: string
          organization_id: string
          started_at: string
          status: string
          total_rows: number
          updated_count: number
          user_id: string
        }
        Insert: {
          column_mapping?: Json
          completed_at?: string | null
          created_count?: number
          distributor: string
          error_count?: number
          errors?: Json | null
          filename: string
          id?: string
          organization_id: string
          started_at?: string
          status?: string
          total_rows?: number
          updated_count?: number
          user_id: string
        }
        Update: {
          column_mapping?: Json
          completed_at?: string | null
          created_count?: number
          distributor?: string
          error_count?: number
          errors?: Json | null
          filename?: string
          id?: string
          organization_id?: string
          started_at?: string
          status?: string
          total_rows?: number
          updated_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_imports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          category: string
          connected_account_email: string | null
          connected_account_name: string | null
          connected_at: string | null
          created_at: string
          id: string
          is_connected: boolean
          org_id: string
          provider: string
          refresh_token: string | null
          settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          category: string
          connected_account_email?: string | null
          connected_account_name?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          org_id: string
          provider: string
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          category?: string
          connected_account_email?: string | null
          connected_account_name?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          org_id?: string
          provider?: string
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string
          email_enabled: boolean
          event_type: string
          id: string
          in_app_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          email_enabled?: boolean
          event_type: string
          id?: string
          in_app_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          email_enabled?: boolean
          event_type?: string
          id?: string
          in_app_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          is_read: boolean
          message: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          is_read?: boolean
          message: string
          severity: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      org_notification_rules: {
        Row: {
          category: string
          created_at: string
          created_by: string
          event_type: string
          id: string
          org_id: string
          recipient_rule: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          event_type: string
          id?: string
          org_id: string
          recipient_rule: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          event_type?: string
          id?: string
          org_id?: string
          recipient_rule?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_notification_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_notification_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_settings: {
        Row: {
          allowed_email_domains: string[] | null
          allowed_sso_providers: string[] | null
          audit_log_retention_years: number | null
          auto_archive_months: number | null
          billing_company_name: string | null
          billing_contact_email: string | null
          billing_tax_id: string | null
          created_at: string
          delete_archived_after: string | null
          footer_text: string | null
          id: string
          logo_on_drawings: boolean
          logo_on_pdfs: boolean
          logo_on_quotes: boolean
          org_id: string
          password_policy: string
          payment_method_brand: string | null
          payment_method_exp_month: number | null
          payment_method_exp_year: number | null
          payment_method_last4: string | null
          plan_billing_cycle: string | null
          plan_name: string | null
          plan_next_billing_date: string | null
          plan_price_cents: number | null
          plan_storage_limit_gb: number | null
          plan_team_limit: number | null
          primary_color: string | null
          require_2fa: boolean
          secondary_color: string | null
          session_timeout_days: number
          sso_only: boolean
          updated_at: string
        }
        Insert: {
          allowed_email_domains?: string[] | null
          allowed_sso_providers?: string[] | null
          audit_log_retention_years?: number | null
          auto_archive_months?: number | null
          billing_company_name?: string | null
          billing_contact_email?: string | null
          billing_tax_id?: string | null
          created_at?: string
          delete_archived_after?: string | null
          footer_text?: string | null
          id?: string
          logo_on_drawings?: boolean
          logo_on_pdfs?: boolean
          logo_on_quotes?: boolean
          org_id: string
          password_policy?: string
          payment_method_brand?: string | null
          payment_method_exp_month?: number | null
          payment_method_exp_year?: number | null
          payment_method_last4?: string | null
          plan_billing_cycle?: string | null
          plan_name?: string | null
          plan_next_billing_date?: string | null
          plan_price_cents?: number | null
          plan_storage_limit_gb?: number | null
          plan_team_limit?: number | null
          primary_color?: string | null
          require_2fa?: boolean
          secondary_color?: string | null
          session_timeout_days?: number
          sso_only?: boolean
          updated_at?: string
        }
        Update: {
          allowed_email_domains?: string[] | null
          allowed_sso_providers?: string[] | null
          audit_log_retention_years?: number | null
          auto_archive_months?: number | null
          billing_company_name?: string | null
          billing_contact_email?: string | null
          billing_tax_id?: string | null
          created_at?: string
          delete_archived_after?: string | null
          footer_text?: string | null
          id?: string
          logo_on_drawings?: boolean
          logo_on_pdfs?: boolean
          logo_on_quotes?: boolean
          org_id?: string
          password_policy?: string
          payment_method_brand?: string | null
          payment_method_exp_month?: number | null
          payment_method_exp_year?: number | null
          payment_method_last4?: string | null
          plan_billing_cycle?: string | null
          plan_name?: string | null
          plan_next_billing_date?: string | null
          plan_price_cents?: number | null
          plan_storage_limit_gb?: number | null
          plan_team_limit?: number | null
          primary_color?: string | null
          require_2fa?: boolean
          secondary_color?: string | null
          session_timeout_days?: number
          sso_only?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          created_at: string
          created_by: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string
          created_by: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string
          created_by?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contacts: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          project_id: string
          role: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          project_id: string
          role: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_locations: {
        Row: {
          access_instructions: string | null
          address: Json | null
          created_at: string
          description: string | null
          id: string
          location_type: string | null
          name: string
          parent_id: string | null
          project_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          access_instructions?: string | null
          address?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location_type?: string | null
          name: string
          parent_id?: string | null
          project_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          access_instructions?: string | null
          address?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location_type?: string | null
          name?: string
          parent_id?: string | null
          project_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          access_instructions: string | null
          address: Json | null
          client_id: string | null
          client_name: string
          contract_value_cents: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          owner_id: string | null
          pipeline_status: string | null
          project_number: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          access_instructions?: string | null
          address?: Json | null
          client_id?: string | null
          client_name: string
          contract_value_cents?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          owner_id?: string | null
          pipeline_status?: string | null
          project_number?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          access_instructions?: string | null
          address?: Json | null
          client_id?: string | null
          client_name?: string
          contract_value_cents?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          pipeline_status?: string | null
          project_number?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          currency: string
          id: string
          items: Json
          notes: string | null
          project_id: string
          room_id: string
          status: string | null
          subtotal_cents: number
          tax_cents: number
          tax_rate: number
          total_cents: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          notes?: string | null
          project_id: string
          room_id: string
          status?: string | null
          subtotal_cents?: number
          tax_cents?: number
          tax_rate?: number
          total_cents?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          notes?: string | null
          project_id?: string
          room_id?: string
          status?: string | null
          subtotal_cents?: number
          tax_cents?: number
          tax_rate?: number
          total_cents?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_equipment: {
        Row: {
          connections: Json
          created_at: string
          equipment_id: string
          id: string
          notes: string | null
          position: Json
          quantity: number
          room_id: string
          rotation: number
          updated_at: string
        }
        Insert: {
          connections?: Json
          created_at?: string
          equipment_id: string
          id?: string
          notes?: string | null
          position?: Json
          quantity?: number
          room_id: string
          rotation?: number
          updated_at?: string
        }
        Update: {
          connections?: Json
          created_at?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          position?: Json
          quantity?: number
          room_id?: string
          rotation?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_equipment_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          ceiling_height: number
          created_at: string
          ecosystem: string | null
          id: string
          length: number
          location_id: string | null
          name: string
          notes: string | null
          placed_equipment: Json
          platform: Database["public"]["Enums"]["platform_type"] | null
          project_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          tier: string | null
          updated_at: string
          width: number
        }
        Insert: {
          ceiling_height?: number
          created_at?: string
          ecosystem?: string | null
          id?: string
          length: number
          location_id?: string | null
          name: string
          notes?: string | null
          placed_equipment?: Json
          platform?: Database["public"]["Enums"]["platform_type"] | null
          project_id: string
          room_type?: Database["public"]["Enums"]["room_type"]
          tier?: string | null
          updated_at?: string
          width: number
        }
        Update: {
          ceiling_height?: number
          created_at?: string
          ecosystem?: string | null
          id?: string
          length?: number
          location_id?: string | null
          name?: string
          notes?: string | null
          placed_equipment?: Json
          platform?: Database["public"]["Enums"]["platform_type"] | null
          project_id?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          tier?: string | null
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "rooms_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "project_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          aspect: Database["public"]["Enums"]["rule_aspect"]
          conditions: Json
          created_at: string
          description: string
          expression: string
          expression_type: Database["public"]["Enums"]["rule_expression_type"]
          id: string
          is_active: boolean
          name: string
          priority: number
          updated_at: string
        }
        Insert: {
          aspect: Database["public"]["Enums"]["rule_aspect"]
          conditions?: Json
          created_at?: string
          description?: string
          expression: string
          expression_type: Database["public"]["Enums"]["rule_expression_type"]
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          updated_at?: string
        }
        Update: {
          aspect?: Database["public"]["Enums"]["rule_aspect"]
          conditions?: Json
          created_at?: string
          description?: string
          expression?: string
          expression_type?: Database["public"]["Enums"]["rule_expression_type"]
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      standard_nodes: {
        Row: {
          description: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number
          type: Database["public"]["Enums"]["standard_node_type"]
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number
          type?: Database["public"]["Enums"]["standard_node_type"]
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
          type?: Database["public"]["Enums"]["standard_node_type"]
        }
        Relationships: [
          {
            foreignKeyName: "standard_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "standard_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      standards: {
        Row: {
          created_at: string
          id: string
          node_id: string
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          node_id: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          node_id?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "standards_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "standard_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          blocked_reason: string | null
          completed_date: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          sort_order: number
          start_date: string | null
          status: string
          title: string
          updated_at: string
          workstream_id: string
        }
        Insert: {
          assignee_id?: string | null
          blocked_reason?: string | null
          completed_date?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          sort_order?: number
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          workstream_id: string
        }
        Update: {
          assignee_id?: string | null
          blocked_reason?: string | null
          completed_date?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          sort_order?: number
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          workstream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      source_templates: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          file_type: string
          column_mappings: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          file_type: string
          column_mappings: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          file_type?: string
          column_mappings?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      template_versions: {
        Row: {
          change_summary: string | null
          content: Json
          created_at: string
          created_by: string
          id: string
          template_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          content: Json
          created_at?: string
          created_by: string
          id?: string
          template_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          template_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category_tags: string[] | null
          created_at: string
          current_version: number
          description: string | null
          forked_from_id: string | null
          id: string
          is_archived: boolean
          is_published: boolean
          name: string
          org_id: string
          owner_id: string | null
          scope: string
          team_id: string | null
          thumbnail_url: string | null
          type: string
          updated_at: string
        }
        Insert: {
          category_tags?: string[] | null
          created_at?: string
          current_version?: number
          description?: string | null
          forked_from_id?: string | null
          id?: string
          is_archived?: boolean
          is_published?: boolean
          name: string
          org_id: string
          owner_id?: string | null
          scope: string
          team_id?: string | null
          thumbnail_url?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          category_tags?: string[] | null
          created_at?: string
          current_version?: number
          description?: string | null
          forked_from_id?: string | null
          id?: string
          is_archived?: boolean
          is_published?: boolean
          name?: string
          org_id?: string
          owner_id?: string | null
          scope?: string
          team_id?: string | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_forked_from_id_fkey"
            columns: ["forked_from_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_save: boolean
          auto_save_interval: number
          confirm_deletions: boolean
          created_at: string
          currency: string
          date_format: string
          default_profile_behavior: string
          default_zoom: number
          grid_size: number
          grid_snap: boolean
          id: string
          last_used_profile_id: string | null
          measurement_unit: string
          number_format: string
          show_grid: boolean
          sidebar_collapsed: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save?: boolean
          auto_save_interval?: number
          confirm_deletions?: boolean
          created_at?: string
          currency?: string
          date_format?: string
          default_profile_behavior?: string
          default_zoom?: number
          grid_size?: number
          grid_snap?: boolean
          id?: string
          last_used_profile_id?: string | null
          measurement_unit?: string
          number_format?: string
          show_grid?: boolean
          sidebar_collapsed?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save?: boolean
          auto_save_interval?: number
          confirm_deletions?: boolean
          created_at?: string
          currency?: string
          date_format?: string
          default_profile_behavior?: string
          default_zoom?: number
          grid_size?: number
          grid_snap?: boolean
          id?: string
          last_used_profile_id?: string | null
          measurement_unit?: string
          number_format?: string
          show_grid?: boolean
          sidebar_collapsed?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_last_used_profile_id_fkey"
            columns: ["last_used_profile_id"]
            isOneToOne: false
            referencedRelation: "default_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_info: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_current: boolean
          last_active_at: string
          location: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_current?: boolean
          last_active_at?: string
          location?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_current?: boolean
          last_active_at?: string
          location?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          role: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workstreams: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          sort_order: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workstreams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_quote_totals: { Args: { quote_id: string }; Returns: undefined }
      is_org_admin: { Args: { check_org_id: string }; Returns: boolean }
      is_org_member: { Args: { check_org_id: string }; Returns: boolean }
      is_team_admin: { Args: { check_team_id: string }; Returns: boolean }
      is_team_member: { Args: { check_team_id: string }; Returns: boolean }
    }
    Enums: {
      drawing_type:
        | "electrical"
        | "elevation"
        | "rcp"
        | "rack"
        | "cable_schedule"
        | "floor_plan"
      equipment_category: "video" | "audio" | "control" | "infrastructure"
      platform_type: "teams" | "zoom" | "webex" | "meet" | "multi" | "none"
      project_status:
        | "draft"
        | "quoting"
        | "client_review"
        | "ordered"
        | "in_progress"
        | "completed"
        | "on_hold"
        | "cancelled"
      room_type:
        | "conference"
        | "boardroom"
        | "huddle"
        | "training"
        | "auditorium"
        | "lobby"
        | "custom"
      rule_aspect:
        | "display_count"
        | "microphone_coverage"
        | "speaker_placement"
        | "camera_angle"
        | "cable_length"
        | "rack_space"
        | "power_requirements"
        | "compatibility"
        | "custom"
      rule_expression_type:
        | "comparison"
        | "range"
        | "formula"
        | "lookup"
        | "custom"
      standard_node_type: "category" | "subcategory" | "item"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      drawing_type: [
        "electrical",
        "elevation",
        "rcp",
        "rack",
        "cable_schedule",
        "floor_plan",
      ],
      equipment_category: ["video", "audio", "control", "infrastructure"],
      platform_type: ["teams", "zoom", "webex", "meet", "multi", "none"],
      project_status: [
        "draft",
        "quoting",
        "client_review",
        "ordered",
        "in_progress",
        "completed",
        "on_hold",
        "cancelled",
      ],
      room_type: [
        "conference",
        "boardroom",
        "huddle",
        "training",
        "auditorium",
        "lobby",
        "custom",
      ],
      rule_aspect: [
        "display_count",
        "microphone_coverage",
        "speaker_placement",
        "camera_angle",
        "cable_length",
        "rack_space",
        "power_requirements",
        "compatibility",
        "custom",
      ],
      rule_expression_type: [
        "comparison",
        "range",
        "formula",
        "lookup",
        "custom",
      ],
      standard_node_type: ["category", "subcategory", "item"],
    },
  },
} as const

