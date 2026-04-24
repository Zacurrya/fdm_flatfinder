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
      audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          id: number
          target_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          id?: number
          target_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          id?: number
          target_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "AuditLogs_targetId_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "AuditLogs_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chat_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          last_message_id: string | null
          listing_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          last_message_id?: string | null
          listing_id?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          last_message_id?: string | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_locations: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          bathrooms: number
          bedrooms: number
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          location_id: string
          media_urls: string[]
          owner_id: string
          price: number
          rent_period: Database["public"]["Enums"]["rent_period"] | null
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          bathrooms: number
          bedrooms: number
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location_id?: string
          media_urls: string[]
          owner_id: string
          price: number
          rent_period?: Database["public"]["Enums"]["rent_period"] | null
          source?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location_id?: string
          media_urls?: string[]
          owner_id?: string
          price?: number
          rent_period?: Database["public"]["Enums"]["rent_period"] | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "listing_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          country_code: string
          created_at: string | null
          id: string
          name: string
          region: string
        }
        Insert: {
          country_code: string
          created_at?: string | null
          id?: string
          name: string
          region: string
        }
        Update: {
          country_code?: string
          created_at?: string | null
          id?: string
          name?: string
          region?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          chat_id?: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          id: number
          listing_id: number | null
          new_city: string | null
          old_city: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          reviewed_At: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          listing_id?: number | null
          new_city?: string | null
          old_city?: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          reviewed_At?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          listing_id?: number | null
          new_city?: string | null
          old_city?: string | null
          request_type?: Database["public"]["Enums"]["request_type"]
          reviewed_At?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Requests_reviewedBy_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Requests_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_favourites: {
        Row: {
          created_at: string
          id: number
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          listing_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favourites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserFavourites_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          last_name: string
          office_location: string
          phone_number: string
          role: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          last_name: string
          office_location?: string
          phone_number: string
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          last_name?: string
          office_location?: string
          phone_number?: string
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      action_type:
        | "USER_APPROVED"
        | "USER_DENIED"
        | "USER_BANNED"
        | "MESSAGE_DELETED"
        | "CITY_CHANGE_APPROVED"
        | "CITY_CHANGE_DENIED"
        | "SIGN_UP_APPROVED"
        | "SIGN_UP_DENIED"
        | "CITY_CHANGED"
        | "LISTING_UPLOAD_REQUESTED"
        | "LISTING_UPLOAD_APPROVED"
        | "LISTING_UPLOAD_DENIED"
      approval_status: "PENDING" | "APPROVED" | "REJECTED"
      listing_source:
        | "FDM"
        | "RIGHTMOVE"
        | "OPENRENT"
        | "ZOOPLA"
        | "PROPERTYGURU"
      listing_status: "AVAILABLE" | "DRAFT" | "SOLD"
      property_type:
        | "FLAT"
        | "STUDIO"
        | "TERRACEDHOUSE"
        | "SEMIDETACHED"
        | "DETACHED"
      rent_period: "WEEKLY" | "BIWEEKLY" | "MONTHLY"
      request_status: "PENDING" | "APPROVED" | "REJECTED"
      request_type: "SIGN_UP" | "CITY_CHANGE" | "LISTING_UPLOAD"
      role: "ADMIN" | "CONSULTANT"
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
      action_type: [
        "USER_APPROVED",
        "USER_DENIED",
        "USER_BANNED",
        "MESSAGE_DELETED",
        "CITY_CHANGE_APPROVED",
        "CITY_CHANGE_DENIED",
        "SIGN_UP_APPROVED",
        "SIGN_UP_DENIED",
        "CITY_CHANGED",
        "LISTING_UPLOAD_REQUESTED",
        "LISTING_UPLOAD_APPROVED",
        "LISTING_UPLOAD_DENIED",
      ],
      approval_status: ["PENDING", "APPROVED", "REJECTED"],
      listing_source: [
        "FDM",
        "RIGHTMOVE",
        "OPENRENT",
        "ZOOPLA",
        "PROPERTYGURU",
      ],
      listing_status: ["AVAILABLE", "DRAFT", "SOLD"],
      property_type: [
        "FLAT",
        "STUDIO",
        "TERRACEDHOUSE",
        "SEMIDETACHED",
        "DETACHED",
      ],
      rent_period: ["WEEKLY", "BIWEEKLY", "MONTHLY"],
      request_status: ["PENDING", "APPROVED", "REJECTED"],
      request_type: ["SIGN_UP", "CITY_CHANGE", "LISTING_UPLOAD"],
      role: ["ADMIN", "CONSULTANT"],
    },
  },
} as const
