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
      countries_v2: {
        Row: {
          created_at: string | null
          id: string
          iso_code: string | null
          name: string
          oddsapi_slug: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          iso_code?: string | null
          name: string
          oddsapi_slug?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          iso_code?: string | null
          name?: string
          oddsapi_slug?: string | null
        }
        Relationships: []
      }
      events_to_track: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string | null
          event_date: string | null
          event_id: number
          home_score: number | null
          home_team_id: string | null
          league_slug: string | null
          next_scan_at: string | null
          player1_id: string | null
          player2_id: string | null
          sport_slug: string
          state: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          event_date?: string | null
          event_id: number
          home_score?: number | null
          home_team_id?: string | null
          league_slug?: string | null
          next_scan_at?: string | null
          player1_id?: string | null
          player2_id?: string | null
          sport_slug: string
          state: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          event_date?: string | null
          event_id?: number
          home_score?: number | null
          home_team_id?: string | null
          league_slug?: string | null
          next_scan_at?: string | null
          player1_id?: string | null
          player2_id?: string | null
          sport_slug?: string
          state?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_to_track_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "players_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "players_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues_v2: {
        Row: {
          active: boolean | null
          country_id: string | null
          created_at: string | null
          display_name: string | null
          id: string
          name: string
          oddsapi_slug: string
          slug: string
          sport_id: string
        }
        Insert: {
          active?: boolean | null
          country_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          name: string
          oddsapi_slug: string
          slug: string
          sport_id: string
        }
        Update: {
          active?: boolean | null
          country_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          name?: string
          oddsapi_slug?: string
          slug?: string
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_v2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_v2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "leagues_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      markets_v2: {
        Row: {
          active: boolean | null
          created_at: string | null
          handicap: number | null
          id: string
          market_type: string
          oddsapi_key: string
          period: string | null
          sport_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          handicap?: number | null
          id?: string
          market_type: string
          oddsapi_key: string
          period?: string | null
          sport_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          handicap?: number | null
          id?: string
          market_type?: string
          oddsapi_key?: string
          period?: string | null
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "markets_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "markets_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          detailed_score: Json | null
          event_date: string | null
          event_id: number
          home_score: number | null
          home_team_id: string | null
          league_slug: string | null
          player1_id: string | null
          player2_id: string | null
          settled_at: string | null
          sport_slug: string
          status: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          detailed_score?: Json | null
          event_date?: string | null
          event_id: number
          home_score?: number | null
          home_team_id?: string | null
          league_slug?: string | null
          player1_id?: string | null
          player2_id?: string | null
          settled_at?: string | null
          sport_slug: string
          status?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          detailed_score?: Json | null
          event_date?: string | null
          event_id?: number
          home_score?: number | null
          home_team_id?: string | null
          league_slug?: string | null
          player1_id?: string | null
          player2_id?: string | null
          settled_at?: string | null
          sport_slug?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events_to_track"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "match_results_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "players_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "players_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_closing_observed: {
        Row: {
          bookmaker: string | null
          closing_price_observed: number | null
          closing_time_observed: string | null
          created_at: string | null
          event_id: number
          id: string
          is_winner: boolean | null
          league_slug: string | null
          line: number | null
          market_name: string
          opening_price_observed: number | null
          opening_time_observed: string | null
          selection: string
          sport_slug: string
          updated_at: string | null
        }
        Insert: {
          bookmaker?: string | null
          closing_price_observed?: number | null
          closing_time_observed?: string | null
          created_at?: string | null
          event_id: number
          id?: string
          is_winner?: boolean | null
          league_slug?: string | null
          line?: number | null
          market_name: string
          opening_price_observed?: number | null
          opening_time_observed?: string | null
          selection: string
          sport_slug: string
          updated_at?: string | null
        }
        Update: {
          bookmaker?: string | null
          closing_price_observed?: number | null
          closing_time_observed?: string | null
          created_at?: string | null
          event_id?: number
          id?: string
          is_winner?: boolean | null
          league_slug?: string | null
          line?: number | null
          market_name?: string
          opening_price_observed?: number | null
          opening_time_observed?: string | null
          selection?: string
          sport_slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_closing_observed_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_to_track"
            referencedColumns: ["event_id"]
          },
        ]
      }
      outcomes_v2: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          market_id: string
          normalized_name: string
          oddsapi_name: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          market_id: string
          normalized_name: string
          oddsapi_name: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          market_id?: string
          normalized_name?: string
          oddsapi_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_v2_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcomes_v2_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcomes_v2_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "odds"
            referencedColumns: ["market_id"]
          },
        ]
      }
      players_v2: {
        Row: {
          created_at: string | null
          display_name: string | null
          gender: string | null
          id: string
          nationality: string | null
          normalized_name: string
          oddsapi_name: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          nationality?: string | null
          normalized_name: string
          oddsapi_name: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          gender?: string | null
          id?: string
          nationality?: string | null
          normalized_name?: string
          oddsapi_name?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      sports_v2: {
        Row: {
          created_at: string | null
          id: string
          name: string
          oddsapi_slug: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          oddsapi_slug: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          oddsapi_slug?: string
          slug?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: number
          records_fetched: number | null
          records_inserted: number | null
          sport_id: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: number
          records_fetched?: number | null
          records_inserted?: number | null
          sport_id?: number | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: number
          records_fetched?: number | null
          records_inserted?: number | null
          sport_id?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      teams_v2: {
        Row: {
          country_id: string | null
          created_at: string | null
          display_name: string | null
          id: string
          normalized_name: string
          oddsapi_name: string
          sport_id: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          normalized_name: string
          oddsapi_name: string
          sport_id: string
        }
        Update: {
          country_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          normalized_name?: string
          oddsapi_name?: string
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_v2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_v2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "teams_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_v2"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      countries: {
        Row: {
          id: string | null
          iso_code: string | null
          name: string | null
          oddspapi_slug: string | null
        }
        Insert: {
          id?: string | null
          iso_code?: string | null
          name?: string | null
          oddspapi_slug?: string | null
        }
        Update: {
          id?: string | null
          iso_code?: string | null
          name?: string | null
          oddspapi_slug?: string | null
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string | null
          home_score: number | null
          home_team_id: string | null
          id: number | null
          league_id: string | null
          odds_locked_at: string | null
          oddspapi_id: string | null
          sport_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_to_track_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_to_track_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          active: boolean | null
          country_id: string | null
          id: string | null
          name: string | null
          oddspapi_id: string | null
          slug: string | null
          sport_id: string | null
        }
        Insert: {
          active?: boolean | null
          country_id?: string | null
          id?: string | null
          name?: never
          oddspapi_id?: never
          slug?: string | null
          sport_id?: string | null
        }
        Update: {
          active?: boolean | null
          country_id?: string | null
          id?: string | null
          name?: never
          oddspapi_id?: never
          slug?: string | null
          sport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leagues_v2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_v2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "leagues_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          active: boolean | null
          description: string | null
          handicap: number | null
          id: string | null
          market_type: string | null
          name: string | null
          oddspapi_id: string | null
          period: string | null
          sport_id: string | null
        }
        Insert: {
          active?: boolean | null
          description?: never
          handicap?: number | null
          id?: string | null
          market_type?: string | null
          name?: never
          oddspapi_id?: never
          period?: string | null
          sport_id?: string | null
        }
        Update: {
          active?: boolean | null
          description?: never
          handicap?: number | null
          id?: string | null
          market_type?: string | null
          name?: never
          oddspapi_id?: never
          period?: string | null
          sport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["sport_id"]
          },
          {
            foreignKeyName: "markets_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_v2_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      odds: {
        Row: {
          closing_price: number | null
          closing_timestamp: string | null
          created_at: string | null
          fixture_id: number | null
          id: string | null
          is_winner: boolean | null
          market_id: string | null
          opening_price: number | null
          opening_timestamp: string | null
          outcome_id: string | null
        }
        Relationships: []
      }
      outcomes: {
        Row: {
          description: string | null
          id: string | null
          market_id: string | null
          name: string | null
          oddspapi_id: string | null
        }
        Insert: {
          description?: never
          id?: string | null
          market_id?: string | null
          name?: never
          oddspapi_id?: never
        }
        Update: {
          description?: never
          id?: string | null
          market_id?: string | null
          name?: never
          oddspapi_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_v2_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcomes_v2_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcomes_v2_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "odds"
            referencedColumns: ["market_id"]
          },
        ]
      }
      sports: {
        Row: {
          id: string | null
          name: string | null
          oddspapi_id: string | null
          slug: string | null
        }
        Insert: {
          id?: string | null
          name?: string | null
          oddspapi_id?: never
          slug?: string | null
        }
        Update: {
          id?: string | null
          name?: string | null
          oddspapi_id?: never
          slug?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string | null
          name: string | null
          oddspapi_id: string | null
        }
        Insert: {
          id?: string | null
          name?: never
          oddspapi_id?: never
        }
        Update: {
          id?: string | null
          name?: never
          oddspapi_id?: never
        }
        Relationships: []
      }
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
