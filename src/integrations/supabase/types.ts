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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      buyer_requirements: {
        Row: {
          additional_requirements: string | null
          created_at: string
          current_situation: string | null
          email: string
          full_name: string
          id: string
          marketing_consent: boolean | null
          max_budget: number | null
          max_distance: number | null
          min_bathrooms: number
          min_bedrooms: number
          min_budget: number | null
          move_timeline: string | null
          must_have_features: string[] | null
          phone: string | null
          preferred_contact_method: string | null
          preferred_locations: string[] | null
          property_type: string
          requirement_type: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_requirements?: string | null
          created_at?: string
          current_situation?: string | null
          email: string
          full_name: string
          id?: string
          marketing_consent?: boolean | null
          max_budget?: number | null
          max_distance?: number | null
          min_bathrooms?: number
          min_bedrooms?: number
          min_budget?: number | null
          move_timeline?: string | null
          must_have_features?: string[] | null
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_locations?: string[] | null
          property_type: string
          requirement_type: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_requirements?: string | null
          created_at?: string
          current_situation?: string | null
          email?: string
          full_name?: string
          id?: string
          marketing_consent?: boolean | null
          max_budget?: number | null
          max_distance?: number | null
          min_bathrooms?: number
          min_bedrooms?: number
          min_budget?: number | null
          move_timeline?: string | null
          must_have_features?: string[] | null
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_locations?: string[] | null
          property_type?: string
          requirement_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          property_id: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          property_id?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          property_id?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          location: string | null
          phone: string | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          location?: string | null
          phone?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          location?: string | null
          phone?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          allowed_uses: string[] | null
          amenities: string[] | null
          annual_tax: number | null
          architectural_style: string | null
          basement: string | null
          bathrooms: number | null
          bedrooms: number | null
          buildable: string | null
          can_subdivide: string | null
          city: string
          created_at: string
          description: string
          distance_to_grocery: string | null
          distance_to_town: string | null
          featured: boolean | null
          fencing: string | null
          flooring: string[] | null
          id: string
          images: string[] | null
          indoor_features: string[] | null
          land_additional_notes: string | null
          land_views: string[] | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lot_size: number | null
          lot_size_unit: string | null
          neighborhood_amenities: Json | null
          outdoor_amenities: string[] | null
          parcel_number: string | null
          parking: string[] | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          recreational_features: string[] | null
          road_access: string | null
          roofing_type: string | null
          rooms: string[] | null
          square_feet: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"] | null
          title: string
          topography: string | null
          updated_at: string
          user_id: string
          utilities_available: string[] | null
          vegetation: string | null
          views: string[] | null
          water_rights: string | null
          year_built: number | null
          year_renovated: number | null
          zip_code: string
          zoning_type: string | null
        }
        Insert: {
          address: string
          allowed_uses?: string[] | null
          amenities?: string[] | null
          annual_tax?: number | null
          architectural_style?: string | null
          basement?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          buildable?: string | null
          can_subdivide?: string | null
          city: string
          created_at?: string
          description: string
          distance_to_grocery?: string | null
          distance_to_town?: string | null
          featured?: boolean | null
          fencing?: string | null
          flooring?: string[] | null
          id?: string
          images?: string[] | null
          indoor_features?: string[] | null
          land_additional_notes?: string | null
          land_views?: string[] | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lot_size?: number | null
          lot_size_unit?: string | null
          neighborhood_amenities?: Json | null
          outdoor_amenities?: string[] | null
          parcel_number?: string | null
          parking?: string[] | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          recreational_features?: string[] | null
          road_access?: string | null
          roofing_type?: string | null
          rooms?: string[] | null
          square_feet?: number | null
          state: string
          status?: Database["public"]["Enums"]["property_status"] | null
          title: string
          topography?: string | null
          updated_at?: string
          user_id: string
          utilities_available?: string[] | null
          vegetation?: string | null
          views?: string[] | null
          water_rights?: string | null
          year_built?: number | null
          year_renovated?: number | null
          zip_code: string
          zoning_type?: string | null
        }
        Update: {
          address?: string
          allowed_uses?: string[] | null
          amenities?: string[] | null
          annual_tax?: number | null
          architectural_style?: string | null
          basement?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          buildable?: string | null
          can_subdivide?: string | null
          city?: string
          created_at?: string
          description?: string
          distance_to_grocery?: string | null
          distance_to_town?: string | null
          featured?: boolean | null
          fencing?: string | null
          flooring?: string[] | null
          id?: string
          images?: string[] | null
          indoor_features?: string[] | null
          land_additional_notes?: string | null
          land_views?: string[] | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lot_size?: number | null
          lot_size_unit?: string | null
          neighborhood_amenities?: Json | null
          outdoor_amenities?: string[] | null
          parcel_number?: string | null
          parking?: string[] | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          recreational_features?: string[] | null
          road_access?: string | null
          roofing_type?: string | null
          rooms?: string[] | null
          square_feet?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"] | null
          title?: string
          topography?: string | null
          updated_at?: string
          user_id?: string
          utilities_available?: string[] | null
          vegetation?: string | null
          views?: string[] | null
          water_rights?: string | null
          year_built?: number | null
          year_renovated?: number | null
          zip_code?: string
          zoning_type?: string | null
        }
        Relationships: []
      }
      property_offers: {
        Row: {
          counter_amount: number | null
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          offer_amount: number
          property_id: string
          seller_id: string
          seller_response: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          counter_amount?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          offer_amount: number
          property_id: string
          seller_id: string
          seller_response?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          counter_amount?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          offer_amount?: number
          property_id?: string
          seller_id?: string
          seller_response?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_offers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_visits: {
        Row: {
          created_at: string
          id: string
          message: string | null
          preferred_date: string
          preferred_time: string
          property_id: string
          seller_id: string
          seller_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          preferred_date: string
          preferred_time: string
          property_id: string
          seller_id: string
          seller_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          preferred_date?: string
          preferred_time?: string
          property_id?: string
          seller_id?: string
          seller_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string
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
      get_user_emails: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
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
      listing_type: "sale" | "rent"
      property_status:
        | "active"
        | "pending"
        | "sold"
        | "rented"
        | "under_review"
        | "declined"
      property_type:
        | "house"
        | "apartment"
        | "condo"
        | "land"
        | "townhouse"
        | "villa"
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
      listing_type: ["sale", "rent"],
      property_status: [
        "active",
        "pending",
        "sold",
        "rented",
        "under_review",
        "declined",
      ],
      property_type: [
        "house",
        "apartment",
        "condo",
        "land",
        "townhouse",
        "villa",
      ],
    },
  },
} as const
