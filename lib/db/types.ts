/**
 * Database Types for The Odds API v4 Schema
 */

export interface Sport {
  id: string;
  api_key: string;
  title: string;
  description: string | null;
  sport_group: string | null;
  active: boolean;
  has_outrights: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  api_event_id: string;
  sport_id: string | null;
  sport_key: string;
  sport_title: string | null;
  commence_time: string;
  home_team: string;
  away_team: string;
  status: 'upcoming' | 'live' | 'completed';
  home_score: number | null;
  away_score: number | null;
  completed: boolean;
  last_api_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketState {
  id: string;
  event_id: string;
  market_key: string;
  status: 'pending' | 'captured' | 'not_offered';
  opening_odds: OpeningOdds | null;
  opening_odds_variations: OpeningOdds[]; // NEW: Array of variations for multiple points
  opening_captured_at: string | null;
  opening_bookmaker_update: string | null;
  deadline: string | null;
  attempts: number;
  last_attempt_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpeningOdds {
  home?: number;
  away?: number;
  draw?: number;
  over?: number;
  under?: number;
  yes?: number;    // BTTS
  no?: number;     // BTTS
  point?: number;
  team?: 'home' | 'away';  // Team Totals: identifies which team
  // Flexible structure for different market types
  [key: string]: number | string | undefined;
}

export interface ClosingOdds {
  id: string;
  event_id: string;
  markets: ClosingMarkets;
  markets_variations: ClosingMarketsVariations; // NEW: Markets with multiple point variations
  captured_at: string;
  bookmaker_update: string | null;
  capture_status: 'success' | 'missing' | 'error';
  error_message: string | null;
  retry_count: number;
  used_historical_api: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClosingMarkets {
  h2h?: MarketOdds;
  spreads?: MarketOdds;
  totals?: MarketOdds;
  h2h_h1?: MarketOdds;
  spreads_h1?: MarketOdds;
  totals_h1?: MarketOdds;
  [key: string]: MarketOdds | undefined;
}

export interface ClosingMarketsVariations {
  h2h?: MarketOdds[];
  spreads?: MarketOdds[];
  totals?: MarketOdds[];
  h2h_h1?: MarketOdds[];
  spreads_h1?: MarketOdds[];
  totals_h1?: MarketOdds[];
  [key: string]: MarketOdds[] | undefined;
}

export interface MarketOdds {
  home?: number;
  away?: number;
  draw?: number;
  over?: number;
  under?: number;
  yes?: number;    // BTTS
  no?: number;     // BTTS
  point?: number;
  team?: 'home' | 'away';  // Team Totals: identifies which team
  last_update?: string;
  [key: string]: number | string | undefined;
}

export interface Setting {
  id: string;
  key: string;
  value: any; // JSONB - type varies by setting
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiUsageLog {
  id: string;
  job_name: string;
  endpoint: string;
  sport_key: string | null;
  request_params: any; // JSONB
  credits_used: number;
  credits_remaining: number | null;
  events_processed: number;
  markets_captured: number;
  success: boolean;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

/**
 * View: Events with market capture progress
 */
export interface EventWithMarketProgress extends Event {
  markets_captured: number;
  markets_pending: number;
  markets_not_offered: number;
  total_markets: number;
  capture_percentage: number;
  has_closing_odds: boolean;
}

/**
 * View: API usage daily summary
 */
export interface ApiUsageDailySummary {
  date: string;
  job_name: string;
  requests: number;
  total_credits: number;
  avg_credits_per_request: number;
  total_events: number;
  total_markets_captured: number;
  successful_requests: number;
  failed_requests: number;
}

/**
 * Typed settings
 */
export interface AppSettings {
  tracked_sports: string[];
  tracked_markets: string[];
  scan_frequency_minutes: number;
  use_historical_fallback: boolean;
  bookmaker: string;
  region: string;
  use_sql_search: boolean;
}

/**
 * Helper type for inserting records (omits auto-generated fields)
 */
export type InsertSport = Omit<Sport, 'id' | 'created_at' | 'updated_at'>;
export type InsertEvent = Omit<Event, 'id' | 'created_at' | 'updated_at'>;
export type InsertMarketState = Omit<MarketState, 'id' | 'created_at' | 'updated_at'>;
export type InsertClosingOdds = Omit<ClosingOdds, 'id' | 'created_at' | 'updated_at'>;
export type InsertApiUsageLog = Omit<ApiUsageLog, 'id' | 'created_at'>;
