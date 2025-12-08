import type { Fixture, Team, League, Country, Odd } from "./database";
import type { OddWithDetails } from "./odds";
export type { OddWithDetails } from "./odds";

/**
 * Fixture avec les détails complets (équipes, ligue, pays)
 * Utilisé pour l'affichage dans les tableaux et les pages de détail
 */
export interface FixtureWithDetails extends Fixture {
  home_team: {
    id: number;
    name: string;
  };
  away_team: {
    id: number;
    name: string;
  };
  league: {
    id: number;
    name: string;
    country: {
      id: number;
      name: string;
    };
  };
}

/**
 * Fixture avec les cotes associées
 * Utilisé pour les analyses de cotes et l'export
 */
export interface FixtureWithOdds extends FixtureWithDetails {
  odds: Odd[];
}

/**
 * Fixture avec cotes enrichies (inclut market et outcome)
 * Utilisé pour l'affichage complet des données dans l'UI
 */
export interface FixtureWithEnrichedOdds extends FixtureWithDetails {
  odds: OddWithDetails[];
}

/**
 * Statuts possibles pour un fixture
 */
export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

/**
 * Données pour créer un nouveau fixture (formulaire)
 */
export interface CreateFixtureInput {
  oddspapi_id: string;
  sport_id: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  start_time: string;
  status?: FixtureStatus;
}

/**
 * Données pour mettre à jour un fixture existant
 */
export interface UpdateFixtureInput {
  home_score?: number | null;
  away_score?: number | null;
  status?: FixtureStatus;
  start_time?: string;
}
