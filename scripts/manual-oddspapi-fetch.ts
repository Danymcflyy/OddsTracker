import "./load-env";

import { addDays } from "date-fns";

import { oddsPapiClient } from "@/lib/api/oddspapi";
import type {
  OddsPapiBookmakerMarket,
  OddsPapiBookmakerOdds,
  OddsPapiHistoricalPricePoint,
  OddsPapiHistoricalOddsResponse,
  OddsPapiMarketDefinition,
  OddsPapiMarketOdds,
} from "@/lib/api/types";
import { BASE_MARKETS, normalizeTeamName } from "@/lib/import/catalog";
import { supabaseAdmin, isAdminAvailable } from "@/lib/db";

interface CliOptions {
  sportId: number;
  tournamentId?: number;
  from: string;
  to: string;
  limit?: number;
  insert: boolean;
  historicalOnly: boolean;
}

async function run() {
  const options = parseArgs();
  console.log(
    `📡 Requête OddsPapi • sportId=${options.sportId}${
      options.tournamentId ? ` • tournamentId=${options.tournamentId}` : ""
    } • période=${options.from} → ${options.to}${
      options.limit ? ` • limite=${options.limit}` : ""
    }${options.insert ? "" : " • mode lecture seule"}${
      options.historicalOnly ? " • historique uniquement" : ""
    }`
  );

  const tournaments = await oddsPapiClient.getTournaments(options.sportId);
  const tournamentMap = new Map(tournaments.map((t) => [t.tournamentId, t]));

  const rawFixtures = await oddsPapiClient.getFixtures({
    sportId: options.sportId,
    tournamentId: options.tournamentId,
    from: options.from,
    to: options.to,
  });

  if (process.env.DEBUG_ODDSPAPI === "true") {
    console.log("🔎 Aperçu fixtures OddsPapi :");
    console.dir(rawFixtures.slice(0, 5), { depth: null });
  }

  const fixtures = normalizeFixtures(rawFixtures);

  // Filtrer les fixtures avec équipes complètes
  const validFixtures = fixtures.filter((f) => f.homeTeam && f.awayTeam);
  const selected = options.limit ? validFixtures.slice(0, options.limit) : validFixtures;

  const skipped = fixtures.length - validFixtures.length;

  console.log(
    `📊 ${fixtures.length} matchs récupérés (${validFixtures.length} valides, ${selected.length} sélectionnés)`
  );
  if (skipped > 0) {
    console.log(`⚠️  ${skipped} matchs ignorés (équipes manquantes)`);
  }

  if (!options.insert) {
    console.log("");
    selected.forEach((fixture) => {
      console.log(
        `• ${fixture.id} ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} – ${fixture.startTime} (${fixture.status})`
      );
    });
    return;
  }

  if (!isAdminAvailable()) {
    throw new Error("L'insertion nécessite SUPABASE_SERVICE_ROLE_KEY dans l'environnement.");
  }

  const marketMetadata = await loadMarketMetadata(options.sportId);
  const sportDbId = await ensureSport(options.sportId);

  const oddspapiFixtureIds: string[] = [];
  for (const fixture of selected) {
    const tournament =
      tournamentMap.get(fixture.tournamentId) ??
      createFallbackTournament(fixture.tournamentId);

    if (!fixture.homeTeam || !fixture.awayTeam) {
      console.warn(
        `⚠️ Fixture ${fixture.id} ignoré : équipes incomplètes (home=${Boolean(
          fixture.homeTeam
        )}, away=${Boolean(fixture.awayTeam)})`
      );
      continue;
    }

    const leagueId = await ensureLeague(tournament, sportDbId);
    const homeTeamId = await ensureTeam(fixture.homeTeam);
    const awayTeamId = await ensureTeam(fixture.awayTeam);

    await upsertFixture({
      oddspapiId: fixture.id,
      sportDbId,
      leagueId,
      homeTeamId,
      awayTeamId,
      startTime: fixture.startTime,
      homeScore: fixture.homeScore ?? null,
      awayScore: fixture.awayScore ?? null,
      status: fixture.status ?? "scheduled",
    });

    oddspapiFixtureIds.push(fixture.id);
    console.log(`✅ Fixture inséré/mis à jour : ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
  }

  const fixtureIdMap = await loadFixtureIds(oddspapiFixtureIds);
  if (!fixtureIdMap.size) {
    console.warn("⚠️ Aucun fixture en base pour insérer les cotes.");
    return;
  }

  await insertOddsForFixtures(selected, fixtureIdMap, {
    historicalOnly: options.historicalOnly,
    marketMetadata,
  });
}

function parseArgs(): CliOptions {
  const params = new URLSearchParams();
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value = ""] = arg.replace(/^--/, "").split("=");
      params.set(key, value || "true");
    } else if (!params.has("file")) {
      params.set("file", arg);
    }
  });

  const sportId = parseInt(params.get("sport") ?? "10", 10);
  const tournamentId = params.get("tournament") ? parseInt(params.get("tournament")!, 10) : undefined;
  const days = parseInt(params.get("days") ?? "3", 10);
  const limit = params.get("limit") ? parseInt(params.get("limit")!, 10) : undefined;
  const insert = params.get("insert") === "true" || params.get("insert") === "";
  const historicalOnly = params.get("historical") === "true";

  const from = params.get("from") ?? new Date().toISOString();
  const to =
    params.get("to") ?? addDays(new Date(from), days > 0 ? days : 3).toISOString();

  return { sportId, tournamentId, from, to, limit, insert, historicalOnly };
}

async function ensureLeague(
  tournament: { tournamentId: number; tournamentName: string; categorySlug: string },
  sportDbId: number
) {
  const { data, error } = await supabaseAdmin
    .from("leagues")
    .upsert(
      {
        oddspapi_id: tournament.tournamentId,
        name: tournament.tournamentName,
        slug: tournament.tournamentName.toLowerCase().replace(/\s+/g, "-"),
        country_id: await ensureCountry(tournament.categorySlug),
        sport_id: sportDbId,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureCountry(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("countries")
    .upsert(
      {
        oddspapi_slug: slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      },
      { onConflict: "oddspapi_slug" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

function createFallbackTournament(id: number) {
  return {
    tournamentId: id,
    tournamentName: `Tournament ${id}`,
    categorySlug: "international",
  };
}

async function ensureSport(oddspapiId: number) {
  const meta = getSportMeta(oddspapiId);
  const { data, error } = await supabaseAdmin
    .from("sports")
    .upsert(
      {
        oddspapi_id: oddspapiId,
        name: meta.name,
        slug: meta.slug,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

function getSportMeta(id: number) {
  switch (id) {
    case 10:
      return { name: "Football", slug: "football" };
    case 4:
      return { name: "Hockey", slug: "hockey" };
    case 2:
      return { name: "Tennis", slug: "tennis" };
    case 34:
      return { name: "Volleyball", slug: "volleyball" };
    default:
      return { name: `Sport ${id}`, slug: `sport-${id}` };
  }
}

async function ensureTeam(team: { id: number; name: string }) {
  const normalizedName = normalizeTeamName(team.name);
  const { data, error } = await supabaseAdmin
    .from("teams")
    .upsert(
      {
        oddspapi_id: team.id,
        name: normalizedName,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertFixture(params: {
  oddspapiId: string;
  sportDbId: number;
  leagueId: number;
  homeTeamId: number;
  awayTeamId: number;
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}) {
  const { error } = await supabaseAdmin
    .from("fixtures")
    .upsert(
      {
        oddspapi_id: params.oddspapiId,
        sport_id: params.sportDbId,
        league_id: params.leagueId,
        home_team_id: params.homeTeamId,
        away_team_id: params.awayTeamId,
        start_time: params.startTime,
        home_score: params.homeScore,
        away_score: params.awayScore,
        status: params.status,
      },
      { onConflict: "oddspapi_id" }
    );

  if (error) {
    throw error;
  }
}

async function loadFixtureIds(oddspapiIds: string[]) {
  const map = new Map<string, number>();
  if (!oddspapiIds.length) return map;

  const { data, error } = await supabaseAdmin
    .from("fixtures")
    .select("id, oddspapi_id")
    .in("oddspapi_id", oddspapiIds);

  if (error) {
    throw error;
  }

  data?.forEach((fixture) => {
    if (fixture.oddspapi_id) {
      map.set(fixture.oddspapi_id, fixture.id);
    }
  });

  return map;
}

async function insertOddsForFixtures(
  fixtures: { id: string; tournamentId: number }[],
  fixtureIdMap: Map<string, number>,
  options: { historicalOnly: boolean; marketMetadata: Map<number, MarketMetadataEntry> }
) {
  if (!fixtures.length) return;

  const tournamentIds = Array.from(new Set(fixtures.map((f) => f.tournamentId)));
  if (!tournamentIds.length) return;

  const marketCache = await ensureBaseMarkets();
  const chunks = chunkArray(tournamentIds, 10);

  if (!options.historicalOnly) {
    let usedFallback = false;
    try {
      await insertOddsFromTournamentOdds(fixtures, fixtureIdMap, marketCache, chunks);
      return;
    } catch (error) {
      console.warn("⚠️ Impossible de récupérer les cotes par tournoi. Bascule sur l'historique.", error);
      usedFallback = true;
    }

    await insertOddsFromHistorical(fixtures, fixtureIdMap, marketCache, options.marketMetadata);

    if (usedFallback) {
      console.warn("⚠️ Seule l'historique a été utilisée pour insérer les cotes.");
    }
    return;
  }

  console.log("ℹ️ Mode historique uniquement activé – récupération exclusive via /v4/historical-odds");
  await insertOddsFromHistorical(fixtures, fixtureIdMap, marketCache, options.marketMetadata);
}

async function insertOddsFromTournamentOdds(
  fixtures: { id: string; tournamentId: number }[],
  fixtureIdMap: Map<string, number>,
  marketCache: Record<string, MarketCache>,
  chunks: number[][]
) {
  for (const batch of chunks) {
    const oddsResponse = await oddsPapiClient.getOddsByTournaments(batch, {
      markets: "101,1025",
    });

    for (const record of oddsResponse) {
      const fixtureDbId = fixtureIdMap.get(record.fixtureId);
      if (!fixtureDbId) continue;

      const rows = [
        ...buildRowsFromMarkets(record.markets ?? [], marketCache, fixtureDbId),
        ...(await buildRowsFromBookmakerOdds(record.bookmakerOdds, marketCache, fixtureDbId)),
      ];
      if (!rows.length) continue;

      await persistOddsRows(fixtureDbId, rows);
      console.log(`   → ${rows.length} cotes insérées pour fixture ${record.fixtureId}`);
    }
  }
}

const HISTORICAL_COOLDOWN_MS = 5000;
let lastHistoricalFetch = 0;

async function insertOddsFromHistorical(
  fixtures: { id: string; tournamentId: number }[],
  fixtureIdMap: Map<string, number>,
  marketCache: Record<string, MarketCache>,
  marketMetadata: Map<number, MarketMetadataEntry>
) {
  for (const fixture of fixtures) {
    const fixtureDbId = fixtureIdMap.get(fixture.id);
    if (!fixtureDbId) continue;

    try {
      const history = await getHistoricalOddsWithCooldown(fixture.id);
      if (process.env.DEBUG_ODDSPAPI === "true") {
        console.log(`🔍 Historique OddsPapi pour fixture ${fixture.id}`);
        console.dir(history, { depth: null });
      }
      const rows = await buildRowsFromHistory(history, marketCache, fixtureDbId, marketMetadata);
      if (!rows.length) continue;

      await persistOddsRows(fixtureDbId, rows);
      console.log(`   → ${rows.length} cotes (historique) insérées pour fixture ${fixture.id}`);
    } catch (error) {
      console.error(`⚠️ Impossible de récupérer l'historique pour ${fixture.id}`, error);
    }
  }
}

async function getHistoricalOddsWithCooldown(fixtureId: string) {
  const now = Date.now();
  if (lastHistoricalFetch) {
    const elapsed = now - lastHistoricalFetch;
    if (elapsed < HISTORICAL_COOLDOWN_MS) {
      const wait = HISTORICAL_COOLDOWN_MS - elapsed;
      if (process.env.DEBUG_ODDSPAPI === "true") {
        console.log(`⏱️ Pause ${wait}ms pour respecter le cooldown historique`);
      }
      await sleep(wait);
    }
  }
  lastHistoricalFetch = Date.now();
  return oddsPapiClient.getHistoricalOdds(fixtureId);
}

function buildRowsFromMarkets(
  markets: OddsPapiMarketOdds[],
  marketCache: Record<string, MarketCache>,
  fixtureDbId: number
) {
  const rows: any[] = [];

  for (const market of markets) {
    if (market.marketId === 101 && marketCache["1X2"]) {
      const home = findOutcome(market.outcomes, ["HOME", "1"]);
      const draw = findOutcome(market.outcomes, ["DRAW", "X"]);
      const away = findOutcome(market.outcomes, ["AWAY", "2"]);
      if (home && draw && away) {
        rows.push(
          buildCurrentOdd(home, marketCache["1X2"], "1", fixtureDbId),
          buildCurrentOdd(draw, marketCache["1X2"], "X", fixtureDbId),
          buildCurrentOdd(away, marketCache["1X2"], "2", fixtureDbId)
        );
      }
    }

    if (market.marketId === 1025 && marketCache["OVER_UNDER_25"]) {
      const over = market.outcomes.find(
        (outcome) => matchesToken(outcome.outcomeName, "OVER") && isLineMatch(outcome.line, 2.5)
      );
      const under = market.outcomes.find(
        (outcome) => matchesToken(outcome.outcomeName, "UNDER") && isLineMatch(outcome.line, 2.5)
      );
      if (over && under) {
        rows.push(
          buildCurrentOdd(over, marketCache["OVER_UNDER_25"], "O25", fixtureDbId),
          buildCurrentOdd(under, marketCache["OVER_UNDER_25"], "U25", fixtureDbId)
        );
      }
    }
  }

  return rows.filter(Boolean);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buildRowsFromBookmakerOdds(
  bookmakerOdds: OddsPapiBookmakerOdds | undefined,
  marketCache: Record<string, MarketCache>,
  fixtureDbId: number
) {
  const pinnacle = bookmakerOdds?.pinnacle;
  if (!pinnacle?.markets) {
    return [];
  }

  const rows: any[] = [];
  const now = new Date().toISOString();

  const markets = Object.values(pinnacle.markets);

  for (const market of markets) {
    const type = detectMarketType(market.bookmakerMarketId);
    const period = detectPeriodFromMarketId(market.bookmakerMarketId);
    if (period !== 0) {
      continue;
    }

    if (type === "moneyline" && marketCache["1X2"]) {
      const prices = extractMoneylinePrices(market);
      if (prices) {
        const { home, draw, away } = prices;
        if (home !== null) {
          rows.push(
            buildCurrentOdd({ price: home, lastUpdated: now }, marketCache["1X2"], "1", fixtureDbId)
          );
        }
        if (draw !== null) {
          rows.push(
            buildCurrentOdd({ price: draw, lastUpdated: now }, marketCache["1X2"], "X", fixtureDbId)
          );
        }
        if (away !== null) {
          rows.push(
            buildCurrentOdd({ price: away, lastUpdated: now }, marketCache["1X2"], "2", fixtureDbId)
          );
        }
      }
    }

    if (type === "totals" && marketCache["OVER_UNDER_25"]) {
      const totals = extractTotalsLine(market, 2.5);
      if (totals) {
        if (totals.over !== null) {
          rows.push(
            buildCurrentOdd(
              { price: totals.over, lastUpdated: now },
              marketCache["OVER_UNDER_25"],
              "O25",
              fixtureDbId
            )
          );
        }
        if (totals.under !== null) {
          rows.push(
            buildCurrentOdd(
              { price: totals.under, lastUpdated: now },
              marketCache["OVER_UNDER_25"],
              "U25",
              fixtureDbId
            )
          );
        }
      }
    }

    if (type === "spreads") {
      const spread = extractSpreadLine(market);
      if (spread) {
        rows.push(
          ...(await buildAsianHandicapRows(spread, marketCache, fixtureDbId, now))
        );
      }
    }
  }

  return rows.filter(Boolean);
}

async function buildRowsFromHistory(
  history: OddsPapiHistoricalOddsResponse | null,
  marketCache: Record<string, MarketCache>,
  fixtureDbId: number,
  marketMetadata: Map<number, MarketMetadataEntry>
) {
  const pinnacleMarkets = history?.bookmakers?.pinnacle?.markets;
  if (!pinnacleMarkets) {
    return [];
  }

  const rows: any[] = [];

  for (const [marketIdStr, market] of Object.entries(pinnacleMarkets)) {
    const marketId = Number(marketIdStr);
    const metadata = marketMetadata.get(marketId);
    if (!metadata) {
      continue;
    }

    const outcomes = market.outcomes ?? {};
    for (const [outcomeIdStr, outcome] of Object.entries(outcomes)) {
      const outcomeId = Number(outcomeIdStr);
      const pricePoints = outcome.players?.["0"];
      if (!Array.isArray(pricePoints) || !pricePoints.length) {
        continue;
      }

      const summary = summarizePriceHistory(pricePoints);
      if (!summary) {
        continue;
      }

      if (metadata.type === "1X2" && marketCache["1X2"]) {
        const key = normalizeOneXTwoOutcome(metadata.outcomes[outcomeId]);
        if (!key || !marketCache["1X2"].outcomes[key]) {
          continue;
        }
        const row = buildHistoricalOddFromSummary(summary, marketCache["1X2"], key, fixtureDbId);
        if (row) {
          rows.push(row);
        }
      } else if (
        metadata.type === "TOTALS" &&
        marketCache["OVER_UNDER_25"] &&
        isLineMatch(metadata.handicap, 2.5)
      ) {
        const key = normalizeTotalsOutcome(metadata.outcomes[outcomeId]);
        if (!key) {
          continue;
        }
        const row = buildHistoricalOddFromSummary(
          summary,
          marketCache["OVER_UNDER_25"],
          key,
          fixtureDbId
        );
        if (row) {
          rows.push(row);
        }
      } else if (metadata.type === "SPREAD" && typeof metadata.handicap === "number") {
        const key = normalizeSpreadOutcome(metadata.outcomes[outcomeId]);
        if (!key) {
          continue;
        }
        const marketEntry = await ensureAsianHandicapMarket(metadata.handicap, marketCache);
        const row = buildHistoricalOddFromSummary(summary, marketEntry, key, fixtureDbId);
        if (row) {
          rows.push(row);
        }
      }
    }
  }

  return rows.filter(Boolean);
}

async function persistOddsRows(fixtureDbId: number, rows: any[]) {
  await supabaseAdmin.from("odds").delete().eq("fixture_id", fixtureDbId);
  const { error } = await supabaseAdmin.from("odds").insert(rows);
  if (error) {
    throw error;
  }
}

type MarketCache = {
  marketId: number;
  outcomes: Record<string, number>;
};

type MarketMetadataEntry = {
  type: "1X2" | "TOTALS" | "SPREAD";
  handicap?: number;
  outcomes: Record<number, string>;
};

const marketMetadataCache = new Map<number, Map<number, MarketMetadataEntry>>();

async function ensureBaseMarkets(): Promise<Record<string, MarketCache>> {
  const cache: Record<string, MarketCache> = {};

  for (const definition of Object.values(BASE_MARKETS)) {
    const { data: market, error: marketError } = await supabaseAdmin
      .from("markets")
      .upsert(
        {
          oddspapi_id: definition.oddspapiId,
          name: definition.name,
          description: definition.description ?? null,
        },
        { onConflict: "oddspapi_id" }
      )
      .select("id")
      .single();

    if (marketError) throw marketError;

    const outcomes: Record<string, number> = {};
    for (const outcomeDef of definition.outcomes) {
      const { data: outcome, error: outcomeError } = await supabaseAdmin
        .from("outcomes")
        .upsert(
          {
            oddspapi_id: outcomeDef.oddspapiId,
            market_id: market.id,
            name: outcomeDef.name,
            description: outcomeDef.description ?? null,
          },
          { onConflict: "oddspapi_id" }
        )
        .select("id")
        .single();

      if (outcomeError) throw outcomeError;
      outcomes[outcomeDef.key] = outcome.id;
    }

    cache[definition.key] = { marketId: market.id, outcomes };
  }

  return cache;
}

async function loadMarketMetadata(sportId: number) {
  if (marketMetadataCache.has(sportId)) {
    return marketMetadataCache.get(sportId)!;
  }

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });
  const map = new Map<number, MarketMetadataEntry>();

  definitions
    .filter((definition) => definition.sportId === sportId && definition.period === "fulltime")
    .forEach((definition) => {
      const normalized = normalizeMarketDefinition(definition);
      if (normalized) {
        map.set(definition.marketId, normalized);
      }
    });

  marketMetadataCache.set(sportId, map);
  return map;
}

function normalizeMarketDefinition(definition: OddsPapiMarketDefinition): MarketMetadataEntry | null {
  const outcomeMap: Record<number, string> = {};
  definition.outcomes?.forEach((outcome) => {
    outcomeMap[outcome.outcomeId] = outcome.outcomeName;
  });

  const marketType = definition.marketType?.toLowerCase();
  if (marketType === "1x2") {
    return { type: "1X2", outcomes: outcomeMap };
  }

  if (marketType === "totals") {
    return { type: "TOTALS", handicap: definition.handicap, outcomes: outcomeMap };
  }

  if (marketType === "spreads") {
    return { type: "SPREAD", handicap: definition.handicap, outcomes: outcomeMap };
  }

  return null;
}

function buildCurrentOdd(
  outcome: { price: number; lastUpdated?: string },
  market: MarketCache,
  outcomeKey: string,
  fixtureId: number
) {
  if (typeof outcome.price !== "number" || Number.isNaN(outcome.price)) {
    return null;
  }
  const timestamp = outcome.lastUpdated ?? new Date().toISOString();
  return {
    fixture_id: fixtureId,
    market_id: market.marketId,
    outcome_id: market.outcomes[outcomeKey],
    opening_price: outcome.price,
    closing_price: null,
    opening_timestamp: timestamp,
    closing_timestamp: null,
    is_winner: null,
  };
}

type PriceSummary = {
  opening?: OddsPapiHistoricalPricePoint;
  closing?: OddsPapiHistoricalPricePoint;
};

function buildHistoricalOddFromSummary(
  summary: PriceSummary,
  market: MarketCache,
  outcomeKey: string,
  fixtureId: number
) {
  const openingPrice = summary.opening?.price ?? null;
  const closingPrice = summary.closing?.price ?? null;
  if (openingPrice === null && closingPrice === null) {
    return null;
  }

  return {
    fixture_id: fixtureId,
    market_id: market.marketId,
    outcome_id: market.outcomes[outcomeKey],
    opening_price: openingPrice,
    closing_price: closingPrice,
    opening_timestamp: summary.opening?.createdAt ?? null,
    closing_timestamp: summary.closing?.createdAt ?? null,
    is_winner: null,
  };
}

function summarizePriceHistory(history: OddsPapiHistoricalPricePoint[]): PriceSummary | null {
  const valid = history.filter(
    (entry) => typeof entry.price === "number" && !Number.isNaN(entry.price)
  );
  if (!valid.length) {
    return null;
  }

  const sortedAscending = [...valid].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const sortedDescending = [...valid].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const closing =
    sortedDescending.find((entry) => entry.active) ?? sortedDescending[sortedDescending.length - 1];

  return {
    opening: sortedAscending[0],
    closing,
  };
}

function matchesToken(value: string | undefined, token: string) {
  if (!value) return false;
  return value.replace(/[^\w]/g, "").toUpperCase().includes(token.toUpperCase());
}

function isLineMatch(line: number | undefined, target: number) {
  if (typeof line !== "number") return false;
  return Math.abs(line - target) < 0.01;
}

function normalizeOneXTwoOutcome(name?: string) {
  if (!name) return null;
  const normalized = name.trim().toUpperCase();
  if (normalized === "1" || normalized.includes("HOME")) {
    return "1";
  }
  if (normalized === "X" || normalized.includes("DRAW")) {
    return "X";
  }
  if (normalized === "2" || normalized.includes("AWAY")) {
    return "2";
  }
  return null;
}

function normalizeTotalsOutcome(name?: string) {
  if (!name) return null;
  const normalized = name.trim().toUpperCase();
  if (normalized.startsWith("OVER")) {
    return "O25";
  }
  if (normalized.startsWith("UNDER")) {
    return "U25";
  }
  return null;
}

function normalizeSpreadOutcome(name?: string) {
  if (!name) return null;
  const normalized = name.trim().toUpperCase();
  if (normalized === "1" || normalized.includes("HOME")) {
    return "HOME";
  }
  if (normalized === "2" || normalized.includes("AWAY")) {
    return "AWAY";
  }
  return null;
}

function findOutcome(outcomes: { outcomeName: string; price: number }[], tokens: string[]) {
  return outcomes.find((outcome) =>
    tokens.some((token) => matchesToken(outcome.outcomeName, token))
  );
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

type RawFixture = {
  id?: string;
  fixtureId?: string;
  homeTeam?: { id: number; name: string };
  awayTeam?: { id: number; name: string };
  participant1Id?: number;
  participant1Name?: string;
  participant2Id?: number;
  participant2Name?: string;
  [key: string]: any;
};

function normalizeFixtures(fixtures: RawFixture[]) {
  return fixtures.map((fixture) => {
    const normalized: RawFixture = { ...fixture };
    normalized.id = normalized.id ?? normalized.fixtureId;
    if (!normalized.homeTeam && normalized.participant1Id) {
      normalized.homeTeam = {
        id: normalized.participant1Id,
        name: normalized.participant1Name || `Team ${normalized.participant1Id}`,
      };
    }
    if (!normalized.awayTeam && normalized.participant2Id) {
      normalized.awayTeam = {
        id: normalized.participant2Id,
        name: normalized.participant2Name || `Team ${normalized.participant2Id}`,
      };
    }
    return normalized as Required<Pick<RawFixture, "id">> & RawFixture;
  });
}

function detectMarketType(bookmakerMarketId?: string) {
  if (!bookmakerMarketId) return "unknown";
  if (bookmakerMarketId.includes("moneyline")) return "moneyline";
  if (bookmakerMarketId.includes("totals")) return "totals";
  if (bookmakerMarketId.includes("spreads")) return "spreads";
  return "unknown";
}

function detectPeriodFromMarketId(bookmakerMarketId?: string) {
  if (!bookmakerMarketId) return 0;
  const parts = bookmakerMarketId.split("/");
  if (parts.length < 2) return 0;
  const candidate = Number(parts[parts.length - 2]);
  return Number.isFinite(candidate) ? candidate : 0;
}

function extractMoneylinePrices(market: OddsPapiBookmakerMarket) {
  const result = { home: null as number | null, draw: null as number | null, away: null as number | null };
  const outcomes = Object.values(market.outcomes ?? {});
  for (const outcome of outcomes) {
    const players = (outcome as any).players ?? {};
    const player = players["0"];
    if (!player || typeof player.price !== "number") continue;
    const id = String(player.bookmakerOutcomeId ?? "").toLowerCase();
    if (id.includes("home")) {
      result.home = player.price;
    } else if (id.includes("away")) {
      result.away = player.price;
    } else if (id.includes("draw")) {
      result.draw = player.price;
    }
  }
  if (result.home === null && result.away === null && result.draw === null) {
    return null;
  }
  return result;
}

function parseOutcomeIdentifier(value?: string) {
  if (!value) return { line: undefined as number | undefined, side: undefined as string | undefined };
  const normalized = value.toLowerCase();
  if (!normalized.includes("/")) {
    return { line: undefined, side: normalized };
  }
  const [lineStr, side] = normalized.split("/");
  const line = parseFloat(lineStr);
  return { line: Number.isNaN(line) ? undefined : line, side };
}

function extractTotalsLine(market: OddsPapiBookmakerMarket, targetLine: number) {
  let over: number | null = null;
  let under: number | null = null;
  const outcomes = Object.values(market.outcomes ?? {});
  for (const outcome of outcomes) {
    const player = (outcome as any).players?.["0"];
    if (!player || typeof player.price !== "number") continue;
    const meta = parseOutcomeIdentifier(player.bookmakerOutcomeId);
    const line = (meta.line ?? player.line) as number | undefined;
    if (typeof line !== "number" || Math.abs(line - targetLine) > 0.01) continue;
    if (meta.side === "over") {
      over = player.price;
    } else if (meta.side === "under") {
      under = player.price;
    }
  }
  if (over === null && under === null) {
    return null;
  }
  return { line: targetLine, over, under };
}

function extractSpreadLine(market: OddsPapiBookmakerMarket) {
  let recordedLine: number | null = null;
  let home: number | null = null;
  let away: number | null = null;

  const outcomes = Object.values(market.outcomes ?? {});
  for (const outcome of outcomes) {
    const player = (outcome as any).players?.["0"];
    if (!player || typeof player.price !== "number") continue;
    const meta = parseOutcomeIdentifier(player.bookmakerOutcomeId);
    const line = (meta.line ?? player.handicap) as number | undefined;
    if (typeof line !== "number") continue;
    if (recordedLine === null) {
      recordedLine = line;
    }
    if (Math.abs(line - recordedLine) > 0.01) {
      continue;
    }
    if (meta.side === "home") {
      home = player.price;
    } else if (meta.side === "away") {
      away = player.price;
    }
  }

  if (recordedLine === null || (home === null && away === null)) {
    return null;
  }

  return { line: recordedLine, home, away };
}

async function buildAsianHandicapRows(
  spread: { line: number; home: number | null; away: number | null },
  marketCache: Record<string, MarketCache>,
  fixtureDbId: number,
  timestamp: string
) {
  const market = await ensureAsianHandicapMarket(spread.line, marketCache);
  const rows: any[] = [];

  if (spread.home !== null) {
    rows.push(
      buildCurrentOdd(
        { price: spread.home, lastUpdated: timestamp },
        market,
        "HOME",
        fixtureDbId
      )
    );
  }
  if (spread.away !== null) {
    rows.push(
      buildCurrentOdd(
        { price: spread.away, lastUpdated: timestamp },
        market,
        "AWAY",
        fixtureDbId
      )
    );
  }

  return rows.filter(Boolean);
}

async function ensureAsianHandicapMarket(
  line: number,
  cache: Record<string, MarketCache>
): Promise<MarketCache> {
  const normalizedLine = normalizeHandicapLine(line);
  const key = `AH_${normalizedLine}`;
  if (cache[key]) {
    return cache[key];
  }

  const marketOddspapiId = pseudoIdFromString(`ah-market-${normalizedLine}`);
  const { data: market, error: marketError } = await supabaseAdmin
    .from("markets")
    .upsert(
      {
        oddspapi_id: marketOddspapiId,
        name: `Asian Handicap ${normalizedLine}`,
        description: `AH ${normalizedLine}`,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (marketError) throw marketError;

  const homeOddspapiId = pseudoIdFromString(`ah-home-${normalizedLine}`);
  const awayOddspapiId = pseudoIdFromString(`ah-away-${normalizedLine}`);

  const [{ data: homeOutcome, error: homeError }, { data: awayOutcome, error: awayError }] =
    await Promise.all([
      supabaseAdmin
        .from("outcomes")
        .upsert(
          {
            oddspapi_id: homeOddspapiId,
            market_id: market.id,
            name: `Home ${normalizedLine}`,
          },
          { onConflict: "oddspapi_id" }
        )
        .select("id")
        .single(),
      supabaseAdmin
        .from("outcomes")
        .upsert(
          {
            oddspapi_id: awayOddspapiId,
            market_id: market.id,
            name: `Away ${normalizedLine}`,
          },
          { onConflict: "oddspapi_id" }
        )
        .select("id")
        .single(),
    ]);

  if (homeError || awayError || !homeOutcome || !awayOutcome) {
    throw homeError ?? awayError;
  }

  const entry: MarketCache = {
    marketId: market.id,
    outcomes: {
      HOME: homeOutcome.id,
      AWAY: awayOutcome.id,
    },
  };

  cache[key] = entry;
  return entry;
}

function normalizeHandicapLine(value: number) {
  const formatted = Number(value.toFixed(2));
  return formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toString();
}

function pseudoIdFromString(value: string) {
  return value
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

run().catch((error) => {
  console.error("💥 Échec du fetch OddsPapi", error);
  process.exit(1);
});
