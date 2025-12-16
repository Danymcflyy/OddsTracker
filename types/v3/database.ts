/**
 * Types de base de données V3
 * Correspondent au schéma défini dans lib/db/migrations/v3/001_initial_schema_v3.sql
 */

// ============================================================================
// Core Database Types
// ============================================================================

export interface Sport {
  id: string;
  oddsapi_key: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  iso_code: string | null;
  created_at: string;
}

export interface League {
  id: string;
  oddsapi_key: string;
  sport_id: string;
  country_id: string | null;
  name: string;
  display_name: string | null;
  tracked: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  sport_id: string;
  country_id: string | null;
  oddsapi_name: string;
  normalized_name: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  oddsapi_id: number;
  sport_id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  home_score: number | null;
  away_score: number | null;
  home_ht_score: number | null;
  away_ht_score: number | null;
  first_seen_at: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  sport_id: string;
  oddsapi_key: string;
  market_type: string;
  name: string;
  custom_name: string | null;
  description: string | null;
  period: 'fulltime' | 'halftime';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Odd {
  id: string;
  match_id: string;
  market_id: string;
  outcome_type: string;
  line: number | null;
  opening_odds: number | null;
  opening_timestamp: string | null;
  current_odds: number | null;
  current_updated_at: string | null;
  is_winner: boolean | null;
  bookmaker: string;
  created_at: string;
  updated_at: string;
}

export interface LeagueSyncLog {
  id: string;
  league_id: string | null;
  sync_type: string;
  status: 'success' | 'error';
  matches_discovered: number;
  matches_updated: number;
  odds_captured: number;
  error_message: string | null;
  synced_at: string;
}

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export type SportInsert = Omit<Sport, 'id' | 'created_at' | 'updated_at'>;
export type CountryInsert = Omit<Country, 'id' | 'created_at'>;
export type LeagueInsert = Omit<League, 'id' | 'created_at' | 'updated_at'>;
export type TeamInsert = Omit<Team, 'id' | 'created_at' | 'updated_at'>;
export type MatchInsert = Omit<Match, 'id' | 'created_at' | 'updated_at'>;
export type MarketInsert = Omit<Market, 'id' | 'created_at' | 'updated_at'>;
export type OddInsert = Omit<Odd, 'id' | 'created_at' | 'updated_at'>;
export type LeagueSyncLogInsert = Omit<LeagueSyncLog, 'id' | 'synced_at'>;

// ============================================================================
// Update Types (for updating existing records)
// ============================================================================

export type SportUpdate = Partial<Omit<Sport, 'id' | 'created_at' | 'updated_at'>>;
export type LeagueUpdate = Partial<Omit<League, 'id' | 'created_at' | 'updated_at'>>;
export type TeamUpdate = Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>;
export type MatchUpdate = Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>;
export type MarketUpdate = Partial<Omit<Market, 'id' | 'created_at' | 'updated_at'>>;
export type OddUpdate = Partial<Omit<Odd, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// Enums
// ============================================================================

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum MarketPeriod {
  FULLTIME = 'fulltime',
  HALFTIME = 'halftime',
}

export enum OutcomeType {
  HOME = 'home',
  DRAW = 'draw',
  AWAY = 'away',
  OVER = 'over',
  UNDER = 'under',
}

export enum SyncType {
  DISCOVERY = 'discovery',
  ODDS_UPDATE = 'odds_update',
}

export enum SyncStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}
