import type { Sport, League, Country } from "./database";

/**
 * Slugs des sports disponibles
 */
export enum SportSlug {
  FOOTBALL = "football",
  HOCKEY = "hockey",
  TENNIS = "tennis",
  VOLLEYBALL = "volleyball",
}

/**
 * IDs OddsPapi des sports
 */
export enum SportOddspapiId {
  FOOTBALL = 10,
  HOCKEY = 4,
  TENNIS = 2,
  VOLLEYBALL = 34,
}

/**
 * Mapping entre slug et OddsPapi ID
 */
export const SPORT_MAPPINGS: Record<
  SportSlug,
  { oddspapi_id: SportOddspapiId; name: string }
> = {
  [SportSlug.FOOTBALL]: { oddspapi_id: SportOddspapiId.FOOTBALL, name: "Football" },
  [SportSlug.HOCKEY]: { oddspapi_id: SportOddspapiId.HOCKEY, name: "Hockey" },
  [SportSlug.TENNIS]: { oddspapi_id: SportOddspapiId.TENNIS, name: "Tennis" },
  [SportSlug.VOLLEYBALL]: { oddspapi_id: SportOddspapiId.VOLLEYBALL, name: "Volleyball" },
};

/**
 * Sport avec statistiques
 */
export interface SportWithStats extends Sport {
  stats: {
    total_fixtures: number;
    total_leagues: number;
    total_teams: number;
    last_sync: string | null;
  };
}

/**
 * Ligue avec détails du pays et du sport
 */
export interface LeagueWithDetails extends League {
  sport: {
    id: number;
    name: string;
    slug: string;
  };
  country: {
    id: number;
    name: string;
  };
}

/**
 * Ligue avec statistiques
 */
export interface LeagueWithStats extends LeagueWithDetails {
  stats: {
    total_fixtures: number;
    total_teams: number;
  };
}

/**
 * Pays avec statistiques
 */
export interface CountryWithStats extends Country {
  stats: {
    total_leagues: number;
    total_fixtures: number;
  };
}

/**
 * Options de filtrage par sport
 */
export interface SportFilters {
  sport_id?: number;
  country_id?: number;
  league_id?: number;
  search?: string;
}

/**
 * Hiérarchie Sport > Pays > Ligue
 */
export interface SportHierarchy {
  sport: Sport;
  countries: CountryHierarchy[];
}

export interface CountryHierarchy {
  country: Country;
  leagues: League[];
}

/**
 * Helper pour obtenir le sport par slug
 */
export function getSportBySlug(slug: string): SportSlug | null {
  const validSlugs = Object.values(SportSlug);
  return validSlugs.find((s) => s === slug) || null;
}

/**
 * Helper pour obtenir le nom du sport par slug
 */
export function getSportNameBySlug(slug: SportSlug): string {
  return SPORT_MAPPINGS[slug]?.name || slug;
}

/**
 * Helper pour obtenir l'ID OddsPapi par slug
 */
export function getOddspapiIdBySlug(slug: SportSlug): SportOddspapiId {
  return SPORT_MAPPINGS[slug]?.oddspapi_id;
}
