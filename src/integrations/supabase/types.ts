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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cost_estimates: {
        Row: {
          area: number
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          estimated_max: number
          estimated_min: number
          floors: number
          id: string
          notes: string | null
          property_type: string
          quality_tier: string
          selected_scopes: string[]
        }
        Insert: {
          area: number
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          estimated_max: number
          estimated_min: number
          floors?: number
          id?: string
          notes?: string | null
          property_type: string
          quality_tier?: string
          selected_scopes?: string[]
        }
        Update: {
          area?: number
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          estimated_max?: number
          estimated_min?: number
          floors?: number
          id?: string
          notes?: string | null
          property_type?: string
          quality_tier?: string
          selected_scopes?: string[]
        }
        Relationships: []
      }
      estimate_requests: {
        Row: {
          area: number | null
          attachments: Json
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string
          estimated_max: number | null
          estimated_min: number | null
          floors: number
          id: string
          message: string | null
          property_type: string
          quality_tier: string
          selected_scopes: string[]
          status: string
        }
        Insert: {
          area?: number | null
          attachments?: Json
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string
          estimated_max?: number | null
          estimated_min?: number | null
          floors?: number
          id?: string
          message?: string | null
          property_type: string
          quality_tier?: string
          selected_scopes?: string[]
          status?: string
        }
        Update: {
          area?: number | null
          attachments?: Json
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string
          estimated_max?: number | null
          estimated_min?: number | null
          floors?: number
          id?: string
          message?: string | null
          property_type?: string
          quality_tier?: string
          selected_scopes?: string[]
          status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          buy_price: number | null
          category: string | null
          created_at: string
          description: string | null
          external_id: number | null
          id: string
          is_active: boolean
          name: string
          product_code: string | null
          unit_price: number | null
          unit_template: string | null
        }
        Insert: {
          brand?: string | null
          buy_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          external_id?: number | null
          id?: string
          is_active?: boolean
          name: string
          product_code?: string | null
          unit_price?: number | null
          unit_template?: string | null
        }
        Update: {
          brand?: string | null
          buy_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          external_id?: number | null
          id?: string
          is_active?: boolean
          name?: string
          product_code?: string | null
          unit_price?: number | null
          unit_template?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          area: string | null
          budget: string | null
          created_at: string
          email: string | null
          floors: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          phone: string
          property_type: string
          services: string[] | null
          status: string
        }
        Insert: {
          area?: string | null
          budget?: string | null
          created_at?: string
          email?: string | null
          floors?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          phone: string
          property_type: string
          services?: string[] | null
          status?: string
        }
        Update: {
          area?: string | null
          budget?: string | null
          created_at?: string
          email?: string | null
          floors?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string
          property_type?: string
          services?: string[] | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
