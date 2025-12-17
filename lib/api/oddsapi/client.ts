/**
 * OddsApiClient - Client pour Odds-API.io API
 * Gère:
 * - Requêtes HTTP vers l'API
 * - Rate limiting (5000 req/h)
 * - Retry logic
 * - Error handling
 */

import type {
  OddsApiClientConfig,
  OddsApiErrorResponse,
  OddsApiEvent,
  OddsApiEventsResponse,
  OddsApiOddsMultiResponse,
  OddsApiOddsResponse,
  OddsApiUpdatedResponse,
} from './types';

const DEFAULT_BASE_URL = 'https://api2.odds-api.io';
const DEFAULT_BOOKMAKERS = ['Pinnacle'];  // Note: case-sensitive!
const DEFAULT_MARKETS = [
  'h2h',
  'spreads',
  'totals',
  'team_totals_home',
  'team_totals_away',
  'btts',
];

// Rate limiting configuration (in ms between requests)
const RATE_LIMITS_MS: Record<string, number> = {
  '/v3/odds/updated': 1000,  // 60 req/h for incremental
  '/v3/odds/multi': 500,      // Can be faster for multi
  '/v3/odds': 500,            // Single odds
  '/v3/events': 1000,         // Events enrichment
  default: 500,
};

const DAILY_REQUEST_LIMIT = 5000;  // Odds-API.io limit

interface OddsApiErrorBody {
  error?: string;
  message?: string;
  details?: unknown;
}

export class OddsApiError extends Error {
  status: number;
  body: OddsApiErrorBody | string | null;

  constructor(message: string, status: number, body: OddsApiErrorBody | string | null = null) {
    super(message);
    this.name = 'OddsApiError';
    this.status = status;
    this.body = body;
  }
}

export class OddsApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultBookmakers: string[];
  private readonly defaultMarkets: string[];
  private readonly queues = new Map<string, Promise<void>>();
  private requestsUsedToday = 0;
  private lastResetTime = new Date();

  constructor(config: OddsApiClientConfig) {
    if (!config.apiKey) {
      throw new Error('ODDS_API_IO_KEY manquée - les requêtes OddsApi échoueront.');
    }

    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
    this.defaultBookmakers = config.defaultParams?.bookmakers || DEFAULT_BOOKMAKERS;
    this.defaultMarkets = config.defaultParams?.markets || DEFAULT_MARKETS;
  }

  /**
   * Récupère les événements pour une ligue
   */
  async getEvents(params: {
    sport: string;
    league?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<OddsApiEvent[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('sport', params.sport);
    if (params.league) {
      searchParams.set('league', params.league);
    }
    if (params.fromDate) {
      // L'API nécessite le format RFC3339, pas Unix timestamp
      searchParams.set('from', this.dateToRFC3339(params.fromDate));
    }
    if (params.toDate) {
      // L'API nécessite le format RFC3339, pas Unix timestamp
      searchParams.set('to', this.dateToRFC3339(params.toDate));
    }

    // L'API retourne un array directement, pas un objet avec 'events'
    const response = await this.request<OddsApiEvent[]>(
      `/v3/events?${searchParams.toString()}`,
      { endpoint: '/v3/events' }
    );

    return Array.isArray(response) ? response : [];
  }

  /**
   * Récupère les cotes pour un événement unique
   */
  async getOdds(eventId: number, params?: { markets?: string[] }): Promise<OddsApiOddsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('eventId', eventId.toString());
    searchParams.set('bookmakers', this.defaultBookmakers.join(','));

    const markets = params?.markets || this.defaultMarkets;
    searchParams.set('markets', markets.join(','));

    return this.request<OddsApiOddsResponse>(
      `/v3/odds?${searchParams.toString()}`,
      { endpoint: '/v3/odds' }
    );
  }

  /**
   * Récupère les cotes pour plusieurs événements
   * Note: L'endpoint /v3/odds/multi semble avoir des problèmes avec plusieurs IDs,
   * donc on fait des appels individuels à /v3/odds pour chaque événement
   */
  async getOddsMulti(eventIds: number[], params?: { markets?: string[] }): Promise<OddsApiOddsMultiResponse> {
    const results: OddsApiOddsResponse[] = [];
    const total = eventIds.length;

    // Appeler /v3/odds pour chaque événement individuellement
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];
      console.log(`  📥 [${i + 1}/${total}] Récupération cotes event ${eventId}...`);

      try {
        const odds = await this.getOdds(eventId, params);
        results.push(odds);
        console.log(`  ✅ [${i + 1}/${total}] Cotes récupérées`);
      } catch (error) {
        console.error(`  ⚠️  [${i + 1}/${total}] Erreur récupération cotes pour event ${eventId}:`, error);
        // Continuer avec les autres événements même si un échoue
      }
    }

    return results as OddsApiOddsMultiResponse;
  }

  /**
   * Récupère les cotes mises à jour depuis un timestamp
   * Utilisé pour incremental polling (Job A)
   * Note: bookmaker (singulier) est OBLIGATOIRE sur cet endpoint
   */
  async getOddsUpdated(params: {
    sport: string;
    since: number;  // Unix timestamp
    bookmakers?: string[];
    markets?: string[];
  }): Promise<OddsApiUpdatedResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('sport', params.sport);
    searchParams.set('since', params.since.toString());
    // Note: 'bookmaker' singulier est REQUIS
    searchParams.set('bookmaker', (params.bookmakers || this.defaultBookmakers)[0]);
    searchParams.set('markets', (params.markets || this.defaultMarkets).join(','));

    return this.request<OddsApiUpdatedResponse>(
      `/v3/odds/updated?${searchParams.toString()}`,
      { endpoint: '/v3/odds/updated' }
    );
  }

  /**
   * Requête HTTP interne avec gestion des erreurs et rate limiting
   */
  private async request<T>(
    endpoint: string,
    options?: { endpoint?: string }
  ): Promise<T> {
    // Ajouter apiKey à l'URL (utiliser & ou ? selon si des params existent déjà)
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${endpoint}${separator}apiKey=${encodeURIComponent(this.apiKey)}`;
    const key = options?.endpoint || endpoint;

    const task = async () => {
      // Vérifier quota
      await this.checkQuota();

      let response: Response;
      let attempted = false;

      try {
        attempted = true;
        response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        });
      } catch (error) {
        throw new OddsApiError(
          `Erreur réseau: ${error instanceof Error ? error.message : 'Unknown error'}`,
          0,
          null
        );
      }

      // Incrémenter le compteur de requêtes
      if (attempted) {
        this.requestsUsedToday++;
      }

      let rawBody = '';
      try {
        rawBody = await response.text();
      } catch (error) {
        throw new OddsApiError(
          'Impossible de lire la réponse',
          response.status,
          null
        );
      }

      // Parser JSON
      const parseJson = () => {
        if (!rawBody) return null;
        try {
          return JSON.parse(rawBody);
        } catch {
          throw new OddsApiError(
            `Réponse invalide de OddsApi (${key})`,
            response.status,
            rawBody.slice(0, 500)
          );
        }
      };

      // Vérifier status HTTP
      if (!response.ok) {
        const body = parseJson();
        const errorMsg =
          body && typeof body === 'object' && 'message' in body
            ? (body as OddsApiErrorBody).message || 'Erreur OddsApi'
            : `Erreur HTTP ${response.status}`;

        throw new OddsApiError(errorMsg, response.status, body);
      }

      return parseJson() as T;
    };

    return this.enqueue(key, task);
  }

  /**
   * Gère la queue de requêtes avec rate limiting
   */
  private enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
    const cooldown = RATE_LIMITS_MS[key] ?? RATE_LIMITS_MS.default;
    const previous = this.queues.get(key) ?? Promise.resolve();
    const safePrevious = previous.catch(() => undefined);

    const run = safePrevious.then(task);
    const next = run
      .catch(() => undefined)
      .then(() => this.delay(cooldown));

    this.queues.set(key, next);
    return run;
  }

  /**
   * Vérifier le quota quotidien
   */
  private async checkQuota(): Promise<void> {
    const now = new Date();
    const dayHasPassed = now.getUTCDate() !== this.lastResetTime.getUTCDate();

    if (dayHasPassed) {
      this.requestsUsedToday = 0;
      this.lastResetTime = now;
    }

    if (this.requestsUsedToday >= DAILY_REQUEST_LIMIT) {
      throw new OddsApiError(
        'Quota quotidien OddsApi atteint (5000 req/h). Réessayez demain.',
        429,
        null
      );
    }
  }

  /**
   * Convertit une Date en format RFC3339 (requis par l'API)
   */
  private dateToRFC3339(date: Date): string {
    return date.toISOString();
  }

  /**
   * Delay utilitaire
   */
  private delay(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * Getter pour le nombre de requêtes utilisées
   */
  getRequestsUsedToday(): number {
    return this.requestsUsedToday;
  }

  /**
   * Setter pour réinitialiser le compteur (utile pour tests)
   */
  resetRequestCounter(): void {
    this.requestsUsedToday = 0;
    this.lastResetTime = new Date();
  }
}

/**
 * Instance singleton du client OddsApi
 * Créée si la clé API est disponible
 */
let oddsApiClientInstance: OddsApiClient | null = null;

export function getOddsApiClient(): OddsApiClient {
  if (!oddsApiClientInstance) {
    const apiKey = process.env.ODDS_API_IO_KEY;
    if (!apiKey) {
      throw new Error('ODDS_API_IO_KEY manquée dans les variables d\'environnement');
    }

    oddsApiClientInstance = new OddsApiClient({
      apiKey,
      baseUrl: process.env.ODDS_API_BASE_URL || DEFAULT_BASE_URL,
    });
  }

  return oddsApiClientInstance;
}

/**
 * Export pour accès direct
 */
export const oddsApiClient = (() => {
  try {
    return getOddsApiClient();
  } catch (error) {
    console.warn('⚠️  OddsApi client non disponible:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
})();
