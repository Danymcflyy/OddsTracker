/**
 * Normalizer pour Odds-API.io
 * Convertit les réponses API en format interne
 * Gère la normalisation des noms de teams/joueurs/marchés
 */

import type {
  NormalizedMarket,
  NormalizedOddsApiEvent,
  NormalizedOddsApiOdds,
  NormalizedOutcome,
  OddsApiEvent,
  OddsApiMarketResponse,
  OddsApiOddsResponse,
} from './types';

// ============================================================================
// Normalisation des noms de marchés
// ============================================================================

const MARKET_MAPPING: Record<string, string> = {
  // Moneyline / 1X2
  'h2h': 'h2h',
  'moneyline': 'h2h',

  // Spreads / Handicaps
  'spreads': 'spreads',
  'handicap': 'spreads',

  // Totals / Over-Under
  'totals': 'totals',
  'over_under': 'totals',

  // Team Totals
  'team_totals_home': 'team_totals_home',
  'team_totals_away': 'team_totals_away',

  // Halftime
  'h2h_h1': 'h2h_h1',
  'totals_h1': 'totals_h1',
  'spreads_h1': 'spreads_h1',

  // Player Props
  'player_aces': 'player_aces',
  'player_sets_won': 'player_sets_won',
  'player_games_won': 'player_games_won',
  'player_first_set': 'player_first_set',
};

// ============================================================================
// Normalisation des noms d'issues
// ============================================================================

const OUTCOME_MAPPING: Record<string, string> = {
  // Football 1X2
  'Home': '1',
  'home': '1',
  'Away': '2',
  'away': '2',
  'Draw': 'X',
  'draw': 'X',

  // Over/Under
  'Over': 'OVER',
  'over': 'OVER',
  'Under': 'UNDER',
  'under': 'UNDER',

  // Spreads/Handicaps
  'Favorite': 'FAV',
  'favorite': 'FAV',
  'Underdog': 'UND',
  'underdog': 'UND',

  // Player names (Tennis)
  'Player1': 'PLAYER1',
  'player1': 'PLAYER1',
  'Player2': 'PLAYER2',
  'player2': 'PLAYER2',

  // Set outcomes (Tennis)
  'First': 'FIRST',
  'first': 'FIRST',
  'Second': 'SECOND',
  'second': 'SECOND',
  'Third': 'THIRD',
  'third': 'THIRD',
};

// ============================================================================
// Normalisation des noms de teams/joueurs
// ============================================================================

// Mapping d'équipes problématiques
const TEAM_ALIASES: Record<string, string> = {
  'Paris SG': 'Paris Saint-Germain',
  'PSG': 'Paris Saint-Germain',
  'Man City': 'Manchester City',
  'Man United': 'Manchester United',
  'Man Utd': 'Manchester United',
  'Tottenham': 'Tottenham Hotspur',
  'Spurs': 'Tottenham Hotspur',
  'Leicester': 'Leicester City',
  'West Brom': 'West Bromwich Albion',
  'Brighton': 'Brighton & Hove Albion',
  'Wolves': 'Wolverhampton Wanderers',
  'Stoke': 'Stoke City',
  'Swansea': 'Swansea City',
  'Salford': 'Salford City',
};

// ============================================================================
// Normalisation d'API responses
// ============================================================================

/**
 * Normalise un événement OddsApi en format interne
 */
export function normalizeOddsApiEvent(event: OddsApiEvent): NormalizedOddsApiEvent {
  return {
    eventId: event.id,
    sportSlug: normalizeSportSlug(event.sport_key),
    leagueSlug: normalizeLeagueSlug(event.league_key),
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    player1: event.player1,
    player2: event.player2,
    eventDate: new Date(event.commence_time),
    status: (event.status as any) || 'pending',
    scores: event.scores ? {
      home: event.scores.home,
      away: event.scores.away,
    } : undefined,
  };
}

/**
 * Normalise les cotes OddsApi en format interne
 */
export function normalizeOddsApiOdds(odds: OddsApiOddsResponse): NormalizedOddsApiOdds {
  const bookmakerOdds: Record<string, any> = {};

  // Traiter chaque bookmaker (normalement juste Pinnacle)
  for (const bookmaker of odds.bookmakers || []) {
    const bookmakerKey = normalizeBookmakerKey(bookmaker.key);
    bookmakerOdds[bookmakerKey] = {
      markets: {},
    };

    // Traiter chaque marché
    for (const market of bookmaker.markets || []) {
      const marketKey = normalizeMarketKey(market.key);
      bookmakerOdds[bookmakerKey].markets[marketKey] = {
        outcomes: {},
      };

      // Traiter chaque issue
      for (const outcome of market.outcomes || []) {
        const outcomeName = normalizeOutcomeName(outcome.name);
        bookmakerOdds[bookmakerKey].markets[marketKey].outcomes[outcomeName] = {
          price: outcome.price,
          ...(outcome.point !== undefined && { line: outcome.point }),
        };
      }
    }
  }

  return {
    eventId: odds.id,
    lastUpdated: new Date(odds.bookmakers?.[0]?.last_update || new Date()),
    bookmakerOdds,
  };
}

/**
 * Normalise un marché pour stockage
 */
export function normalizeMarket(market: OddsApiMarketResponse): NormalizedMarket {
  return {
    marketName: normalizeMarketKey(market.key),
    outcomes: (market.outcomes || []).map((outcome) => ({
      name: normalizeOutcomeName(outcome.name),
      price: outcome.price,
      ...(outcome.point !== undefined && { line: outcome.point }),
    })),
  };
}

// ============================================================================
// Normalisation de valeurs individuelles
// ============================================================================

/**
 * Normalise un slug de sport
 */
export function normalizeSportSlug(sportKey: string): string {
  // Exemples:
  // 'football_epl' -> 'Football'
  // 'tennis_atp' -> 'Tennis'
  // 'tennis_wta' -> 'Tennis'

  if (sportKey.includes('football') || sportKey.includes('soccer')) {
    return 'Football';
  }
  if (sportKey.includes('tennis')) {
    return 'Tennis';
  }

  // Fallback: capitaliser le premier mot
  const parts = sportKey.split('_');
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

/**
 * Normalise un slug de ligue
 */
export function normalizeLeagueSlug(leagueKey: string): string {
  // Retourner le key original, sera mappé dans la DB
  // Exemples:
  // 'soccer_epl' -> 'england-premier-league'
  // 'tennis_atp_main_tour' -> 'atp_main_tour'
  return leagueKey;
}

/**
 * Normalise une clé de marché
 */
export function normalizeMarketKey(marketKey: string): string {
  return MARKET_MAPPING[marketKey] || marketKey;
}

/**
 * Normalise un nom d'issue
 */
export function normalizeOutcomeName(outcomeName: string): string {
  return OUTCOME_MAPPING[outcomeName] || outcomeName.toUpperCase();
}

/**
 * Normalise un nom de bookmaker
 */
export function normalizeBookmakerKey(bookmakerKey: string): string {
  // Normaliser en minuscules
  return bookmakerKey.toLowerCase();
}

/**
 * Normalise un nom d'équipe
 */
export function normalizeTeamName(teamName: string): string {
  if (!teamName) return '';

  // Appliquer les alias
  const aliased = TEAM_ALIASES[teamName] || teamName;

  // Normalisation standard
  return aliased
    .toLowerCase()
    .trim()
    .normalize('NFD')  // Décomposer les accents
    .replace(/[\u0300-\u036f]/g, '');  // Retirer les accents
}

/**
 * Normalise un nom de joueur (Tennis)
 */
export function normalizePlayerName(playerName: string): string {
  if (!playerName) return '';

  return playerName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ============================================================================
// Extraction de métadonnées
// ============================================================================

/**
 * Extrait le handicap d'un nom d'issue avec point
 */
export function extractHandicap(outcomeName: string, point?: number): number | undefined {
  if (point !== undefined && point !== null) {
    return point;
  }

  // Parser le handicap du nom si présent
  const match = outcomeName.match(/([+-]\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : undefined;
}

/**
 * Détermine si une issue est "OVER" ou "UNDER"
 */
export function isOverOutcome(normalizedName: string): boolean {
  return normalizedName === 'OVER';
}

export function isUnderOutcome(normalizedName: string): boolean {
  return normalizedName === 'UNDER';
}

/**
 * Détermine si une issue est "HOME" ou "AWAY"
 */
export function isHomeOutcome(normalizedName: string): boolean {
  return normalizedName === '1';
}

export function isAwayOutcome(normalizedName: string): boolean {
  return normalizedName === '2';
}

export function isDrawOutcome(normalizedName: string): boolean {
  return normalizedName === 'X';
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Valide qu'une cote est valide
 */
export function isValidOdd(price: number): boolean {
  return typeof price === 'number' && price > 1;
}

/**
 * Valide qu'un marché a au moins une issue avec cote
 */
export function isValidMarket(market: NormalizedMarket): boolean {
  return market.outcomes.length > 0 && market.outcomes.some((o) => isValidOdd(o.price));
}

/**
 * Valide qu'un événement a les champs requis
 */
export function isValidEvent(event: NormalizedOddsApiEvent, sport: string): boolean {
  const hasTeams = event.homeTeam && event.awayTeam;
  const hasPlayers = event.player1 && event.player2;

  if (sport === 'Football') {
    return hasTeams && event.eventDate != null;
  }

  if (sport === 'Tennis') {
    return hasPlayers && event.eventDate != null;
  }

  return false;
}
