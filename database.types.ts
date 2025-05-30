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
      consumption_methods: {
        Row: {
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      effects: {
        Row: {
          category: Database["public"]["Enums"]["effect_category"]
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["effect_category"]
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["effect_category"]
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      session_custom_tags: {
        Row: {
          session_id: string
          tag_id: string
        }
        Insert: {
          session_id: string
          tag_id: string
        }
        Update: {
          session_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_custom_tags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_custom_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_custom_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      session_effects: {
        Row: {
          effect_id: string
          intensity: number | null
          session_id: string
        }
        Insert: {
          effect_id: string
          intensity?: number | null
          session_id: string
        }
        Update: {
          effect_id?: string
          intensity?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_effects_effect_id_fkey"
            columns: ["effect_id"]
            isOneToOne: false
            referencedRelation: "effects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_effects_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          amount: number
          amount_unit: Database["public"]["Enums"]["amount_unit"]
          consumption_method_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          logged_at: string | null
          mood_after: string | null
          mood_before: string | null
          notes: string | null
          rating: number | null
          strain_id: string
          user_id: string
        }
        Insert: {
          amount: number
          amount_unit?: Database["public"]["Enums"]["amount_unit"]
          consumption_method_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          logged_at?: string | null
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          rating?: number | null
          strain_id: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_unit?: Database["public"]["Enums"]["amount_unit"]
          consumption_method_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          logged_at?: string | null
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          rating?: number | null
          strain_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_consumption_method_id_fkey"
            columns: ["consumption_method_id"]
            isOneToOne: false
            referencedRelation: "consumption_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      strains: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          notes: string | null
          type: Database["public"]["Enums"]["strain_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          notes?: string | null
          type: Database["public"]["Enums"]["strain_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["strain_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_custom_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_stats_cache: {
        Row: {
          avg_rating: number | null
          favorite_strain_id: string | null
          last_session_at: string | null
          total_amount_g: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_rating?: number | null
          favorite_strain_id?: string | null
          last_session_at?: string | null
          total_amount_g?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_rating?: number | null
          favorite_strain_id?: string | null
          last_session_at?: string | null
          total_amount_g?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_cache_favorite_strain_id_fkey"
            columns: ["favorite_strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      amount_unit: "g" | "mg" | "ml" | "units"
      effect_category: "positive" | "negative" | "medical"
      strain_type: "indica" | "sativa" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      amount_unit: ["g", "mg", "ml", "units"],
      effect_category: ["positive", "negative", "medical"],
      strain_type: ["indica", "sativa", "hybrid"],
    },
  },
} as const
