import type {
  OddsPapiAccount,
  OddsPapiFixture,
  OddsPapiHistoricalOddsResponse,
  OddsPapiMarketDefinition,
  OddsPapiSettlement,
  OddsPapiSport,
  OddsPapiTournament,
  OddsPapiTournamentOdds,
} from "./types";
import { supabaseAdmin } from "@/lib/db";
import { SettingKey } from "@/types/settings";

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | Array<QueryPrimitive>;
type QueryParams = Record<string, QueryValue | undefined>;

const DEFAULT_BASE_URL = process.env.ODDSPAPI_BASE_URL || "https://api.oddspapi.io";
const DEFAULT_API_KEY = process.env.ODDSPAPI_API_KEY || "";
const DEFAULT_QUERY_PARAMS: Record<string, string> = {
  bookmakers: "pinnacle",
};

const RATE_LIMITS_MS: Record<string, number> = {
  "/v4/historical-odds": 5000,
  "/v4/odds-by-tournaments": 1000,
  default: 500,
};

const DAILY_REQUEST_LIMIT = Number(process.env.ODDSPAPI_DAILY_LIMIT ?? "1000");
const HAS_ADMIN_CLIENT = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

interface OddsPapiErrorBody {
  error?: string;
  message?: string;
  details?: unknown;
}

export class OddsPapiError extends Error {
  status: number;
  body: OddsPapiErrorBody | string | null;

  constructor(message: string, status: number, body: OddsPapiErrorBody | string | null) {
    super(message);
    this.name = "OddsPapiError";
    this.status = status;
    this.body = body;
  }
}

export interface OddsPapiClientOptions {
  baseUrl?: string;
  apiKey?: string;
  defaultParams?: Record<string, string>;
}

export class OddsPapiClient {
  private readonly baseUrl: string;
  private readonly defaultApiKey: string;
  private apiKey: string;
  private readonly defaultParams: Record<string, string>;
  private readonly queues = new Map<string, Promise<void>>();

  constructor(options?: OddsPapiClientOptions) {
    this.baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
    this.defaultApiKey = options?.apiKey || DEFAULT_API_KEY;
    this.apiKey = this.defaultApiKey;
    this.defaultParams = { ...DEFAULT_QUERY_PARAMS, ...(options?.defaultParams || {}) };

    if (!this.apiKey) {
      console.warn("⚠️  ODDSPAPI_API_KEY manquant - les requêtes OddsPapi échoueront.");
    }
  }

  /**
   * Met à jour la clé API à la volée (ex: chargée depuis Supabase)
   */
  setApiKey(value?: string | null) {
    const next = value && value.trim().length > 0 ? value.trim() : this.defaultApiKey;
    if (!next) {
      console.warn("⚠️  Aucune clé OddsPapi définie. Les appels échoueront.");
    }
    this.apiKey = next;
  }

  /**
   * Liste des sports disponibles
   */
  getSports() {
    return this.request<OddsPapiSport[]>("/v4/sports", undefined, { disableDefaultParams: true });
  }

  /**
   * Liste des tournois par sport
   */
  getTournaments(sportId: number, params?: { countrySlug?: string }) {
    return this.request<OddsPapiTournament[]>("/v4/tournaments", {
      sportId,
      countrySlug: params?.countrySlug,
    });
  }

  /**
   * Fixtures par tournoi (ou par sport)
   */
  getFixtures(params: { tournamentId?: number; sportId?: number; from?: string; to?: string }) {
    return this.request<OddsPapiFixture[]>("/v4/fixtures", params);
  }

  /**
   * Cotes actuelles par tournoi
   */
  getOddsByTournaments(tournamentIds: number[], params?: { markets?: string }) {
    return this.request<OddsPapiTournamentOdds[]>("/v4/odds-by-tournaments", {
      tournamentIds: tournamentIds.join(","),
      markets: params?.markets,
    });
  }

  /**
   * Historique ouverture/fermeture des cotes
   */
  getHistoricalOdds(fixtureId: string) {
    return this.request<OddsPapiHistoricalOddsResponse>("/v4/historical-odds", {
      fixtureId,
    });
  }

  /**
   * Définition des marchés disponibles
   */
  getMarkets(params?: { language?: string }) {
    return this.request<OddsPapiMarketDefinition[]>("/v4/markets", {
      language: params?.language,
    });
  }

  /**
   * Résultats officiels (settlements)
   */
  getSettlements(params: { sportId?: number; from?: string; to?: string }) {
    return this.request<OddsPapiSettlement[]>("/v4/settlements", params);
  }

  /**
   * Requêtes compte API
   */
  getAccount() {
    return this.request<OddsPapiAccount>("/account", undefined, { disableDefaultParams: true });
  }

  private getCooldown(endpoint: string) {
    return RATE_LIMITS_MS[endpoint] ?? RATE_LIMITS_MS.default;
  }

  private async request<T>(
    endpoint: string,
    params?: QueryParams,
    options?: { disableDefaultParams?: boolean }
  ): Promise<T> {
    if (!this.apiKey) {
      throw new OddsPapiError("OddsPapi API key manquante", 401, null);
    }

    const url = this.buildUrl(endpoint, params, options?.disableDefaultParams);
    const task = async () => {
      await guardApiQuota();
      let response: Response;
      let attempted = false;

      try {
        attempted = true;
        response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });
      } finally {
        if (attempted) {
          await incrementApiRequests();
        }
      }

      let rawBody = await response.text();
      if (rawBody.startsWith("[[object Object],")) {
        rawBody = "[" + rawBody.slice("[[object Object],".length);
      }

      const parseJson = () => {
        if (!rawBody) return null;
        try {
          return JSON.parse(rawBody);
        } catch {
          throw new OddsPapiError(
            `Réponse OddsPapi invalide (${endpoint})`,
            response.status,
            rawBody.slice(0, 500)
          );
        }
      };

      if (!response.ok) {
        const body = parseJson();
        throw new OddsPapiError(
          body && typeof body === "object" && "message" in body
            ? (body as OddsPapiErrorBody).message || "Erreur OddsPapi"
            : "Erreur OddsPapi",
          response.status,
          body
        );
      }

      return parseJson() as T;
    };

    return this.enqueue(endpoint, task);
  }

  private enqueue<T>(endpoint: string, task: () => Promise<T>): Promise<T> {
    const key = endpoint;
    const cooldown = this.getCooldown(endpoint);
    const previous = this.queues.get(key) ?? Promise.resolve();
    const safePrevious = previous.catch(() => undefined);
    const run = safePrevious.then(task);
    const next = run
      .catch(() => undefined)
      .then(() => delay(cooldown));

    this.queues.set(key, next);
    return run;
  }

  private buildUrl(endpoint: string, params?: QueryParams, disableDefaultParams?: boolean) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set("apiKey", this.apiKey);

    const query: QueryParams = disableDefaultParams ? {} : { ...this.defaultParams };
    if (params) {
      Object.assign(query, params);
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        url.searchParams.set(key, value.map((v) => String(v)).join(","));
        return;
      }
      url.searchParams.set(key, String(value));
    });

    return url;
  }
}

type ApiRequestState = {
  count: number;
  resetDate: Date | null;
};

async function guardApiQuota() {
  if (!HAS_ADMIN_CLIENT || !DAILY_REQUEST_LIMIT) {
    return;
  }

  const state = await ensureApiRequestState();
  if (state.count >= DAILY_REQUEST_LIMIT) {
    throw new OddsPapiError(
      "Quota quotidien OddsPapi atteint. Réessayez après la prochaine réinitialisation.",
      429,
      null
    );
  }
}

async function incrementApiRequests() {
  if (!HAS_ADMIN_CLIENT || !DAILY_REQUEST_LIMIT) {
    return;
  }

  const state = await ensureApiRequestState();
  try {
    await writeSettings({
      [SettingKey.API_REQUESTS_COUNT]: String(state.count + 1),
    });
  } catch (error) {
    console.error("Impossible de mettre à jour le compteur de requêtes API", error);
  }
}

async function ensureApiRequestState(): Promise<ApiRequestState> {
  const state = await readApiRequestState();
  const now = new Date();
  if (!state.resetDate || now >= state.resetDate) {
    const nextReset = getNextResetDate();
    await writeSettings({
      [SettingKey.API_REQUESTS_COUNT]: "0",
      [SettingKey.API_REQUESTS_RESET_DATE]: nextReset.toISOString(),
    });
    return { count: 0, resetDate: nextReset };
  }
  return state;
}

async function readApiRequestState(): Promise<ApiRequestState> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key,value")
    .in("key", [SettingKey.API_REQUESTS_COUNT, SettingKey.API_REQUESTS_RESET_DATE]);

  if (error || !data) {
    return { count: 0, resetDate: null };
  }

  let count = 0;
  let resetDate: Date | null = null;
  data.forEach((row) => {
    if (row.key === SettingKey.API_REQUESTS_COUNT) {
      count = parseInt(row.value ?? "0", 10) || 0;
    } else if (row.key === SettingKey.API_REQUESTS_RESET_DATE && row.value) {
      resetDate = new Date(row.value);
    }
  });
  return { count, resetDate };
}

function getNextResetDate() {
  const next = new Date();
  next.setUTCHours(0, 0, 0, 0);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

async function writeSettings(values: Record<string, string>) {
  const entries = Object.entries(values).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  await supabaseAdmin.from("settings").upsert(entries, { onConflict: "key" });
}

function delay(duration: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

export const oddsPapiClient = new OddsPapiClient();
