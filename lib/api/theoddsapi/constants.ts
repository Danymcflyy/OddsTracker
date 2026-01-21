/**
 * The Odds API v4 Constants
 */

/**
 * Available markets for soccer/football
 */
export const SOCCER_MARKETS = {
  // Full Time - Main Markets
  H2H: 'h2h',
  SPREADS: 'spreads',
  TOTALS: 'totals',
  H2H_3_WAY: 'h2h_3_way',
  BTTS: 'btts',
  DRAW_NO_BET: 'draw_no_bet',
  DOUBLE_CHANCE: 'double_chance',

  // Full Time - Team Totals
  TEAM_TOTALS: 'team_totals',
  ALTERNATE_TEAM_TOTALS: 'alternate_team_totals',

  // Full Time - Alternates (Multiple Variations)
  ALTERNATE_SPREADS: 'alternate_spreads',
  ALTERNATE_TOTALS: 'alternate_totals',

  // First Half (H1)
  H2H_H1: 'h2h_h1',
  SPREADS_H1: 'spreads_h1',
  TOTALS_H1: 'totals_h1',
  ALTERNATE_SPREADS_H1: 'alternate_spreads_h1',
  ALTERNATE_TOTALS_H1: 'alternate_totals_h1',

  // Second Half (H2)
  H2H_H2: 'h2h_h2',
  SPREADS_H2: 'spreads_h2',
  TOTALS_H2: 'totals_h2',
  ALTERNATE_SPREADS_H2: 'alternate_spreads_h2',
  ALTERNATE_TOTALS_H2: 'alternate_totals_h2',

  // Corners & Cards
  ALTERNATE_SPREADS_CORNERS: 'alternate_spreads_corners',
  ALTERNATE_TOTALS_CORNERS: 'alternate_totals_corners',
  ALTERNATE_SPREADS_CARDS: 'alternate_spreads_cards',
  ALTERNATE_TOTALS_CARDS: 'alternate_totals_cards',

  // Player Props (Limited Availability)
  PLAYER_GOAL_SCORER_ANYTIME: 'player_goal_scorer_anytime',
  PLAYER_GOAL_SCORER_FIRST: 'player_goal_scorer_first',
  PLAYER_GOAL_SCORER_LAST: 'player_goal_scorer_last',
  PLAYER_TO_RECEIVE_CARD: 'player_to_receive_card',
  PLAYER_TO_RECEIVE_RED_CARD: 'player_to_receive_red_card',
  PLAYER_SHOTS_ON_TARGET: 'player_shots_on_target',
  PLAYER_SHOTS: 'player_shots',
  PLAYER_ASSISTS: 'player_assists',
} as const;

export type SoccerMarket = typeof SOCCER_MARKETS[keyof typeof SOCCER_MARKETS];

/**
 * MVP Markets (6 markets)
 */
export const MVP_MARKETS: SoccerMarket[] = [
  SOCCER_MARKETS.H2H,
  SOCCER_MARKETS.SPREADS,
  SOCCER_MARKETS.TOTALS,
  SOCCER_MARKETS.H2H_H1,
  SOCCER_MARKETS.SPREADS_H1,
  SOCCER_MARKETS.TOTALS_H1,
];

/**
 * Market display names
 */
export const MARKET_NAMES: Record<SoccerMarket, string> = {
  // Full Time - Main Markets
  [SOCCER_MARKETS.H2H]: 'Match Winner (1X2)',
  [SOCCER_MARKETS.SPREADS]: 'Handicap',
  [SOCCER_MARKETS.TOTALS]: 'Over/Under Goals',
  [SOCCER_MARKETS.H2H_3_WAY]: '3-Way Result',
  [SOCCER_MARKETS.BTTS]: 'Both Teams to Score',
  [SOCCER_MARKETS.DRAW_NO_BET]: 'Draw No Bet',
  [SOCCER_MARKETS.DOUBLE_CHANCE]: 'Double Chance',

  // Full Time - Team Totals
  [SOCCER_MARKETS.TEAM_TOTALS]: 'Team Totals',
  [SOCCER_MARKETS.ALTERNATE_TEAM_TOTALS]: 'Team Totals (All Variations)',

  // Full Time - Alternates
  [SOCCER_MARKETS.ALTERNATE_SPREADS]: 'Handicap (All Variations)',
  [SOCCER_MARKETS.ALTERNATE_TOTALS]: 'Over/Under (All Variations)',

  // First Half
  [SOCCER_MARKETS.H2H_H1]: '1st Half Winner',
  [SOCCER_MARKETS.SPREADS_H1]: '1st Half Handicap',
  [SOCCER_MARKETS.TOTALS_H1]: '1st Half Over/Under',
  [SOCCER_MARKETS.ALTERNATE_SPREADS_H1]: '1st Half Handicap (All Variations)',
  [SOCCER_MARKETS.ALTERNATE_TOTALS_H1]: '1st Half Over/Under (All Variations)',

  // Second Half
  [SOCCER_MARKETS.H2H_H2]: '2nd Half Winner',
  [SOCCER_MARKETS.SPREADS_H2]: '2nd Half Handicap',
  [SOCCER_MARKETS.TOTALS_H2]: '2nd Half Over/Under',
  [SOCCER_MARKETS.ALTERNATE_SPREADS_H2]: '2nd Half Handicap (All Variations)',
  [SOCCER_MARKETS.ALTERNATE_TOTALS_H2]: '2nd Half Over/Under (All Variations)',

  // Corners & Cards
  [SOCCER_MARKETS.ALTERNATE_SPREADS_CORNERS]: 'Corners Handicap (All Variations)',
  [SOCCER_MARKETS.ALTERNATE_TOTALS_CORNERS]: 'Corners Over/Under (All Variations)',
  [SOCCER_MARKETS.ALTERNATE_SPREADS_CARDS]: 'Cards Handicap (All Variations)',
  [SOCCER_MARKETS.ALTERNATE_TOTALS_CARDS]: 'Cards Over/Under (All Variations)',

  // Player Props
  [SOCCER_MARKETS.PLAYER_GOAL_SCORER_ANYTIME]: 'Player Goal Scorer (Anytime)',
  [SOCCER_MARKETS.PLAYER_GOAL_SCORER_FIRST]: 'Player First Goal Scorer',
  [SOCCER_MARKETS.PLAYER_GOAL_SCORER_LAST]: 'Player Last Goal Scorer',
  [SOCCER_MARKETS.PLAYER_TO_RECEIVE_CARD]: 'Player to Receive Card',
  [SOCCER_MARKETS.PLAYER_TO_RECEIVE_RED_CARD]: 'Player to Receive Red Card',
  [SOCCER_MARKETS.PLAYER_SHOTS_ON_TARGET]: 'Player Shots on Target',
  [SOCCER_MARKETS.PLAYER_SHOTS]: 'Player Total Shots',
  [SOCCER_MARKETS.PLAYER_ASSISTS]: 'Player Assists',
};

/**
 * Market groups for organized display
 */
export const MARKET_GROUPS = {
  FULL_TIME_MAIN: {
    name: 'Full Time - Main Markets',
    cost: '1 credit each',
    markets: [
      SOCCER_MARKETS.H2H,
      SOCCER_MARKETS.SPREADS,
      SOCCER_MARKETS.TOTALS,
      SOCCER_MARKETS.BTTS,
      SOCCER_MARKETS.DRAW_NO_BET,
      SOCCER_MARKETS.DOUBLE_CHANCE,
    ],
  },
  FULL_TIME_TEAM: {
    name: 'Full Time - Team Totals',
    cost: '1 credit (standard), 3 credits (alternates)',
    markets: [
      SOCCER_MARKETS.TEAM_TOTALS,
      SOCCER_MARKETS.ALTERNATE_TEAM_TOTALS,
    ],
  },
  FIRST_HALF: {
    name: 'First Half Markets',
    cost: '1 credit each',
    markets: [
      SOCCER_MARKETS.H2H_H1,
      SOCCER_MARKETS.SPREADS_H1,
      SOCCER_MARKETS.TOTALS_H1,
    ],
  },
  SECOND_HALF: {
    name: 'Second Half Markets',
    cost: '1 credit each',
    markets: [
      SOCCER_MARKETS.H2H_H2,
      SOCCER_MARKETS.SPREADS_H2,
      SOCCER_MARKETS.TOTALS_H2,
    ],
  },
  CORNERS_CARDS: {
    name: 'Corners & Cards',
    cost: '3 credits each',
    markets: [
      SOCCER_MARKETS.ALTERNATE_SPREADS_CORNERS,
      SOCCER_MARKETS.ALTERNATE_TOTALS_CORNERS,
      SOCCER_MARKETS.ALTERNATE_SPREADS_CARDS,
      SOCCER_MARKETS.ALTERNATE_TOTALS_CARDS,
    ],
  },
  PLAYER_PROPS: {
    name: 'Player Props',
    cost: 'Varies (limited availability)',
    availability: 'EPL, Ligue 1, Bundesliga, Serie A, La Liga, MLS only',
    markets: [
      SOCCER_MARKETS.PLAYER_GOAL_SCORER_ANYTIME,
      SOCCER_MARKETS.PLAYER_GOAL_SCORER_FIRST,
      SOCCER_MARKETS.PLAYER_GOAL_SCORER_LAST,
      SOCCER_MARKETS.PLAYER_TO_RECEIVE_CARD,
      SOCCER_MARKETS.PLAYER_TO_RECEIVE_RED_CARD,
      SOCCER_MARKETS.PLAYER_SHOTS_ON_TARGET,
      SOCCER_MARKETS.PLAYER_SHOTS,
      SOCCER_MARKETS.PLAYER_ASSISTS,
    ],
  },
} as const;

/**
 * Bookmaker keys
 */
export const BOOKMAKERS = {
  PINNACLE: 'pinnacle',
  BET365: 'bet365',
  BETFAIR: 'betfair',
  // Add more as needed
} as const;

export type BookmakerKey = typeof BOOKMAKERS[keyof typeof BOOKMAKERS];

/**
 * Regions
 */
export const REGIONS = {
  EU: 'eu',
  UK: 'uk',
  US: 'us',
  US2: 'us2',
  AU: 'au',
} as const;

export type Region = typeof REGIONS[keyof typeof REGIONS];

/**
 * Sport keys for soccer leagues
 */
export const SOCCER_LEAGUES = {
  // England
  EPL: 'soccer_epl',
  EFL_CHAMPIONSHIP: 'soccer_england_efl_cup',

  // Spain
  LA_LIGA: 'soccer_spain_la_liga',

  // Germany
  BUNDESLIGA: 'soccer_germany_bundesliga',

  // France
  LIGUE_1: 'soccer_france_ligue_one',

  // Italy
  SERIE_A: 'soccer_italy_serie_a',

  // Europe
  UEFA_CHAMPIONS_LEAGUE: 'soccer_uefa_champs_league',
  UEFA_EUROPA_LEAGUE: 'soccer_uefa_europa_league',

  // International
  FIFA_WORLD_CUP: 'soccer_fifa_world_cup',

  // Add more leagues as discovered from API
} as const;

export type SoccerLeague = typeof SOCCER_LEAGUES[keyof typeof SOCCER_LEAGUES];

/**
 * Event status
 */
export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  COMPLETED: 'completed',
} as const;

export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];

/**
 * Market capture status
 */
export const MARKET_CAPTURE_STATUS = {
  PENDING: 'pending',
  CAPTURED: 'captured',
  NOT_OFFERED: 'not_offered',
} as const;

export type MarketCaptureStatus = typeof MARKET_CAPTURE_STATUS[keyof typeof MARKET_CAPTURE_STATUS];

/**
 * Closing odds capture status
 */
export const CLOSING_STATUS = {
  SUCCESS: 'success',
  MISSING: 'missing',
  ERROR: 'error',
} as const;

export type ClosingStatus = typeof CLOSING_STATUS[keyof typeof CLOSING_STATUS];

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  BOOKMAKER: BOOKMAKERS.PINNACLE,
  REGION: REGIONS.EU,
  MARKETS: MVP_MARKETS,
  ODDS_FORMAT: 'decimal' as const,
  DATE_FORMAT: 'iso' as const,
  SCAN_FREQUENCY_MINUTES: 10,
  USE_HISTORICAL_FALLBACK: false,
  CLOSING_RETRY_DAYS: 3,
};
