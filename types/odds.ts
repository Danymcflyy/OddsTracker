import type { Odd, Market, Outcome } from "./database";

/**
 * Cote avec les détails du marché et du résultat
 * Utilisé pour l'affichage complet des cotes
 */
export interface OddWithDetails extends Odd {
  market: Market;
  outcome: Outcome;
}

/**
 * Cote groupée par marché
 * Utilisé pour l'affichage des cotes par type de pari
 */
export interface OddsByMarket {
  market: Market;
  odds: OddWithOutcome[];
}

/**
 * Cote avec le détail du résultat uniquement
 */
export interface OddWithOutcome extends Odd {
  outcome: Outcome;
}

/**
 * Statistiques sur une cote (analyse)
 */
export interface OddStats {
  odd_id: number;
  movement: number; // Différence entre opening et closing
  movement_percent: number; // % de variation
  is_closing_lower: boolean; // Closing < Opening
  hold_duration_hours: number; // Durée entre opening et closing
}

/**
 * Comparaison de cotes (avant/après)
 */
export interface OddComparison {
  fixture_id: number;
  market_name: string;
  outcome_name: string;
  opening_price: number | null;
  closing_price: number | null;
  difference: number | null;
  difference_percent: number | null;
  is_winner: boolean | null;
}

/**
 * Données pour créer une nouvelle cote
 */
export interface CreateOddInput {
  fixture_id: number;
  market_id: number;
  outcome_id: number;
  opening_price?: number | null;
  closing_price?: number | null;
  opening_timestamp?: string | null;
  closing_timestamp?: string | null;
}

/**
 * Données pour mettre à jour une cote
 */
export interface UpdateOddInput {
  opening_price?: number | null;
  closing_price?: number | null;
  opening_timestamp?: string | null;
  closing_timestamp?: string | null;
  is_winner?: boolean | null;
}

/**
 * Types de marchés supportés par l'application
 */
export const MARKET_TYPES = {
  MATCH_RESULT: "1X2",
  OVER_UNDER: "Over/Under",
  BOTH_TEAMS_SCORE: "Both Teams to Score",
  DOUBLE_CHANCE: "Double Chance",
  HANDICAP: "Handicap",
  CORRECT_SCORE: "Correct Score",
} as const;

export type MarketType = (typeof MARKET_TYPES)[keyof typeof MARKET_TYPES];

/**
 * Filtres spécifiques aux cotes
 */
export interface OddsFilters {
  minOpeningPrice?: number;
  maxOpeningPrice?: number;
  minClosingPrice?: number;
  maxClosingPrice?: number;
  marketIds?: number[];
  outcomeIds?: number[];
  isWinner?: boolean;
  hasMovement?: boolean; // Cotes qui ont bougé entre opening et closing
}
