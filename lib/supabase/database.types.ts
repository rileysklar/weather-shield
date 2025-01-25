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
      project_sites: {
        Row: {
          center_point: unknown
          coordinates: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          site_type: Database["public"]["Enums"]["project_site_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          center_point: unknown
          coordinates: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          site_type: Database["public"]["Enums"]["project_site_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          center_point?: unknown
          coordinates?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          site_type?: Database["public"]["Enums"]["project_site_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          alerts: Json | null
          clouds_percentage: number | null
          data_source: string
          feels_like: number | null
          forecast_periods: Json | null
          has_active_alerts: boolean | null
          highest_alert_severity:
            | Database["public"]["Enums"]["weather_alert_severity"]
            | null
          humidity: number | null
          id: string
          pressure: number | null
          project_site_id: string
          raw_response: Json | null
          temperature: number | null
          timestamp: string | null
          visibility: number | null
          weather_condition: string | null
          weather_description: string | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          alerts?: Json | null
          clouds_percentage?: number | null
          data_source: string
          feels_like?: number | null
          forecast_periods?: Json | null
          has_active_alerts?: boolean | null
          highest_alert_severity?:
            | Database["public"]["Enums"]["weather_alert_severity"]
            | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          project_site_id: string
          raw_response?: Json | null
          temperature?: number | null
          timestamp?: string | null
          visibility?: number | null
          weather_condition?: string | null
          weather_description?: string | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          alerts?: Json | null
          clouds_percentage?: number | null
          data_source?: string
          feels_like?: number | null
          forecast_periods?: Json | null
          has_active_alerts?: boolean | null
          highest_alert_severity?:
            | Database["public"]["Enums"]["weather_alert_severity"]
            | null
          humidity?: number | null
          id?: string
          pressure?: number | null
          project_site_id?: string
          raw_response?: Json | null
          temperature?: number | null
          timestamp?: string | null
          visibility?: number | null
          weather_condition?: string | null
          weather_description?: string | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_project_site_id_fkey"
            columns: ["project_site_id"]
            isOneToOne: false
            referencedRelation: "project_sites"
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
      project_site_type:
        | "solar_array"
        | "wind_farm"
        | "hydroelectric"
        | "coal"
        | "natural_gas"
        | "nuclear"
        | "geothermal"
        | "biomass"
        | "other"
      weather_alert_severity: "minor" | "moderate" | "severe" | "extreme"
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
