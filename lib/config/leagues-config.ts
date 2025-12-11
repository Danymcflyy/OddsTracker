/**
 * Leagues Configuration
 * Maps API league keys to display configuration
 * Generated from discovery: 2025-12-11
 */

export interface LeagueConfig {
  slug: string;
  name: string;
  country?: string;
  category?: string;
  active: boolean;
}

// ============================================================================
// FOOTBALL LEAGUES (15 top European leagues)
// ============================================================================

export const FOOTBALL_LEAGUES: LeagueConfig[] = [
  {
    slug: "england-premier-league",
    name: "Premier League",
    country: "England",
    active: true,
  },
  {
    slug: "spain-la-liga",
    name: "La Liga",
    country: "Spain",
    active: true,
  },
  {
    slug: "italy-serie-a",
    name: "Serie A",
    country: "Italy",
    active: true,
  },
  {
    slug: "germany-bundesliga",
    name: "Bundesliga",
    country: "Germany",
    active: true,
  },
  {
    slug: "france-ligue-1",
    name: "Ligue 1",
    country: "France",
    active: true,
  },
  {
    slug: "uefa-champions-league",
    name: "UEFA Champions League",
    country: "International",
    active: true,
  },
  {
    slug: "uefa-europa-league",
    name: "UEFA Europa League",
    country: "International",
    active: true,
  },
  {
    slug: "portugal-primeira-liga",
    name: "Primeira Liga",
    country: "Portugal",
    active: true,
  },
  {
    slug: "netherlands-eredivisie",
    name: "Eredivisie",
    country: "Netherlands",
    active: true,
  },
  {
    slug: "belgium-pro-league",
    name: "Pro League",
    country: "Belgium",
    active: true,
  },
  {
    slug: "scotland-premiership",
    name: "Scottish Premiership",
    country: "Scotland",
    active: true,
  },
  {
    slug: "turkey-super-lig",
    name: "Süper Lig",
    country: "Turkey",
    active: true,
  },
  {
    slug: "austria-bundesliga",
    name: "Bundesliga",
    country: "Austria",
    active: true,
  },
  {
    slug: "switzerland-super-league",
    name: "Super League",
    country: "Switzerland",
    active: true,
  },
  {
    slug: "greece-super-league",
    name: "Super League",
    country: "Greece",
    active: true,
  },
];

// ============================================================================
// TENNIS TOURNAMENTS (Grand Slams + Masters + Tour events)
// ============================================================================

export const TENNIS_TOURNAMENTS: LeagueConfig[] = [
  // Grand Slams
  {
    slug: "australian-open",
    name: "Australian Open",
    category: "grand-slam",
    active: true,
  },
  {
    slug: "roland-garros",
    name: "Roland-Garros",
    category: "grand-slam",
    active: true,
  },
  {
    slug: "wimbledon",
    name: "Wimbledon",
    category: "grand-slam",
    active: true,
  },
  {
    slug: "us-open",
    name: "US Open",
    category: "grand-slam",
    active: true,
  },

  // ATP Masters 1000
  {
    slug: "atp-indian-wells",
    name: "Indian Wells",
    category: "masters-1000",
    active: true,
  },
  {
    slug: "atp-miami",
    name: "Miami Open",
    category: "masters-1000",
    active: true,
  },
  {
    slug: "atp-madrid",
    name: "Madrid Masters",
    category: "masters-1000",
    active: true,
  },
  {
    slug: "atp-rome",
    name: "Rome Masters",
    category: "masters-1000",
    active: true,
  },

  // Main Tours
  {
    slug: "atp_main_tour",
    name: "ATP Tour",
    category: "atp-tour",
    active: true,
  },
  {
    slug: "wta_main_tour",
    name: "WTA Tour",
    category: "wta-tour",
    active: true,
  },
];

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get all active football leagues
 */
export function getActiveFootballLeagues(): LeagueConfig[] {
  return FOOTBALL_LEAGUES.filter((l) => l.active);
}

/**
 * Get all active tennis tournaments
 */
export function getActiveTennisTournaments(): LeagueConfig[] {
  return TENNIS_TOURNAMENTS.filter((l) => l.active);
}

/**
 * Get league config by slug
 */
export function getLeagueBySlug(
  slug: string
): LeagueConfig | undefined {
  return [
    ...FOOTBALL_LEAGUES,
    ...TENNIS_TOURNAMENTS,
  ].find((l) => l.slug === slug);
}

/**
 * Get all leagues grouped by sport
 */
export function getAllLeaguesGrouped(): {
  football: LeagueConfig[];
  tennis: LeagueConfig[];
} {
  return {
    football: FOOTBALL_LEAGUES,
    tennis: TENNIS_TOURNAMENTS,
  };
}
