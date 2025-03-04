export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Document: {
        Row: {
          authorId: string
          content: string
          createdAt: string
          deletedAt: string | null
          id: string
          organizationId: string
          title: string
          updatedAt: string
        }
        Insert: {
          authorId: string
          content: string
          createdAt?: string
          deletedAt?: string | null
          id: string
          organizationId: string
          title: string
          updatedAt: string
        }
        Update: {
          authorId?: string
          content?: string
          createdAt?: string
          deletedAt?: string | null
          id?: string
          organizationId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Document_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Document_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      DocumentActivity: {
        Row: {
          actionType: Database["public"]["Enums"]["DocumentActionType"]
          actorId: string
          createdAt: string
          details: Json
          documentId: string
          id: string
          organizationId: string
        }
        Insert: {
          actionType: Database["public"]["Enums"]["DocumentActionType"]
          actorId: string
          createdAt?: string
          details?: Json
          documentId: string
          id: string
          organizationId: string
        }
        Update: {
          actionType?: Database["public"]["Enums"]["DocumentActionType"]
          actorId?: string
          createdAt?: string
          details?: Json
          documentId?: string
          id?: string
          organizationId?: string
        }
        Relationships: [
          {
            foreignKeyName: "DocumentActivity_actorId_fkey"
            columns: ["actorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DocumentActivity_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DocumentActivity_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      Organization: {
        Row: {
          createdAt: string
          id: string
          name: string
          slug: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          slug: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          slug?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Profile: {
        Row: {
          createdAt: string
          email: string
          id: string
          organizationId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
          organizationId: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          organizationId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Profile_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "Organization"
            referencedColumns: ["id"]
          },
        ]
      }
      Revision: {
        Row: {
          authorId: string
          content: string
          createdAt: string
          documentId: string
          id: string
          status: Database["public"]["Enums"]["RevisionStatus"]
          updatedAt: string
        }
        Insert: {
          authorId: string
          content: string
          createdAt?: string
          documentId: string
          id: string
          status?: Database["public"]["Enums"]["RevisionStatus"]
          updatedAt: string
        }
        Update: {
          authorId?: string
          content?: string
          createdAt?: string
          documentId?: string
          id?: string
          status?: Database["public"]["Enums"]["RevisionStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Revision_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Revision_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
        ]
      }
      RevisionActivity: {
        Row: {
          actionType: Database["public"]["Enums"]["RevisionActionType"]
          actorId: string
          createdAt: string
          id: string
          revisionId: string
        }
        Insert: {
          actionType: Database["public"]["Enums"]["RevisionActionType"]
          actorId: string
          createdAt?: string
          id: string
          revisionId: string
        }
        Update: {
          actionType?: Database["public"]["Enums"]["RevisionActionType"]
          actorId?: string
          createdAt?: string
          id?: string
          revisionId?: string
        }
        Relationships: [
          {
            foreignKeyName: "RevisionActivity_actorId_fkey"
            columns: ["actorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RevisionActivity_revisionId_fkey"
            columns: ["revisionId"]
            isOneToOne: false
            referencedRelation: "Revision"
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
      DocumentActionType: "CREATED" | "UPDATED" | "DELETED"
      RevisionActionType: "CREATED" | "ACCEPTED" | "REJECTED"
      RevisionStatus: "PENDING" | "ACCEPTED" | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

