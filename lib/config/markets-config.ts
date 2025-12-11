/**
 * Markets Configuration
 * Defines available markets for each sport on Odds-API.io (Pinnacle)
 * Generated from discovery: 2025-12-11
 */

export interface MarketConfig {
  oddsapi_key: string;  // API key from Odds-API.io
  market_type: string;  // Normalized market type
  period: string;       // 'fulltime', 'p1', 'match', etc.
  handicap?: number;    // For spreads/totals with fixed lines
  active: boolean;
}

// ============================================================================
// FOOTBALL MARKETS (Pinnacle)
// ============================================================================

export const FOOTBALL_MARKETS: MarketConfig[] = [
  // Moneyline / 1X2
  {
    oddsapi_key: "h2h",
    market_type: "1x2",
    period: "fulltime",
    active: true,
  },

  // Spreads / Handicaps
  {
    oddsapi_key: "spreads",
    market_type: "spreads",
    period: "fulltime",
    active: true,
  },

  // Totals / Over-Under
  {
    oddsapi_key: "totals",
    market_type: "totals",
    period: "fulltime",
    active: true,
  },

  // Team Totals
  {
    oddsapi_key: "team_totals_home",
    market_type: "team_totals",
    period: "fulltime",
    active: true,
  },
  {
    oddsapi_key: "team_totals_away",
    market_type: "team_totals",
    period: "fulltime",
    active: true,
  },

  // Halftime markets (when available)
  {
    oddsapi_key: "h2h_h1",
    market_type: "1x2",
    period: "p1",
    active: false,  // Will be enabled if found in API
  },
  {
    oddsapi_key: "totals_h1",
    market_type: "totals",
    period: "p1",
    active: false,
  },
];

// ============================================================================
// TENNIS MARKETS (Pinnacle)
// ============================================================================

export const TENNIS_MARKETS: MarketConfig[] = [
  // Match Winner / Moneyline
  {
    oddsapi_key: "h2h",
    market_type: "moneyline",
    period: "match",
    active: true,
  },

  // Set Spreads
  {
    oddsapi_key: "spreads",
    market_type: "spreads",
    period: "match",
    active: true,
  },

  // Game Totals
  {
    oddsapi_key: "totals",
    market_type: "totals",
    period: "match",
    active: true,
  },

  // Player props (when available)
  {
    oddsapi_key: "player_aces",
    market_type: "player_prop",
    period: "match",
    active: false,
  },
  {
    oddsapi_key: "player_sets_won",
    market_type: "player_prop",
    period: "match",
    active: false,
  },
];

// ============================================================================
// Market Type Mapping
// ============================================================================

export const MARKET_TYPE_DESCRIPTIONS: Record<string, string> = {
  "1x2": "Home/Draw/Away",
  spreads: "Point Spread / Handicap",
  totals: "Over/Under Total Points",
  team_totals: "Team Total Points",
  moneyline: "Match Winner",
  player_prop: "Player Proposition",
  sets: "Set Betting",
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get all active markets for a sport
 */
export function getActiveMarkets(sport: "Football" | "Tennis"): MarketConfig[] {
  const markets =
    sport === "Football" ? FOOTBALL_MARKETS : TENNIS_MARKETS;
  return markets.filter((m) => m.active);
}

/**
 * Get market config by oddsapi_key
 */
export function getMarketByKey(key: string): MarketConfig | undefined {
  return [
    ...FOOTBALL_MARKETS,
    ...TENNIS_MARKETS,
  ].find((m) => m.oddsapi_key === key);
}

/**
 * Get all markets grouped by period
 */
export function getMarketsByPeriod(
  sport: "Football" | "Tennis",
  period: string
): MarketConfig[] {
  const markets = getActiveMarkets(sport);
  return markets.filter((m) => m.period === period);
}

/**
 * Get market description
 */
export function getMarketDescription(marketType: string): string {
  return MARKET_TYPE_DESCRIPTIONS[marketType] || marketType;
}

/**
 * Check if market has variable lines (spreads/totals)
 */
export function hasVariableLines(marketType: string): boolean {
  return marketType === "spreads" || marketType === "totals" || marketType === "team_totals";
}

/**
 * Get all available market types
 */
export function getAllMarketTypes(sport: "Football" | "Tennis"): string[] {
  const markets = getActiveMarkets(sport);
  return [...new Set(markets.map((m) => m.market_type))];
}
