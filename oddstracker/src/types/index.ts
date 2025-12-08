// ===========================================
// Types pour l'API OddsPapi
// ===========================================

export interface OddsPapiSport {
  key: string;
  group: string;
  title: string;
  description?: string;
  active: boolean;
  has_outrights?: boolean;
}

export interface OddsPapiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: OddsPapiBookmaker[];
}

export interface OddsPapiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsPapiMarket[];
}

export interface OddsPapiMarket {
  key: string;
  last_update?: string;
  outcomes: OddsPapiOutcome[];
}

export interface OddsPapiOutcome {
  name: string;
  price: number;
  point?: number; // Pour handicap/totals
}

export interface OddsPapiScores {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores?: {
    name: string;
    score: string;
  }[];
  last_update?: string;
}

// ===========================================
// Types pour l'application
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestsUsed?: number;
  requestsRemaining?: number;
}

export interface SyncProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  currentSport?: string;
  currentLeague?: string;
  fixturesProcessed: number;
  fixturesTotal: number;
  oddsAdded: number;
  requestsUsed: number;
  errors: string[];
  startTime?: Date;
  endTime?: Date;
}

export interface FilterOptions {
  sport?: string;
  league?: string;
  country?: string;
  team?: string;
  dateFrom?: Date;
  dateTo?: Date;
  market?: string;
  oddsType?: 'OPENING' | 'CLOSING';
  oddsMin?: number;
  oddsMax?: number;
}

export interface FixtureWithOdds {
  id: string;
  date: Date;
  country: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  odds: {
    market: string;
    type: string;
    home: number;
    draw: number | null;
    away: number;
    line: number | null;
  }[];
}

// ===========================================
// Configuration des sports/ligues cibles
// ===========================================

export const TARGET_SPORTS = [
  {
    key: 'soccer',
    name: 'Football',
    leagues: [
      { key: 'soccer_epl', name: 'Premier League', country: 'England' },
      { key: 'soccer_spain_la_liga', name: 'La Liga', country: 'Spain' },
      { key: 'soccer_germany_bundesliga', name: 'Bundesliga', country: 'Germany' },
      { key: 'soccer_italy_serie_a', name: 'Serie A', country: 'Italy' },
      { key: 'soccer_france_ligue_one', name: 'Ligue 1', country: 'France' },
      { key: 'soccer_portugal_primeira_liga', name: 'Primeira Liga', country: 'Portugal' },
      { key: 'soccer_netherlands_eredivisie', name: 'Eredivisie', country: 'Netherlands' },
      { key: 'soccer_belgium_first_div', name: 'Pro League', country: 'Belgium' },
      { key: 'soccer_uefa_champs_league', name: 'Champions League', country: 'Europe' },
      { key: 'soccer_uefa_europa_league', name: 'Europa League', country: 'Europe' },
    ],
  },
  {
    key: 'icehockey',
    name: 'Hockey',
    leagues: [
      { key: 'icehockey_nhl', name: 'NHL', country: 'USA/Canada' },
      { key: 'icehockey_sweden_shl', name: 'SHL', country: 'Sweden' },
      { key: 'icehockey_finland_liiga', name: 'Liiga', country: 'Finland' },
    ],
  },
  {
    key: 'tennis',
    name: 'Tennis',
    leagues: [
      { key: 'tennis_atp_australian_open', name: 'Australian Open', country: 'Australia' },
      { key: 'tennis_atp_french_open', name: 'Roland Garros', country: 'France' },
      { key: 'tennis_atp_wimbledon', name: 'Wimbledon', country: 'UK' },
      { key: 'tennis_atp_us_open', name: 'US Open', country: 'USA' },
    ],
  },
  {
    key: 'volleyball',
    name: 'Volleyball',
    leagues: [
      { key: 'volleyball_italy_superlega', name: 'SuperLega', country: 'Italy' },
      { key: 'volleyball_poland_plusliga', name: 'PlusLiga', country: 'Poland' },
    ],
  },
] as const;

export type SportKey = typeof TARGET_SPORTS[number]['key'];
