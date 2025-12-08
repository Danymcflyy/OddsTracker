import type { 
  ApiResponse, 
  OddsPapiSport, 
  OddsPapiEvent, 
  OddsPapiScores 
} from '@/types';
import { incrementApiRequests } from '@/lib/db';

const API_KEY = process.env.ODDSPAPI_API_KEY;
const BASE_URL = process.env.ODDSPAPI_BASE_URL || 'https://api.oddspapi.io';
const RATE_LIMIT_MS = parseInt(process.env.API_RATE_LIMIT_MS || '1000');

let lastRequestTime = 0;

/**
 * Attend le délai de rate limit si nécessaire
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Effectue une requête vers l'API OddsPapi
 */
export async function apiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {},
  options: { skipRateLimit?: boolean; skipDbLog?: boolean } = {}
): Promise<ApiResponse<T>> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return {
      success: false,
      error: 'API_KEY non configurée. Édite le fichier .env',
    };
  }

  // Respecter le rate limit
  if (!options.skipRateLimit) {
    await waitForRateLimit();
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('apiKey', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  console.log(`[API] ${endpoint} ${JSON.stringify(params)}`);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Headers de quota
    const requestsUsed = response.headers.get('x-requests-used');
    const requestsRemaining = response.headers.get('x-requests-remaining');

    // Log dans la DB
    if (!options.skipDbLog) {
      await incrementApiRequests(1).catch(() => {});
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API ERROR] ${response.status}: ${errorText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.slice(0, 200)}`,
        requestsUsed: requestsUsed ? parseInt(requestsUsed) : undefined,
        requestsRemaining: requestsRemaining ? parseInt(requestsRemaining) : undefined,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data,
      requestsUsed: requestsUsed ? parseInt(requestsUsed) : undefined,
      requestsRemaining: requestsRemaining ? parseInt(requestsRemaining) : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API ERROR] ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

// ===========================================
// ENDPOINTS
// ===========================================

/**
 * Liste tous les sports disponibles
 */
export async function getSports(includeInactive = false): Promise<ApiResponse<OddsPapiSport[]>> {
  return apiRequest<OddsPapiSport[]>('/v4/sports', {
    all: includeInactive ? 'true' : 'false',
  });
}

/**
 * Liste les événements à venir pour un sport
 */
export async function getEvents(sportKey: string): Promise<ApiResponse<OddsPapiEvent[]>> {
  return apiRequest<OddsPapiEvent[]>(`/v4/sports/${sportKey}/events`);
}

/**
 * Récupère les cotes pour un sport
 */
export async function getOdds(
  sportKey: string,
  options: {
    regions?: string;
    markets?: string;
    bookmakers?: string;
    oddsFormat?: string;
  } = {}
): Promise<ApiResponse<OddsPapiEvent[]>> {
  return apiRequest<OddsPapiEvent[]>(`/v4/sports/${sportKey}/odds`, {
    regions: options.regions || 'eu',
    markets: options.markets || 'h2h,spreads,totals',
    bookmakers: options.bookmakers || 'pinnacle',
    oddsFormat: options.oddsFormat || 'decimal',
  });
}

/**
 * Récupère les scores/résultats
 */
export async function getScores(
  sportKey: string,
  options: { daysFrom?: number; completed?: boolean } = {}
): Promise<ApiResponse<OddsPapiScores[]>> {
  const params: Record<string, string> = {};
  if (options.daysFrom) params.daysFrom = options.daysFrom.toString();
  if (options.completed !== undefined) params.completed = options.completed.toString();
  
  return apiRequest<OddsPapiScores[]>(`/v4/sports/${sportKey}/scores`, params);
}

/**
 * Récupère les cotes historiques pour un événement
 * NOTE: Vérifier le bon endpoint dans la doc OddsPapi
 */
export async function getHistoricalOdds(
  sportKey: string,
  eventId: string,
  date: string,
  options: {
    regions?: string;
    markets?: string;
    bookmakers?: string;
  } = {}
): Promise<ApiResponse<any>> {
  // Essayer différents formats d'endpoint possibles
  const endpoints = [
    `/v4/historical/sports/${sportKey}/events/${eventId}/odds`,
    `/v4/sports/${sportKey}/events/${eventId}/odds`,
    `/v4/historical/sports/${sportKey}/odds`,
  ];

  for (const endpoint of endpoints) {
    const result = await apiRequest<any>(endpoint, {
      date,
      regions: options.regions || 'eu',
      markets: options.markets || 'h2h',
      bookmakers: options.bookmakers || 'pinnacle',
    });

    if (result.success) {
      return result;
    }
  }

  return {
    success: false,
    error: 'Endpoint historique non trouvé. Vérifier la documentation OddsPapi.',
  };
}

/**
 * Récupère tous les événements historiques pour une date
 */
export async function getHistoricalEventsByDate(
  sportKey: string,
  date: string,
  options: {
    regions?: string;
    markets?: string;
  } = {}
): Promise<ApiResponse<any>> {
  return apiRequest<any>(`/v4/historical/sports/${sportKey}/odds`, {
    date,
    regions: options.regions || 'eu',
    markets: options.markets || 'h2h',
  });
}

// ===========================================
// HELPERS
// ===========================================

/**
 * Extrait les cotes Pinnacle d'un événement
 */
export function extractPinnacleOdds(event: OddsPapiEvent) {
  const pinnacle = event.bookmakers?.find(
    (b) => b.key.toLowerCase().includes('pinnacle')
  );

  if (!pinnacle) return null;

  const result: Record<string, any> = {
    lastUpdate: pinnacle.last_update,
    markets: {},
  };

  pinnacle.markets.forEach((market) => {
    const outcomes: Record<string, number> = {};
    market.outcomes.forEach((o) => {
      outcomes[o.name] = o.price;
      if (o.point !== undefined) {
        outcomes[`${o.name}_line`] = o.point;
      }
    });
    result.markets[market.key] = outcomes;
  });

  return result;
}

/**
 * Vérifie si l'API est accessible et retourne le quota
 */
export async function checkApiStatus(): Promise<{
  connected: boolean;
  requestsUsed?: number;
  requestsRemaining?: number;
  error?: string;
}> {
  const result = await apiRequest<OddsPapiSport[]>('/v4/sports', {}, { skipDbLog: true });

  return {
    connected: result.success,
    requestsUsed: result.requestsUsed,
    requestsRemaining: result.requestsRemaining,
    error: result.error,
  };
}
