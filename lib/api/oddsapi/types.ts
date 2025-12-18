/**
 * TypeScript interfaces for Odds-API.io responses
 * Documentation: https://docs.odds-api.io/
 */

// ============================================================================
// Events API
// ============================================================================

export interface OddsApiEvent {
  id: number;
  home: string;           // Home team name
  away: string;           // Away team name
  homeId: number;         // Home team ID
  awayId: number;         // Away team ID
  date: string;           // ISO 8601 date
  sport: {
    name: string;         // "Football"
    slug: string;         // "football"
  };
  league: {
    name: string;         // "EPL - Premier League"
    slug: string;         // "england-premier-league"
  };
  status: 'pending' | 'live' | 'settled';
  scores: {
    home: number;
    away: number;
  };
  bookmakers?: any[];
}

export interface OddsApiEventsResponse {
  events: OddsApiEvent[];
  has_more: boolean;
}

// ============================================================================
// Odds Response
// ============================================================================

export interface OddsApiOddsResponse {
  id: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  date: string;
  sport: {
    name: string;
    slug: string;
  };
  league: {
    name: string;
    slug: string;
  };
  status: 'pending' | 'live' | 'settled';
  scores: {
    home: number;
    away: number;
  };
  urls: Record<string, string>;  // URLs vers les bookmakers
  bookmakers: Record<string, OddsApiMarket[]>;  // Objet: { "Pinnacle": [...], "Bet365": [...] }
}

export interface OddsApiMarket {
  name: string;  // "ML" (Money Line/h2h), "Spreads", "Totals", etc.
  updatedAt: string;  // ISO 8601 timestamp
  odds: OddsApiOddsData[];  // Array d'objets de cotes
}

export interface OddsApiOddsData {
  // For h2h/ML markets
  home?: string;  // Decimal odds as string
  away?: string;
  draw?: string;

  // For totals markets
  over?: string;
  under?: string;
  label?: string;  // Line value (e.g., "2.5")

  // For spreads markets
  hdp?: number;  // Handicap value

  // Links to bookmaker pages
  homeLink?: string;
  awayLink?: string;
  drawLink?: string;
  overLink?: string;
  underLink?: string;

  // Max stake
  max?: number;
}

// ============================================================================
// Odds Updated API (for incremental polling)
// ============================================================================

export interface OddsApiUpdatedResponse {
  last_updated: number;  // Unix timestamp
  events_updated: OddsApiUpdatedEvent[];
}

export interface OddsApiUpdatedEvent {
  id: number;
  last_update: string;  // ISO 8601 timestamp
}

// ============================================================================
// Multi-event Odds Request
// ============================================================================

export interface OddsApiOddsMultiRequest {
  event_ids: number[];
  bookmakers?: string[];
  markets?: string[];
}

export interface OddsApiOddsMultiResponse extends Array<OddsApiOddsResponse> {}

// ============================================================================
// Client Configuration
// ============================================================================

export interface OddsApiClientConfig {
  baseUrl?: string;
  apiKey: string;
  defaultParams?: {
    bookmakers?: string[];
    markets?: string[];
  };
}

// ============================================================================
// Normalized API Response (internal format)
// ============================================================================

export interface NormalizedOddsApiEvent {
  eventId: number;
  sportSlug: string;
  leagueSlug: string;
  homeTeam?: string;
  awayTeam?: string;
  player1?: string;
  player2?: string;
  eventDate: Date;
  status?: 'pending' | 'live' | 'settled';
  scores?: {
    home?: number;
    away?: number;
  };
}

export interface NormalizedOddsApiOdds {
  eventId: number;
  lastUpdated: Date;
  bookmakerOdds: {
    [bookmakerKey: string]: {
      markets: {
        [marketKey: string]: {
          outcomes: {
            [outcomeName: string]: {
              price: number;
              line?: number;
            };
          };
        };
      };
    };
  };
}

export interface NormalizedMarket {
  marketName: string;  // 'h2h', 'spreads', 'totals', etc.
  outcomes: NormalizedOutcome[];
}

export interface NormalizedOutcome {
  name: string;  // 'home', 'away', 'draw', 'over', 'under'
  price: number;
  line?: number;  // Handicap for spreads/totals
}

// ============================================================================
// Error Response
// ============================================================================

export interface OddsApiErrorResponse {
  error: string;
  message: string;
  code?: string;
}

// ============================================================================
// Rate Limiting State
// ============================================================================

export interface RateLimitState {
  requestsUsedToday: number;
  requestsRemainingToday: number;
  resetTime: Date;
}

// ============================================================================
// Job Payloads (for cron endpoints)
// ============================================================================

export interface JobAPayload {
  sport: string;
  since: number;
  limit?: number;
}

export interface JobBPayload {
  sport: string;
  fromDate: Date;
  toDate: Date;
}

export interface JobCPayload {
  eventIds: number[];
}

// ============================================================================
// Internal State Machine
// ============================================================================

export type EventState = 'DISCOVERED_NO_ODDS' | 'OPENING_CAPTURED_SLEEPING' | 'ACTIVE_NEAR_KO' | 'FINISHED';

export interface EventToTrack {
  event_id: number;
  sport_slug: string;
  league_slug?: string;
  home_team_id?: string;
  away_team_id?: string;
  player1_id?: string;
  player2_id?: string;
  event_date: Date;
  state: EventState;
  next_scan_at?: Date;
  home_score?: number;
  away_score?: number;
  status?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OpeningClosingObserved {
  id: string;
  event_id: number;
  sport_slug: string;
  league_slug?: string;
  bookmaker: string;
  market_name: string;
  selection: string;
  line?: number;
  opening_price_observed?: number;
  opening_time_observed?: Date;
  closing_price_observed?: number;
  closing_time_observed?: Date;
  is_winner?: boolean;
  created_at: Date;
  updated_at: Date;
}
