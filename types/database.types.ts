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
      AuditLogs: {
        Row: {
          actionType: Database["public"]["Enums"]["ActionType"] | null
          id: number
          targetId: string | null
          timestamp: string
          userId: string | null
        }
        Insert: {
          actionType?: Database["public"]["Enums"]["ActionType"] | null
          id?: number
          targetId?: string | null
          timestamp?: string
          userId?: string | null
        }
        Update: {
          actionType?: Database["public"]["Enums"]["ActionType"] | null
          id?: number
          targetId?: string | null
          timestamp?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AuditLogs_targetId_fkey"
            columns: ["targetId"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["userId"]
          },
          {
            foreignKeyName: "AuditLogs_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["userId"]
          },
        ]
      }
      Requests: {
        Row: {
          id: number
          userId: string | null
          requestType: Database["public"]["Enums"]["RequestType"]
          status: Database["public"]["Enums"]["RequestStatus"]
          oldCity: string | null
          newCity: string | null
          reviewedBy: string | null
          reviewedAt: string | null
          created_at: string
        }
        Insert: {
          id?: number
          userId?: string | null
          requestType: Database["public"]["Enums"]["RequestType"]
          status?: Database["public"]["Enums"]["RequestStatus"]
          oldCity?: string | null
          newCity?: string | null
          reviewedBy?: string | null
          reviewedAt?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          userId?: string | null
          requestType?: Database["public"]["Enums"]["RequestType"]
          status?: Database["public"]["Enums"]["RequestStatus"]
          oldCity?: string | null
          newCity?: string | null
          reviewedBy?: string | null
          reviewedAt?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Requests_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["userId"]
          },
          {
            foreignKeyName: "Requests_reviewedBy_fkey"
            columns: ["reviewedBy"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["userId"]
          },
        ]
      }
      Users: {
        Row: {
          approvalStatus: Database["public"]["Enums"]["ApprovalStatus"] | null
          created_at: string
          email: string | null
          firstName: string | null
          lastName: string | null
          officeLocation: string | null
          phoneNumber: string | null
          profilePicture: string | null
          role: Database["public"]["Enums"]["Role"]
          userId: string
        }
        Insert: {
          approvalStatus?: Database["public"]["Enums"]["ApprovalStatus"] | null
          created_at?: string
          email?: string | null
          firstName?: string | null
          lastName?: string | null
          officeLocation?: string | null
          phoneNumber?: string | null
          profilePicture?: string | null
          role?: Database["public"]["Enums"]["Role"]
          userId?: string
        }
        Update: {
          approvalStatus?: Database["public"]["Enums"]["ApprovalStatus"] | null
          created_at?: string
          email?: string | null
          firstName?: string | null
          lastName?: string | null
          officeLocation?: string | null
          phoneNumber?: string | null
          profilePicture?: string | null
          role?: Database["public"]["Enums"]["Role"]
          userId?: string
        }
        Relationships: []
      }
      UserSettings: {
        Row: {
          created_at: string
          currency: string | null
          userId: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          userId?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          userId?: string | null
        }
        Relationships: []
      }
            Listings: {
        Row: {
          baths?: number
          beds?: number
          created_at: string
          id: number
          location: string
          photos?: string[]
          price: number
          propertyType: Database["public"]["Enums"]["PropertyType"]
          rentPeriod: "WEEKLY" | "BIWEEKLY" | "MONTHLY"
          title: string
          userId: string
        }
        Insert: {
          baths?: number
          beds?: number
          created_at?: string
          id?: number
          location: string
          photos?: string[]
          price: number
          propertyType: Database["public"]["Enums"]["PropertyType"]
          rentPeriod: "WEEKLY" | "BIWEEKLY" | "MONTHLY"
          title: string
          userId: string
        }
        Update: {
          baths?: number
          beds?: number
          created_at?: string
          id?: number
          location?: string
          photos?: string[]
          price?: number
          propertyType?: Database["public"]["Enums"]["PropertyType"]
          rentPeriod?: "WEEKLY" | "BIWEEKLY" | "MONTHLY"
          title?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Listings_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["userId"]
          },
        ]
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      ActionType:
        | "USER_APPROVED"
        | "USER_DENIED"
        | "USER_BANNED"
        | "MESSAGE_DELETED"
        | "SIGN_UP_REQUESTED"
        | "SIGN_UP_APPROVED"
        | "SIGN_UP_DENIED"
        | "CITY_CHANGE_REQUESTED"
        | "CITY_CHANGE_APPROVED"
        | "CITY_CHANGE_DENIED"
      ApprovalStatus: "PENDING" | "APPROVED" | "REJECTED"
      PropertyType:
        | "FLAT"
        | "STUDIO"
        | "TERRACEDHOUSE"
        | "SEMIDETACHED"
        | "DETACHED"
      RequestType: "SIGN_UP" | "CITY_CHANGE"
      RequestStatus: "PENDING" | "APPROVED" | "REJECTED"
      Role: "ADMIN" | "CONSULTANT"
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
      ActionType: [
        "USER_APPROVED",
        "USER_DENIED",
        "USER_BANNED",
        "MESSAGE_DELETED",
        "SIGN_UP_REQUESTED",
        "SIGN_UP_APPROVED",
        "SIGN_UP_DENIED",
        "CITY_CHANGE_REQUESTED",
        "CITY_CHANGE_APPROVED",
        "CITY_CHANGE_DENIED",
      ],
      ApprovalStatus: ["PENDING", "APPROVED", "REJECTED"],
      PropertyType: [
        "FLAT",
        "STUDIO",
        "TERRACEDHOUSE",
        "SEMIDETACHED",
        "DETACHED",
      ],
      RequestType: ["SIGN_UP", "CITY_CHANGE"],
      RequestStatus: ["PENDING", "APPROVED", "REJECTED"],
      Role: ["ADMIN", "CONSULTANT"],
    },
  },
} as const
