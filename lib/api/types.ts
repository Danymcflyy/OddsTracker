export interface OddsPapiSport {
  id: number;
  name: string;
  slug: string;
}

export interface OddsPapiTournament {
  tournamentId: number;
  tournamentSlug: string;
  tournamentName: string;
  categorySlug: string;
  categoryName: string;
  futureFixtures: number;
  upcomingFixtures: number;
  liveFixtures: number;
}

export interface OddsPapiTeam {
  id: number;
  name: string;
}

export interface OddsPapiFixture {
  id: string;
  sportId: number;
  tournamentId: number;
  startTime: string;
  status: string;
  homeTeam: OddsPapiTeam;
  awayTeam: OddsPapiTeam;
  homeScore?: number;
  awayScore?: number;
}

export interface OddsPapiOutcomeOdds {
  outcomeId: number;
  outcomeName: string;
  price: number;
  line?: number;
  lastUpdated: string;
}

export interface OddsPapiMarketOdds {
  marketId: number;
  marketName: string;
  outcomes: OddsPapiOutcomeOdds[];
}

export interface OddsPapiBookmakerOutcomePlayer {
  active?: boolean;
  bookmakerOutcomeId: string;
  line?: number;
  price: number;
  size?: number;
  handicap?: number;
}

export interface OddsPapiBookmakerOutcome {
  players: Record<string, OddsPapiBookmakerOutcomePlayer>;
}

export interface OddsPapiBookmakerMarket {
  bookmakerMarketId: string;
  outcomes: Record<string, OddsPapiBookmakerOutcome>;
}

export interface OddsPapiBookmaker {
  bookmakerIsActive: boolean;
  bookmakerFixtureId: string;
  fixturePath?: string;
  markets: Record<string, OddsPapiBookmakerMarket>;
}

export interface OddsPapiBookmakerOdds {
  [key: string]: OddsPapiBookmaker | undefined;
  pinnacle?: OddsPapiBookmaker;
}

export interface OddsPapiTournamentOdds {
  tournamentId: number;
  fixtureId: string;
  sportId: number;
  markets: OddsPapiMarketOdds[];
  lastUpdated: string;
  bookmakerOdds?: OddsPapiBookmakerOdds;
}

export interface OddsPapiHistoricalOddsResponse {
  fixtureId: string;
  bookmakers?: Record<string, OddsPapiHistoricalBookmaker>;
}

export interface OddsPapiHistoricalBookmaker {
  markets?: Record<string, OddsPapiHistoricalMarket>;
}

export interface OddsPapiHistoricalMarket {
  outcomes?: Record<string, OddsPapiHistoricalOutcome>;
}

export interface OddsPapiHistoricalOutcome {
  players?: Record<string, OddsPapiHistoricalPricePoint[]>;
}

export interface OddsPapiHistoricalPricePoint {
  id?: number;
  createdAt: string;
  price: number;
  limit?: number;
  active?: boolean;
  exchangeMeta?: unknown;
}

export interface OddsPapiMarketDefinition {
  marketId: number;
  marketLength: number;
  marketName: string;
  playerProp: boolean;
  sportId: number;
  handicap: number;
  period: string;
  marketType: string;
  outcomes: Array<{
    outcomeId: number;
    outcomeName: string;
  }>;
}

export interface OddsPapiSettlement {
  fixtureId: string;
  sportId: number;
  tournamentId: number;
  homeScore: number;
  awayScore: number;
  status: string;
  settledAt: string;
}

export interface OddsPapiAccount {
  plan: string;
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
  resetDate: string;
}
