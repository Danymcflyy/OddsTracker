/**
 * Types pour l'API OddsPapi
 * Documentation: https://api.oddspapi.io/docs
 */

/**
 * Réponse de la liste des sports
 */
export interface OddspapiSport {
  id: number;
  name: string;
  slug: string;
}

/**
 * Réponse de la liste des pays
 */
export interface OddspapiCountry {
  slug: string;
  name: string;
}

/**
 * Réponse de la liste des ligues
 */
export interface OddspapiLeague {
  id: number;
  sport_id: number;
  country_slug: string;
  name: string;
  slug: string;
}

/**
 * Réponse de la liste des équipes
 */
export interface OddspapiTeam {
  id: number;
  name: string;
}

/**
 * Cote depuis l'API OddsPapi
 */
export interface OddspapiOdd {
  id: number; // market_id
  name: string; // market name (ex: "1X2")
  price: number;
  option: string; // outcome name (ex: "Home", "Draw", "Away")
  option_id: number; // outcome_id
  start_price: number; // opening_price
  start_timestamp: number; // opening_timestamp (Unix timestamp)
  timestamp: number; // closing_timestamp (Unix timestamp)
  is_main: boolean;
  handicap: string | null;
  total: string | null;
  bookmaker: string; // Toujours "Pinnacle" dans notre cas
}

/**
 * Fixture depuis l'API OddsPapi
 */
export interface OddspapiFixture {
  id: string;
  sport_id: number;
  league_id: number;
  name: string; // Format: "Team A vs Team B"
  start_timestamp: number; // Unix timestamp
  status: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  odds: OddspapiOdd[];
}

/**
 * Réponse paginée de fixtures
 */
export interface OddspapiFixturesResponse {
  success: boolean;
  data: OddspapiFixture[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Paramètres pour récupérer les fixtures
 */
export interface OddspapiFixturesParams {
  sport_id: number;
  league_id?: number;
  date_from?: string; // Format: YYYY-MM-DD
  date_to?: string; // Format: YYYY-MM-DD
  status?: "scheduled" | "live" | "finished";
  bookmaker?: "pinnacle"; // On ne récupère que Pinnacle
  markets?: string; // Ex: "1X2,over_under_2.5"
  page?: number;
  per_page?: number;
}

/**
 * Réponse d'erreur de l'API OddsPapi
 */
export interface OddspapiError {
  success: false;
  error: {
    message: string;
    code: number;
  };
}

/**
 * Headers de rate limiting
 */
export interface OddspapiRateLimit {
  limit: number; // Limite totale
  remaining: number; // Requêtes restantes
  reset: number; // Timestamp de réinitialisation
}

/**
 * Configuration de l'API OddsPapi
 */
export interface OddspapiConfig {
  apiKey: string;
  baseUrl: string;
  bookmaker: "pinnacle";
  timeout: number; // en ms
  retries: number;
}

/**
 * Constantes OddsPapi
 */
export const ODDSPAPI_CONSTANTS = {
  BOOKMAKER: "pinnacle",
  BASE_URL: "https://api.oddspapi.io",
  DEFAULT_PER_PAGE: 100,
  MAX_PER_PAGE: 500,
  TIMEOUT: 30000, // 30 secondes
  RETRIES: 3,
} as const;

/**
 * Helper pour convertir un timestamp Unix en ISO string
 */
export function unixToIso(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Helper pour extraire les IDs d'équipes depuis le nom du match
 * Note: L'API ne fournit pas directement les IDs, on doit les récupérer via l'endpoint teams
 */
export function parseMatchName(name: string): {
  homeTeam: string;
  awayTeam: string;
} | null {
  const parts = name.split(" vs ");
  if (parts.length !== 2) return null;

  return {
    homeTeam: parts[0].trim(),
    awayTeam: parts[1].trim(),
  };
}
