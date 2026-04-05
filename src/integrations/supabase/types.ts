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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          account_number: string | null
          account_type: string | null
          address: string | null
          alien_registration_number: string | null
          availability: Json | null
          background_consent: boolean | null
          background_date: string | null
          background_signature: string | null
          bank_name: string | null
          citizenship_status: string | null
          city: string | null
          country_of_issuance: string | null
          created_at: string
          date_of_birth: string | null
          desired_position: string | null
          desired_salary: string | null
          direct_deposit_consent: boolean | null
          email: string | null
          emergency_contact_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          foreign_passport_number: string | null
          full_form_data: Json
          id: string
          last_name: string
          middle_name: string | null
          phone: string | null
          policy_acknowledgements: Json | null
          routing_number: string | null
          ssn: string | null
          start_date: string | null
          state: string | null
          uniform_pants_size: string | null
          uniform_shirt_size: string | null
          uniform_shoe_size: string | null
          uscis_number: string | null
          w2_additional_withholding: string | null
          w2_allowances: string | null
          w2_filing_status: string | null
          work_authorization_expiration: string | null
          zip_code: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          address?: string | null
          alien_registration_number?: string | null
          availability?: Json | null
          background_consent?: boolean | null
          background_date?: string | null
          background_signature?: string | null
          bank_name?: string | null
          citizenship_status?: string | null
          city?: string | null
          country_of_issuance?: string | null
          created_at?: string
          date_of_birth?: string | null
          desired_position?: string | null
          desired_salary?: string | null
          direct_deposit_consent?: boolean | null
          email?: string | null
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          foreign_passport_number?: string | null
          full_form_data: Json
          id?: string
          last_name: string
          middle_name?: string | null
          phone?: string | null
          policy_acknowledgements?: Json | null
          routing_number?: string | null
          ssn?: string | null
          start_date?: string | null
          state?: string | null
          uniform_pants_size?: string | null
          uniform_shirt_size?: string | null
          uniform_shoe_size?: string | null
          uscis_number?: string | null
          w2_additional_withholding?: string | null
          w2_allowances?: string | null
          w2_filing_status?: string | null
          work_authorization_expiration?: string | null
          zip_code?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          address?: string | null
          alien_registration_number?: string | null
          availability?: Json | null
          background_consent?: boolean | null
          background_date?: string | null
          background_signature?: string | null
          bank_name?: string | null
          citizenship_status?: string | null
          city?: string | null
          country_of_issuance?: string | null
          created_at?: string
          date_of_birth?: string | null
          desired_position?: string | null
          desired_salary?: string | null
          direct_deposit_consent?: boolean | null
          email?: string | null
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          foreign_passport_number?: string | null
          full_form_data?: Json
          id?: string
          last_name?: string
          middle_name?: string | null
          phone?: string | null
          policy_acknowledgements?: Json | null
          routing_number?: string | null
          ssn?: string | null
          start_date?: string | null
          state?: string | null
          uniform_pants_size?: string | null
          uniform_shirt_size?: string | null
          uniform_shoe_size?: string | null
          uscis_number?: string | null
          w2_additional_withholding?: string | null
          w2_allowances?: string | null
          w2_filing_status?: string | null
          work_authorization_expiration?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      employment_applications: {
        Row: {
          address: string | null
          applied_before: boolean | null
          applied_before_when: string | null
          certification_acknowledged: boolean | null
          city: string | null
          contact_suggestion: string | null
          convicted: boolean | null
          conviction_details: string | null
          created_at: string
          date_of_birth: string | null
          drivers_license_number: string | null
          education: Json | null
          eligible_to_work: boolean | null
          email: string | null
          employed_here_before: boolean | null
          employed_here_when: string | null
          employment_history: Json | null
          employment_type: string | null
          ever_fired: boolean | null
          fired_details: string | null
          first_name: string
          full_form_data: Json
          has_drivers_license: boolean | null
          id: string
          is_18_or_older: boolean | null
          job_applied_for: string | null
          last_name: string
          level2_license: boolean | null
          level3_license: boolean | null
          level4_license: boolean | null
          license_class: string | null
          license_suspended: boolean | null
          license_suspended_details: string | null
          machines_equipment: string | null
          middle_name: string | null
          other_names: string | null
          other_names_used: boolean | null
          outside_employment: boolean | null
          outside_employment_details: string | null
          personal_references: Json | null
          phone: string | null
          presently_employed: boolean | null
          professional_activities: string | null
          signature_date: string | null
          skills_training: string | null
          ssn: string | null
          start_date: string | null
          state: string | null
          state_licensed_in: string | null
          todays_date: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          applied_before?: boolean | null
          applied_before_when?: string | null
          certification_acknowledged?: boolean | null
          city?: string | null
          contact_suggestion?: string | null
          convicted?: boolean | null
          conviction_details?: string | null
          created_at?: string
          date_of_birth?: string | null
          drivers_license_number?: string | null
          education?: Json | null
          eligible_to_work?: boolean | null
          email?: string | null
          employed_here_before?: boolean | null
          employed_here_when?: string | null
          employment_history?: Json | null
          employment_type?: string | null
          ever_fired?: boolean | null
          fired_details?: string | null
          first_name: string
          full_form_data: Json
          has_drivers_license?: boolean | null
          id?: string
          is_18_or_older?: boolean | null
          job_applied_for?: string | null
          last_name: string
          level2_license?: boolean | null
          level3_license?: boolean | null
          level4_license?: boolean | null
          license_class?: string | null
          license_suspended?: boolean | null
          license_suspended_details?: string | null
          machines_equipment?: string | null
          middle_name?: string | null
          other_names?: string | null
          other_names_used?: boolean | null
          outside_employment?: boolean | null
          outside_employment_details?: string | null
          personal_references?: Json | null
          phone?: string | null
          presently_employed?: boolean | null
          professional_activities?: string | null
          signature_date?: string | null
          skills_training?: string | null
          ssn?: string | null
          start_date?: string | null
          state?: string | null
          state_licensed_in?: string | null
          todays_date?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          applied_before?: boolean | null
          applied_before_when?: string | null
          certification_acknowledged?: boolean | null
          city?: string | null
          contact_suggestion?: string | null
          convicted?: boolean | null
          conviction_details?: string | null
          created_at?: string
          date_of_birth?: string | null
          drivers_license_number?: string | null
          education?: Json | null
          eligible_to_work?: boolean | null
          email?: string | null
          employed_here_before?: boolean | null
          employed_here_when?: string | null
          employment_history?: Json | null
          employment_type?: string | null
          ever_fired?: boolean | null
          fired_details?: string | null
          first_name?: string
          full_form_data?: Json
          has_drivers_license?: boolean | null
          id?: string
          is_18_or_older?: boolean | null
          job_applied_for?: string | null
          last_name?: string
          level2_license?: boolean | null
          level3_license?: boolean | null
          level4_license?: boolean | null
          license_class?: string | null
          license_suspended?: boolean | null
          license_suspended_details?: string | null
          machines_equipment?: string | null
          middle_name?: string | null
          other_names?: string | null
          other_names_used?: boolean | null
          outside_employment?: boolean | null
          outside_employment_details?: string | null
          personal_references?: Json | null
          phone?: string | null
          presently_employed?: boolean | null
          professional_activities?: string | null
          signature_date?: string | null
          skills_training?: string | null
          ssn?: string | null
          start_date?: string | null
          state?: string | null
          state_licensed_in?: string | null
          todays_date?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      retell_calls: {
        Row: {
          call_id: string | null
          call_status: string | null
          call_type: string | null
          callee_number: string | null
          caller_number: string | null
          created_at: string
          custom_data: Json | null
          direction: string | null
          duration_ms: number | null
          end_time: string | null
          id: string
          metadata: Json | null
          recording_url: string | null
          retell_agent_id: string | null
          sentiment: string | null
          start_time: string | null
          summary: string | null
          transcript: string | null
        }
        Insert: {
          call_id?: string | null
          call_status?: string | null
          call_type?: string | null
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string
          custom_data?: Json | null
          direction?: string | null
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          recording_url?: string | null
          retell_agent_id?: string | null
          sentiment?: string | null
          start_time?: string | null
          summary?: string | null
          transcript?: string | null
        }
        Update: {
          call_id?: string | null
          call_status?: string | null
          call_type?: string | null
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string
          custom_data?: Json | null
          direction?: string | null
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          recording_url?: string | null
          retell_agent_id?: string | null
          sentiment?: string | null
          start_time?: string | null
          summary?: string | null
          transcript?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
