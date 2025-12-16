import { Database } from "./supabase";
import type { OddWithDetails } from "./odds";
export type { OddWithDetails } from "./odds";

type Fixture = Database['public']['Tables']['events_to_track']['Row'];

/**
 * Fixture avec les détails complets (équipes, ligue, pays)
 * Utilisé pour l'affichage dans les tableaux et les pages de détail
 */
export interface FixtureWithDetails extends Fixture {
  home_team: {
    id: Database['public']['Tables']['teams_v2']['Row']['id'];
    name: string;
  };
  away_team: {
    id: Database['public']['Tables']['teams_v2']['Row']['id'];
    name: string;
  };
  league: {
    id: Database['public']['Tables']['leagues_v2']['Row']['id'];
    name: string;
    country: {
      id: Database['public']['Tables']['countries_v2']['Row']['id'];
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
  sport_id: Database['public']['Tables']['sports_v2']['Row']['id'];
  league_id: Database['public']['Tables']['leagues_v2']['Row']['id'];
  home_team_id: Database['public']['Tables']['teams_v2']['Row']['id'];
  away_team_id: Database['public']['Tables']['teams_v2']['Row']['id'];
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
