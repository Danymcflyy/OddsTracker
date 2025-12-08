/**
 * Client API OddsPapi
 * Adapté pour fonctionner avec Supabase
 */

import { supabaseAdmin } from "@/lib/db";

// Types de base
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestsUsed?: number;
  requestsRemaining?: number;
}

export interface OddsPapiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface OddsPapiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsPapiMarket[];
}

export interface OddsPapiMarket {
  key: string;
  last_update: string;
  outcomes: OddsPapiOutcome[];
}

export interface OddsPapiOutcome {
  name: string;
  price: number;
  point?: number;
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

export interface OddsPapiScore {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores?: Array<{
    name: string;
    score: string;
  }>;
  last_update: string | null;
}

// Configuration
const API_KEY = process.env.ODDSPAPI_API_KEY;
const BASE_URL = process.env.ODDSPAPI_BASE_URL || "https://api.the-odds-api.com";
const RATE_LIMIT_MS = 1000; // 1 seconde entre chaque requête

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
 * Incrémente le compteur de requêtes API dans settings
 */
async function incrementApiRequests(): Promise<void> {
  try {
    const client = supabaseAdmin as any;
    // Récupérer le compteur actuel
    const { data: setting } = await client
      .from("settings")
      .select("value")
      .eq("key", "api_requests_count")
      .single();

    const settingRow = setting as { value: string | null } | null;
    const currentCount = settingRow?.value ? parseInt(settingRow.value, 10) : 0;

    // Incrémenter
    await client
      .from("settings")
      .update({
        value: (currentCount + 1).toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("key", "api_requests_count");
  } catch (error) {
    console.error("Erreur lors de l'incrémentation du compteur API:", error);
  }
}

/**
 * Effectue une requête vers l'API OddsPapi
 */
async function apiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  if (!API_KEY || API_KEY === "votre_cle_api") {
    return {
      success: false,
      error: "ODDSPAPI_API_KEY non configurée dans .env.local",
    };
  }

  // Respecter le rate limit
  await waitForRateLimit();

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("apiKey", API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  console.log(`[OddsPapi] ${endpoint}`, params);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    // Headers de quota
    const requestsUsed = response.headers.get("x-requests-used");
    const requestsRemaining = response.headers.get("x-requests-remaining");

    // Log dans la DB
    await incrementApiRequests();

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OddsPapi ERROR] ${response.status}: ${errorText}`);
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
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[OddsPapi ERROR] ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Liste tous les sports disponibles
 */
export async function getSports(
  includeInactive = false
): Promise<ApiResponse<OddsPapiSport[]>> {
  return apiRequest<OddsPapiSport[]>("/v4/sports", {
    all: includeInactive ? "true" : "false",
  });
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
    regions: options.regions || "eu",
    markets: options.markets || "h2h,spreads,totals",
    bookmakers: options.bookmakers || "pinnacle",
    oddsFormat: options.oddsFormat || "decimal",
  });
}

/**
 * Récupère les scores/résultats
 */
export async function getScores(
  sportKey: string,
  options: { daysFrom?: number } = {}
): Promise<ApiResponse<OddsPapiScore[]>> {
  const params: Record<string, string> = {};
  if (options.daysFrom) params.daysFrom = options.daysFrom.toString();

  return apiRequest<OddsPapiScore[]>(`/v4/sports/${sportKey}/scores`, params);
}

/**
 * Extrait les cotes Pinnacle d'un événement
 */
export function extractPinnacleOdds(event: OddsPapiEvent) {
  const pinnacle = event.bookmakers?.find((b) =>
    b.key.toLowerCase().includes("pinnacle")
  );

  if (!pinnacle) return null;

  const result: {
    lastUpdate: string;
    markets: Record<string, Record<string, number>>;
  } = {
    lastUpdate: pinnacle.last_update,
    markets: {},
  };

  pinnacle.markets.forEach((market) => {
    const outcomes: Record<string, number> = {};
    market.outcomes.forEach((o) => {
      outcomes[o.name] = o.price;
      if (o.point !== undefined) {
        outcomes[`${o.name}_point`] = o.point;
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
  const result = await apiRequest<OddsPapiSport[]>("/v4/sports");

  return {
    connected: result.success,
    requestsUsed: result.requestsUsed,
    requestsRemaining: result.requestsRemaining,
    error: result.error,
  };
}
