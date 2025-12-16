/**
 * Types UI V3
 * Types enrichis pour l'interface utilisateur avec relations et données calculées
 */

import type { Match, Team, League, Country, Odd, Market, Sport } from './database';

// ============================================================================
// Enriched Types (with relations)
// ============================================================================

/**
 * Match enrichi avec toutes les relations nécessaires pour l'affichage
 */
export interface MatchWithDetails extends Match {
  sport: Sport;
  league: LeagueWithCountry;
  home_team: Team;
  away_team: Team;
  odds: OddWithMarket[];
}

/**
 * Ligue avec pays
 */
export interface LeagueWithCountry extends League {
  country: Country | null;
}

/**
 * Cote avec informations du marché
 */
export interface OddWithMarket extends Odd {
  market: Market;
}

/**
 * Marché avec métadonnées calculées
 */
export interface MarketWithOutcomes extends Market {
  outcomes: OutcomeDefinition[];
  lines?: number[];
}

/**
 * Définition d'un outcome pour un marché
 */
export interface OutcomeDefinition {
  key: string;           // '1', 'X', '2', 'O2.5', 'U2.5', etc.
  type: string;          // 'home', 'draw', 'away', 'over', 'under'
  line: number | null;   // Pour spreads/totals
  label: string;         // Label d'affichage
}

// ============================================================================
// Table Display Types
// ============================================================================

/**
 * Format de ligne pour le tableau UI
 */
export interface FootballTableRow {
  // Identifiants
  id: string;
  oddsapi_id: number;

  // Colonnes statiques
  match_date: string;
  country_name: string;
  league_name: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  status: string;

  // Map des cotes par clé d'outcome
  // Format: "market_id:outcome_type:line" => { opening, current, is_winner }
  odds_map: Record<string, OddValue>;
}

export interface OddValue {
  opening: number | null;
  current: number | null;
  is_winner: boolean | null;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface TableFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  countryIds: string[];
  leagueIds: string[];
  teamIds: string[];
  marketIds: string[];
  oddsRange: {
    min: number | null;
    max: number | null;
    type: 'opening' | 'current';
  };
  status?: string[];
}

export interface FilterOptions {
  countries: Array<{ id: string; name: string; count: number }>;
  leagues: Array<{ id: string; name: string; country_name: string; count: number }>;
  teams: Array<{ id: string; name: string; count: number }>;
  markets: Array<{ id: string; name: string; custom_name: string | null }>;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Sort Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Résultat de la découverte de matchs
 */
export interface MatchDiscoveryResult {
  discovered: number;
  updated: number;
  errors: string[];
}

/**
 * Résultat de la capture de cotes
 */
export interface OddsCaptureResult {
  matches_updated: number;
  odds_captured: number;
  errors: string[];
}

/**
 * Résultat de la découverte de ligues
 */
export interface LeagueDiscoveryResult {
  leagues: Array<{
    oddsapi_key: string;
    name: string;
    sport_key: string;
  }>;
  synced: number;
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * Configuration d'affichage d'un marché
 */
export interface MarketDisplaySettings {
  market_id: string;
  custom_name: string | null;
  visible: boolean;
  display_order: number;
}

/**
 * Configuration de tracking d'une ligue
 */
export interface LeagueTrackingSettings {
  league_id: string;
  tracked: boolean;
}

// ============================================================================
// Column Builder Types
// ============================================================================

/**
 * Définition de colonne dynamique
 */
export interface DynamicColumnDefinition {
  id: string;
  header: string;
  accessorKey: string;
  type: 'opening' | 'current';
  market: Market;
  outcome: OutcomeDefinition;
}

/**
 * Groupe de colonnes (pour l'organisation visuelle)
 */
export interface ColumnGroup {
  id: string;
  label: string;
  columns: DynamicColumnDefinition[];
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Clé unique pour identifier une cote
 */
export type OddKey = `${string}:${string}:${number | 'null'}`;

/**
 * Helper pour créer une OddKey
 */
export function createOddKey(
  marketId: string,
  outcomeType: string,
  line: number | null
): OddKey {
  return `${marketId}:${outcomeType}:${line ?? 'null'}`;
}

/**
 * Helper pour parser une OddKey
 */
export function parseOddKey(key: OddKey): {
  marketId: string;
  outcomeType: string;
  line: number | null;
} {
  const [marketId, outcomeType, lineStr] = key.split(':');
  return {
    marketId,
    outcomeType,
    line: lineStr === 'null' ? null : parseFloat(lineStr),
  };
}
