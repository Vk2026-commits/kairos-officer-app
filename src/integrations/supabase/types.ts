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
