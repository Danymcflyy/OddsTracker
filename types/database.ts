// Types générés pour Supabase
// Ces types correspondent au schéma défini dans lib/db/migrations/001_initial_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sports: {
        Row: {
          id: number
          oddspapi_id: number
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: number
          oddspapi_id: number
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: number
          oddspapi_id?: number
          name?: string
          slug?: string
          created_at?: string
        }
      }
      countries: {
        Row: {
          id: number
          oddspapi_slug: string
          name: string
        }
        Insert: {
          id?: number
          oddspapi_slug: string
          name: string
        }
        Update: {
          id?: number
          oddspapi_slug?: string
          name?: string
        }
      }
      leagues: {
        Row: {
          id: number
          oddspapi_id: number
          sport_id: number
          country_id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          oddspapi_id: number
          sport_id: number
          country_id: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          oddspapi_id?: number
          sport_id?: number
          country_id?: number
          name?: string
          slug?: string
        }
      }
      teams: {
        Row: {
          id: number
          oddspapi_id: number
          name: string
        }
        Insert: {
          id?: number
          oddspapi_id: number
          name: string
        }
        Update: {
          id?: number
          oddspapi_id?: number
          name?: string
        }
      }
      fixtures: {
        Row: {
          id: number
          oddspapi_id: string
          sport_id: number
          league_id: number
          home_team_id: number
          away_team_id: number
          start_time: string
          home_score: number | null
          away_score: number | null
          status: string
          created_at: string
          updated_at: string
          odds_locked_at: string | null
        }
        Insert: {
          id?: number
          oddspapi_id: string
          sport_id: number
          league_id: number
          home_team_id: number
          away_team_id: number
          start_time: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          odds_locked_at?: string | null
        }
        Update: {
          id?: number
          oddspapi_id?: string
          sport_id?: number
          league_id?: number
          home_team_id?: number
          away_team_id?: number
          start_time?: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          odds_locked_at?: string | null
        }
      }
      markets: {
        Row: {
          id: number
          oddspapi_id: number
          name: string
          description: string | null
        }
        Insert: {
          id?: number
          oddspapi_id: number
          name: string
          description?: string | null
        }
        Update: {
          id?: number
          oddspapi_id?: number
          name?: string
          description?: string | null
        }
      }
      outcomes: {
        Row: {
          id: number
          oddspapi_id: number
          market_id: number
          name: string
          description: string | null
        }
        Insert: {
          id?: number
          oddspapi_id: number
          market_id: number
          name: string
          description?: string | null
        }
        Update: {
          id?: number
          oddspapi_id?: number
          market_id?: number
          name?: string
          description?: string | null
        }
      }
      odds: {
        Row: {
          id: number
          fixture_id: number
          market_id: number
          outcome_id: number
          opening_price: number | null
          closing_price: number | null
          opening_timestamp: string | null
          closing_timestamp: string | null
          is_winner: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          fixture_id: number
          market_id: number
          outcome_id: number
          opening_price?: number | null
          closing_price?: number | null
          opening_timestamp?: string | null
          closing_timestamp?: string | null
          is_winner?: boolean | null
          created_at?: string
        }
        Update: {
          id?: number
          fixture_id?: number
          market_id?: number
          outcome_id?: number
          opening_price?: number | null
          closing_price?: number | null
          opening_timestamp?: string | null
          closing_timestamp?: string | null
          is_winner?: boolean | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
      }
      sync_logs: {
        Row: {
          id: number
          sport_id: number
          status: string
          records_fetched: number
          records_inserted: number
          error_message: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: number
          sport_id: number
          status: string
          records_fetched?: number
          records_inserted?: number
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: number
          sport_id?: number
          status?: string
          records_fetched?: number
          records_inserted?: number
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
        }
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
  }
}

// Types helpers pour faciliter l'utilisation
export type Sport = Database["public"]["Tables"]["sports"]["Row"]
export type Country = Database["public"]["Tables"]["countries"]["Row"]
export type League = Database["public"]["Tables"]["leagues"]["Row"]
export type Team = Database["public"]["Tables"]["teams"]["Row"]
export type Fixture = Database["public"]["Tables"]["fixtures"]["Row"]
export type Market = Database["public"]["Tables"]["markets"]["Row"]
export type Outcome = Database["public"]["Tables"]["outcomes"]["Row"]
export type Odd = Database["public"]["Tables"]["odds"]["Row"]
export type Setting = Database["public"]["Tables"]["settings"]["Row"]
export type SyncLog = Database["public"]["Tables"]["sync_logs"]["Row"]

// Types pour les insertions
export type SportInsert = Database["public"]["Tables"]["sports"]["Insert"]
export type CountryInsert = Database["public"]["Tables"]["countries"]["Insert"]
export type LeagueInsert = Database["public"]["Tables"]["leagues"]["Insert"]
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"]
export type FixtureInsert = Database["public"]["Tables"]["fixtures"]["Insert"]
export type MarketInsert = Database["public"]["Tables"]["markets"]["Insert"]
export type OutcomeInsert = Database["public"]["Tables"]["outcomes"]["Insert"]
export type OddInsert = Database["public"]["Tables"]["odds"]["Insert"]
export type SettingInsert = Database["public"]["Tables"]["settings"]["Insert"]
export type SyncLogInsert = Database["public"]["Tables"]["sync_logs"]["Insert"]

// Types pour les mises à jour
export type SportUpdate = Database["public"]["Tables"]["sports"]["Update"]
export type CountryUpdate = Database["public"]["Tables"]["countries"]["Update"]
export type LeagueUpdate = Database["public"]["Tables"]["leagues"]["Update"]
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"]
export type FixtureUpdate = Database["public"]["Tables"]["fixtures"]["Update"]
export type MarketUpdate = Database["public"]["Tables"]["markets"]["Update"]
export type OutcomeUpdate = Database["public"]["Tables"]["outcomes"]["Update"]
export type OddUpdate = Database["public"]["Tables"]["odds"]["Update"]
export type SettingUpdate = Database["public"]["Tables"]["settings"]["Update"]
export type SyncLogUpdate = Database["public"]["Tables"]["sync_logs"]["Update"]
