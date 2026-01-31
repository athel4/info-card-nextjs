export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_model_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          model_name: string
          setting_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          model_name: string
          setting_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          model_name?: string
          setting_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      anonymous_limits: {
        Row: {
          created_at: string
          daily_credit_limit: number
          id: string
          is_active: boolean
          reset_interval_hours: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_credit_limit?: number
          id?: string
          is_active?: boolean
          reset_interval_hours?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_credit_limit?: number
          id?: string
          is_active?: boolean
          reset_interval_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      anonymous_usage: {
        Row: {
          created_at: string
          credits_used: number
          id: string
          ip_address: unknown
          last_reset: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          id?: string
          ip_address: unknown
          last_reset?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          id?: string
          ip_address?: unknown
          last_reset?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_card_contacts: {
        Row: {
          company: string | null
          created_at: string
          department: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          middle_name: string | null
          notes: string | null
          primary_address: string | null
          primary_city: string | null
          primary_country: string | null
          primary_email: string | null
          primary_phone: string | null
          primary_phone_country_code: string | null
          primary_postal_code: string | null
          primary_state: string | null
          primary_website: string | null
          secondary_address: string | null
          secondary_city: string | null
          secondary_country: string | null
          secondary_email: string | null
          secondary_first_name: string | null
          secondary_last_name: string | null
          secondary_middle_name: string | null
          secondary_phone: string | null
          secondary_phone_country_code: string | null
          secondary_postal_code: string | null
          secondary_state: string | null
          secondary_website: string | null
          session_id: string
          tertiary_address: string | null
          tertiary_city: string | null
          tertiary_country: string | null
          tertiary_email: string | null
          tertiary_first_name: string | null
          tertiary_last_name: string | null
          tertiary_middle_name: string | null
          tertiary_phone: string | null
          tertiary_phone_country_code: string | null
          tertiary_postal_code: string | null
          tertiary_state: string | null
          tertiary_website: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          middle_name?: string | null
          notes?: string | null
          primary_address?: string | null
          primary_city?: string | null
          primary_country?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          primary_phone_country_code?: string | null
          primary_postal_code?: string | null
          primary_state?: string | null
          primary_website?: string | null
          secondary_address?: string | null
          secondary_city?: string | null
          secondary_country?: string | null
          secondary_email?: string | null
          secondary_first_name?: string | null
          secondary_last_name?: string | null
          secondary_middle_name?: string | null
          secondary_phone?: string | null
          secondary_phone_country_code?: string | null
          secondary_postal_code?: string | null
          secondary_state?: string | null
          secondary_website?: string | null
          session_id: string
          tertiary_address?: string | null
          tertiary_city?: string | null
          tertiary_country?: string | null
          tertiary_email?: string | null
          tertiary_first_name?: string | null
          tertiary_last_name?: string | null
          tertiary_middle_name?: string | null
          tertiary_phone?: string | null
          tertiary_phone_country_code?: string | null
          tertiary_postal_code?: string | null
          tertiary_state?: string | null
          tertiary_website?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          middle_name?: string | null
          notes?: string | null
          primary_address?: string | null
          primary_city?: string | null
          primary_country?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          primary_phone_country_code?: string | null
          primary_postal_code?: string | null
          primary_state?: string | null
          primary_website?: string | null
          secondary_address?: string | null
          secondary_city?: string | null
          secondary_country?: string | null
          secondary_email?: string | null
          secondary_first_name?: string | null
          secondary_last_name?: string | null
          secondary_middle_name?: string | null
          secondary_phone?: string | null
          secondary_phone_country_code?: string | null
          secondary_postal_code?: string | null
          secondary_state?: string | null
          secondary_website?: string | null
          session_id?: string
          tertiary_address?: string | null
          tertiary_city?: string | null
          tertiary_country?: string | null
          tertiary_email?: string | null
          tertiary_first_name?: string | null
          tertiary_last_name?: string | null
          tertiary_middle_name?: string | null
          tertiary_phone?: string | null
          tertiary_phone_country_code?: string | null
          tertiary_postal_code?: string | null
          tertiary_state?: string | null
          tertiary_website?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_card_contacts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "business_card_processing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      business_card_generated_results: {
        Row: {
          action_url: string | null
          contact_id: string
          contact_name: string | null
          content: string
          created_at: string
          id: string
          metadata: Json | null
          session_id: string
          tags: string[] | null
          template_used: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          contact_id: string
          contact_name?: string | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id: string
          tags?: string[] | null
          template_used?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          contact_id?: string
          contact_name?: string | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          tags?: string[] | null
          template_used?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_card_generated_results_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "business_card_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_card_generated_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "business_card_processing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      business_card_processing_sessions: {
        Row: {
          created_at: string
          credits_consumed: number
          extracted_data: Json | null
          files_processed: number
          generated_results: Json | null
          id: string
          processing_status: string
          prompt_used: string | null
          session_name: string | null
          template_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_consumed?: number
          extracted_data?: Json | null
          files_processed?: number
          generated_results?: Json | null
          id?: string
          processing_status?: string
          prompt_used?: string | null
          session_name?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_consumed?: number
          extracted_data?: Json | null
          files_processed?: number
          generated_results?: Json | null
          id?: string
          processing_status?: string
          prompt_used?: string | null
          session_name?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_card_processing_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_limit_usage: {
        Row: {
          browser_fingerprint: string | null
          created_at: string
          credits_granted_date: string | null
          credits_used: number
          id: string
          ip_address: unknown | null
          last_reset: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          browser_fingerprint?: string | null
          created_at?: string
          credits_granted_date?: string | null
          credits_used?: number
          id?: string
          ip_address?: unknown | null
          last_reset?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          browser_fingerprint?: string | null
          created_at?: string
          credits_granted_date?: string | null
          credits_used?: number
          id?: string
          ip_address?: unknown | null
          last_reset?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      package_credit_usage: {
        Row: {
          created_at: string | null
          credits_consumed: number
          id: string
          operation_details: Json | null
          operation_type: string
          package_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_consumed?: number
          id?: string
          operation_details?: Json | null
          operation_type: string
          package_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_consumed?: number
          id?: string
          operation_details?: Json | null
          operation_type?: string
          package_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          anonymous_limit_id: string | null
          billing_interval: string | null
          created_at: string | null
          credit_limit: number
          features: Json | null
          id: string
          is_active: boolean | null
          is_subscription: boolean | null
          name: string
          price_monthly: number | null
          stripe_price_id: string | null
          stripe_yearly_price_id: string | null
          stripe_payment_url: string | null
          tier: Database["public"]["Enums"]["package_tier"]
          updated_at: string | null
          plan_description:string |null
          reset_quota_on_renew: boolean | null
        }
        Insert: {
          anonymous_limit_id?: string | null
          billing_interval?: string | null
          created_at?: string | null
          credit_limit?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_subscription?: boolean | null
          name: string
          price_monthly?: number | null
          stripe_price_id?: string | null
          stripe_yearly_price_id?: string | null
          tier: Database["public"]["Enums"]["package_tier"]
          updated_at?: string | null
          plan_description?:string |null
          reset_quota_on_renew?: boolean | null
        }
        Update: {
          anonymous_limit_id?: string | null
          billing_interval?: string | null
          created_at?: string | null
          credit_limit?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_subscription?: boolean | null
          name?: string
          price_monthly?: number | null
          stripe_price_id?: string | null
          stripe_yearly_price_id?: string | null
          tier?: Database["public"]["Enums"]["package_tier"]
          updated_at?: string | null
          plan_description?:string |null
          reset_quota_on_renew?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_anonymous_limit_id_fkey"
            columns: ["anonymous_limit_id"]
            isOneToOne: false
            referencedRelation: "anonymous_limits"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          credits_purchased: number
          currency: string
          id: string
          package_id: string
          payment_type: string | null
          status: string
          stripe_session_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_purchased?: number
          currency?: string
          id?: string
          package_id: string
          payment_type?: string | null
          status: string
          stripe_session_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_purchased?: number
          currency?: string
          id?: string
          package_id?: string
          payment_type?: string | null
          status?: string
          stripe_session_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_template_sublink: {
        Row: {
          id: string
          sub_template_id: string | null
          template_id: string | null
        }
        Insert: {
          id?: string
          sub_template_id?: string | null
          template_id?: string | null
        }
        Update: {
          id?: string
          sub_template_id?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_template_sublink_sub_template_id_fkey"
            columns: ["sub_template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_template_sublink_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          created_at: string
          description: string | null
          flexibility_level: string | null
          generation_cost: number | null
          id: string
          is_active: boolean
          name: string
          pattern_text: string | null
          prompt_text: string
          required_placeholders: string[] | null
          show_in_analyzer_page: boolean | null
          sort_order: number | null
          template_type: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          flexibility_level?: string | null
          generation_cost?: number | null
          id?: string
          is_active?: boolean
          name: string
          pattern_text?: string | null
          prompt_text: string
          required_placeholders?: string[] | null
          show_in_analyzer_page?: boolean | null
          sort_order?: number | null
          template_type: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          flexibility_level?: string | null
          generation_cost?: number | null
          id?: string
          is_active?: boolean
          name?: string
          pattern_text?: string | null
          prompt_text?: string
          required_placeholders?: string[] | null
          show_in_analyzer_page?: boolean | null
          sort_order?: number | null
          template_type?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_package_history: {
        Row: {
          created_at: string
          id: string
          last_package_id: string
          last_updated: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_package_id: string
          last_updated?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_package_id?: string
          last_updated?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_package_history_package"
            columns: ["last_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_packages: {
        Row: {
          cancel_at_period_end: boolean | null
          credits_remaining: number
          credits_used: number
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          package_id: string
          started_at: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          credits_remaining?: number
          credits_used?: number
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id: string
          started_at?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          credits_remaining?: number
          credits_used?: number
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id?: string
          started_at?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_packages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_templates: {
        Row: {
          created_at: string | null
          description: string | null
          flexibility_level: string
          id: string
          is_active: boolean | null
          name: string
          pattern_text: string
          required_placeholders: string[] | null
          sort_order: number | null
          template_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flexibility_level?: string
          id?: string
          is_active?: boolean | null
          name: string
          pattern_text: string
          required_placeholders?: string[] | null
          sort_order?: number | null
          template_type?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flexibility_level?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pattern_text?: string
          required_placeholders?: string[] | null
          sort_order?: number | null
          template_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      package_tier: "free" | "basic" | "premium" | "enterprise"
      user_role: "end_user" | "admin"
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
      package_tier: ["free", "basic", "premium", "enterprise"],
      user_role: ["end_user", "admin"],
    },
  },
} as const
