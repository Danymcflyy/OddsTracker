/**
 * League Mappings - Maps API league keys to display names and sports
 * Generated from discovery: 2025-12-11
 *
 * Used by sync jobs to normalize league references
 */

export interface LeagueMapping {
  sport: "Football" | "Tennis";
  name: string;
  country?: string;
  category?: string;
}

export const LEAGUE_MAPPINGS: Record<string, LeagueMapping> = {
  // Football Leagues
  "england-premier-league": {
    sport: "Football",
    name: "Premier League",
    country: "England",
  },
  "spain-la-liga": {
    sport: "Football",
    name: "La Liga",
    country: "Spain",
  },
  "italy-serie-a": {
    sport: "Football",
    name: "Serie A",
    country: "Italy",
  },
  "germany-bundesliga": {
    sport: "Football",
    name: "Bundesliga",
    country: "Germany",
  },
  "france-ligue-1": {
    sport: "Football",
    name: "Ligue 1",
    country: "France",
  },
  "uefa-champions-league": {
    sport: "Football",
    name: "UEFA Champions League",
    country: "International",
  },
  "uefa-europa-league": {
    sport: "Football",
    name: "UEFA Europa League",
    country: "International",
  },
  "portugal-primeira-liga": {
    sport: "Football",
    name: "Primeira Liga",
    country: "Portugal",
  },
  "netherlands-eredivisie": {
    sport: "Football",
    name: "Eredivisie",
    country: "Netherlands",
  },
  "belgium-pro-league": {
    sport: "Football",
    name: "Pro League",
    country: "Belgium",
  },
  "scotland-premiership": {
    sport: "Football",
    name: "Scottish Premiership",
    country: "Scotland",
  },
  "turkey-super-lig": {
    sport: "Football",
    name: "Süper Lig",
    country: "Turkey",
  },
  "austria-bundesliga": {
    sport: "Football",
    name: "Bundesliga",
    country: "Austria",
  },
  "switzerland-super-league": {
    sport: "Football",
    name: "Super League",
    country: "Switzerland",
  },
  "greece-super-league": {
    sport: "Football",
    name: "Super League",
    country: "Greece",
  },

  // Tennis Tournaments
  "australian-open": {
    sport: "Tennis",
    name: "Australian Open",
    category: "grand-slam",
  },
  "roland-garros": {
    sport: "Tennis",
    name: "Roland-Garros",
    category: "grand-slam",
  },
  wimbledon: {
    sport: "Tennis",
    name: "Wimbledon",
    category: "grand-slam",
  },
  "us-open": {
    sport: "Tennis",
    name: "US Open",
    category: "grand-slam",
  },
  "atp-indian-wells": {
    sport: "Tennis",
    name: "Indian Wells",
    category: "masters-1000",
  },
  "atp-miami": {
    sport: "Tennis",
    name: "Miami Open",
    category: "masters-1000",
  },
  "atp-madrid": {
    sport: "Tennis",
    name: "Madrid Masters",
    category: "masters-1000",
  },
  "atp-rome": {
    sport: "Tennis",
    name: "Rome Masters",
    category: "masters-1000",
  },
  atp_main_tour: {
    sport: "Tennis",
    name: "ATP Tour",
    category: "atp-tour",
  },
  wta_main_tour: {
    sport: "Tennis",
    name: "WTA Tour",
    category: "wta-tour",
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display name for a league key
 */
export function getLeagueName(leagueKey: string): string {
  const mapping = LEAGUE_MAPPINGS[leagueKey];
  if (!mapping) {
    return leagueKey.replace(/-/g, " ").replace(/_/g, " ");
  }
  return mapping.name;
}

/**
 * Get sport for a league key
 */
export function getLeagueSport(leagueKey: string): "Football" | "Tennis" | null {
  return LEAGUE_MAPPINGS[leagueKey]?.sport || null;
}

/**
 * Get all leagues for a specific sport
 */
export function getLeaguesForSport(sport: "Football" | "Tennis"): string[] {
  return Object.entries(LEAGUE_MAPPINGS)
    .filter(([_, mapping]) => mapping.sport === sport)
    .map(([key]) => key);
}

/**
 * Get all football leagues
 */
export function getFootballLeagues(): string[] {
  return getLeaguesForSport("Football");
}

/**
 * Get all tennis tournaments
 */
export function getTennisTournaments(): string[] {
  return getLeaguesForSport("Tennis");
}

/**
 * Get league mapping
 */
export function getLeagueMapping(leagueKey: string): LeagueMapping | null {
  return LEAGUE_MAPPINGS[leagueKey] || null;
}

/**
 * Check if league exists in mappings
 */
export function leagueExists(leagueKey: string): boolean {
  return leagueKey in LEAGUE_MAPPINGS;
}

/**
 * Get leagues by category (for tennis tournaments)
 */
export function getLeaguesByCategory(category: string): string[] {
  return Object.entries(LEAGUE_MAPPINGS)
    .filter(([_, mapping]) => mapping.category === category)
    .map(([key]) => key);
}

/**
 * Get league country
 */
export function getLeagueCountry(leagueKey: string): string | null {
  const mapping = LEAGUE_MAPPINGS[leagueKey];
  return mapping?.country || null;
}
