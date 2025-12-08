import { addDays, subDays } from "date-fns";

import { oddsPapiClient } from "@/lib/api/oddspapi";
import type {
  OddsPapiFixture,
  OddsPapiHistoricalOddsResponse,
  OddsPapiHistoricalPricePoint,
  OddsPapiMarketDefinition,
  OddsPapiSettlement,
  OddsPapiTournamentOdds,
} from "@/lib/api/types";
import { BASE_MARKETS, normalizeTeamName } from "@/lib/import/catalog";
import { supabaseAdmin } from "@/lib/db";
const adminDb = supabaseAdmin as any;
import { loadFollowedTournaments } from "@/lib/settings/followed-tournaments";
import type { FollowedTournamentsMap } from "@/lib/config/tournaments";
import { loadClosingStrategy } from "@/lib/settings/closing-strategy";
import { loadOddsApiKey } from "@/lib/settings/odds-api-key";
import type { OddsClosingStrategy } from "@/types/settings";

interface AutoSyncStats {
  fixturesCreated: number;
  openingsSynced: number;
  fixturesFinalized: number;
  closingsSynced: number;
  settlementsApplied: number;
  errors: string[];
}

type NormalizedFixture = {
  id: string;
  tournamentId: number;
  startTime: string;
  status?: string;
  homeTeam: NormalizedTeam;
  awayTeam: NormalizedTeam;
};

type NormalizedTeam = {
  id: number;
  name: string;
};

type FixtureRecord = {
  oddspapiId: string;
  dbId: number;
  tournamentId?: number;
};

type MarketCache = {
  marketId: number;
  outcomes: Record<string, number>;
};

type MarketMetadataEntry = {
  type: "1X2" | "TOTALS" | "SPREAD";
  handicap?: number;
  outcomes: Record<number, string>;
};

const HISTORICAL_COOLDOWN_MS = 5000;

type SyncOptions = {
  sportIds?: number[];
  closingStrategy?: OddsClosingStrategy;
};

export class AutoSyncService {
  private sportCache = new Map<number, number>();
  private tournamentCache = new Map<number, Map<number, TournamentMeta>>();
  private marketMetadataCache = new Map<number, Map<number, MarketMetadataEntry>>();
  private baseMarketCache: Record<string, MarketCache> | null = null;
  private lastHistoricalFetch = 0;
  private db = adminDb;

  async sync(options?: SyncOptions): Promise<AutoSyncStats> {
    const stats: AutoSyncStats = {
      fixturesCreated: 0,
      openingsSynced: 0,
      fixturesFinalized: 0,
      closingsSynced: 0,
      settlementsApplied: 0,
      errors: [],
    };

    const oddsApiKey = await loadOddsApiKey();
    oddsPapiClient.setApiKey(oddsApiKey);

    const closingStrategy =
      options?.closingStrategy ?? (await loadClosingStrategy());
    const tournaments = await loadFollowedTournaments();
    console.log("[AutoSync] Followed tournaments", tournaments);
    await this.syncUpcomingFixtures(tournaments, stats, options);
    await this.finalizeCompletedFixtures(tournaments, stats, closingStrategy, options);

    await this.updateLastSync();

    return stats;
  }

  private async syncUpcomingFixtures(
    followed: FollowedTournamentsMap,
    stats: AutoSyncStats,
    options?: SyncOptions
  ) {
    const now = new Date();
    const from = now.toISOString();
    const to = addDays(now, 7).toISOString();
    const allowedSports = options?.sportIds ? new Set(options.sportIds) : null;

    for (const [sportIdStr, tournamentIds] of Object.entries(followed)) {
      const sportId = Number(sportIdStr);
      if (allowedSports && !allowedSports.has(sportId)) continue;
      if (!tournamentIds?.length) continue;

      const sportDbId = await this.ensureSportRecord(sportId);
      const leagueMeta = await this.loadTournamentMetadata(sportId);

      for (const tournamentId of tournamentIds) {
        try {
          const rawFixtures = await oddsPapiClient.getFixtures({
            sportId,
            tournamentId,
            from,
            to,
          });
          console.log(
            `[AutoSync] Sport ${sportId} • Tournoi ${tournamentId} • Fixtures API: ${rawFixtures.length}`
          );

          const normalized = normalizeFixtures(rawFixtures).filter(
            (fixture) => fixture.tournamentId === tournamentId
          );
          console.log(
            `[AutoSync] Sport ${sportId} • Tournoi ${tournamentId} • Fixtures conservés: ${normalized.length}`
          );
          if (!normalized.length) continue;

          const entries = await this.insertNewFixtures(normalized, sportDbId, leagueMeta);
          console.log(
            `[AutoSync] Sport ${sportId} • Tournoi ${tournamentId} • Nouvelles entrées: ${entries.length}`
          );
          if (!entries.length) continue;
          stats.fixturesCreated += entries.length;

          const marketCache = await this.ensureBaseMarkets();
          const marketMetadata = await this.loadMarketMetadata(sportId);
          await this.syncHistoricalOdds(entries, marketCache, marketMetadata, stats, sportId);
        } catch (error) {
          stats.errors.push(
            `Tournoi ${tournamentId} (sport ${sportId}): ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }
  }

  private async finalizeCompletedFixtures(
    followed: FollowedTournamentsMap,
    stats: AutoSyncStats,
    closingStrategy: OddsClosingStrategy,
    options?: SyncOptions
  ) {
    const fromDate = subDays(new Date(), 3).toISOString();
    const toDate = new Date().toISOString();
    const allowedSports = options?.sportIds ? new Set(options.sportIds) : null;

    for (const sportIdStr of Object.keys(followed)) {
      const sportId = Number(sportIdStr);
      if (allowedSports && !allowedSports.has(sportId)) continue;
      const sportDbId = await this.ensureSportRecord(sportId);

      const { data: fixtures, error } = await this.db
        .from("fixtures")
        .select("id, oddspapi_id, start_time, league_id")
        .is("odds_locked_at", null)
        .eq("sport_id", sportDbId)
        .lte("start_time", toDate);

      if (error || !fixtures?.length) {
        console.log(
          `[AutoSync] Sport ${sportId} • Aucun fixture à finaliser (erreur=${Boolean(error)})`
        );
        continue;
      }

      const fixtureRows = fixtures as Array<{
        id: number;
        oddspapi_id: string | null;
        start_time: string;
        league_id: number | null;
      }>;

      const leagueIds = Array.from(
        new Set(
          fixtureRows
            .map((fixture) => fixture.league_id)
            .filter((value): value is number => typeof value === "number")
        )
      );
      const leagueMap = new Map<number, number>();
      if (leagueIds.length) {
        const { data: leagues } = await this.db
          .from("leagues")
          .select("id, oddspapi_id")
          .in("id", leagueIds);
        const leagueRows = leagues as Array<{ id: number; oddspapi_id: number | null }> | null;
        leagueRows?.forEach((league) => {
          if (typeof league.oddspapi_id === "number") {
            leagueMap.set(league.id, league.oddspapi_id);
          }
        });
      }

      const settlementList = await oddsPapiClient.getSettlements({
        sportId,
        from: fromDate,
        to: toDate,
      });
      console.log(
        `[AutoSync] Sport ${sportId} • Settlements reçus: ${settlementList.length}`
      );

      const settlementMap = new Map<string, OddsPapiSettlement>();
      settlementList.forEach((settlement) => {
        if (settlement.fixtureId) {
          settlementMap.set(settlement.fixtureId, settlement);
        }
      });

      const closings: FixtureRecord[] = [];

      for (const fixture of fixtureRows) {
        const fixtureKey = fixture.oddspapi_id ?? undefined;
        if (!fixtureKey) continue;
        const settlement = settlementMap.get(fixtureKey);
        if (!settlement) {
          continue;
        }

        closings.push({
          oddspapiId: fixtureKey,
          dbId: fixture.id,
          tournamentId: fixture.league_id ? leagueMap.get(fixture.league_id) : undefined,
        });

        await this.db
          .from("fixtures")
          .update({
            home_score: settlement.homeScore ?? null,
            away_score: settlement.awayScore ?? null,
            status: settlement.status ?? "completed",
            odds_locked_at: new Date().toISOString(),
          })
          .eq("id", fixture.id);

        stats.fixturesFinalized += 1;
        stats.settlementsApplied += 1;
      }

      if (!closings.length) {
        continue;
      }

      const marketCache = await this.ensureBaseMarkets();
      const marketMetadata = await this.loadMarketMetadata(sportId);
      if (closingStrategy === "tournament") {
        const closingsWithTournament = closings.filter((entry) => entry.tournamentId);
        const fallbackClosings = closings.filter((entry) => !entry.tournamentId);

        if (closingsWithTournament.length) {
          await this.syncTournamentClosings(
            closingsWithTournament,
            marketCache,
            marketMetadata,
            stats,
            sportId
          );
        }
        if (fallbackClosings.length) {
          await this.syncHistoricalOdds(
            fallbackClosings,
            marketCache,
            marketMetadata,
            stats,
            sportId,
            true
          );
        }
      } else {
        await this.syncHistoricalOdds(
          closings,
          marketCache,
          marketMetadata,
          stats,
          sportId,
          true
        );
      }
    }
  }

  private async insertNewFixtures(
    fixtures: NormalizedFixture[],
    sportDbId: number,
    tournamentMeta: Map<number, TournamentMeta>
  ): Promise<FixtureRecord[]> {
    const records: FixtureRecord[] = [];
    const ids = fixtures.map((fixture) => fixture.id);
    const { data: existing } = await this.db
      .from("fixtures")
      .select("oddspapi_id, id")
      .in("oddspapi_id", ids);

    const existingRows = (existing ?? []) as Array<{ oddspapi_id: string; id: number }>;
    const existingSet = new Map<string, number>(
      existingRows.map((row) => [row.oddspapi_id, row.id])
    );

    for (const fixture of fixtures) {
      if (existingSet.has(fixture.id)) {
        continue;
      }

      const meta =
        tournamentMeta.get(fixture.tournamentId) ?? {
          id: fixture.tournamentId,
          name: `Tournoi ${fixture.tournamentId}`,
          countrySlug: "international",
        };
      const leagueId = await ensureLeague(meta, sportDbId);
      const homeTeamId = await ensureTeam(fixture.homeTeam);
      const awayTeamId = await ensureTeam(fixture.awayTeam);

      const { data, error } = await this.db
        .from("fixtures")
        .insert({
          oddspapi_id: fixture.id,
          sport_id: sportDbId,
          league_id: leagueId,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          start_time: fixture.startTime,
          status: fixture.status ?? "scheduled",
          home_score: null,
          away_score: null,
        })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Insertion fixture impossible");
      }

      records.push({
        oddspapiId: fixture.id,
        dbId: data.id,
        tournamentId: fixture.tournamentId,
      });
    }

    return records;
  }

  private async syncHistoricalOdds(
    entries: FixtureRecord[],
    marketCache: Record<string, MarketCache>,
    marketMetadata: Map<number, MarketMetadataEntry>,
    stats: AutoSyncStats,
    sportId: number,
    isClosing = false
  ) {
    for (const entry of entries) {
      try {
        const history = await this.getHistoricalOddsWithCooldown(entry.oddspapiId);
        const rows = await buildRowsFromHistory(history, marketCache, entry.dbId, marketMetadata);
        console.log(
          `[AutoSync] Fixture ${entry.oddspapiId} • Rows historiques: ${rows.length}`
        );
        if (!rows.length) continue;

        await persistOddsRows(entry.dbId, rows);
        if (isClosing) {
          stats.closingsSynced += 1;
        } else {
          stats.openingsSynced += 1;
        }
      } catch (error) {
        stats.errors.push(
          `Fixture ${entry.oddspapiId} (sport ${sportId}): ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  private async syncTournamentClosings(
    entries: FixtureRecord[],
    marketCache: Record<string, MarketCache>,
    marketMetadata: Map<number, MarketMetadataEntry>,
    stats: AutoSyncStats,
    sportId: number
  ) {
    if (!entries.length) {
      return;
    }

    const fixtureIds = entries.map((entry) => entry.dbId);
    const { data: existingRows } = await this.db
      .from("odds")
      .select(
        "fixture_id, market_id, outcome_id, opening_price, opening_timestamp, closing_price, closing_timestamp, is_winner"
      )
      .in("fixture_id", fixtureIds);

    const existingMap = new Map<number, any[]>();
    const oddsRows =
      (existingRows ?? []) as Array<{
        fixture_id: number;
        market_id: number;
        outcome_id: number;
        opening_price: number | null;
        opening_timestamp: string | null;
        closing_price: number | null;
        closing_timestamp: string | null;
        is_winner: boolean | null;
      }>;
    oddsRows.forEach((row) => {
      const bucket = existingMap.get(row.fixture_id) ?? [];
      bucket.push(row);
      existingMap.set(row.fixture_id, bucket);
    });

    const tournamentIds = Array.from(
      new Set(
        entries
          .map((entry) => entry.tournamentId)
          .filter((value): value is number => typeof value === "number")
      )
    );
    if (!tournamentIds.length) {
      return;
    }

    const BATCH_SIZE = 8;
    for (let i = 0; i < tournamentIds.length; i += BATCH_SIZE) {
      const batch = tournamentIds.slice(i, i + BATCH_SIZE);
      try {
        const oddsList = await oddsPapiClient.getOddsByTournaments(batch);
        const oddsByFixture = new Map<string, OddsPapiTournamentOdds>();
        oddsList.forEach((item) => oddsByFixture.set(item.fixtureId, item));

        const batchEntries = entries.filter(
          (entry) => entry.tournamentId && batch.includes(entry.tournamentId)
        );

        for (const entry of batchEntries) {
          const odds = oddsByFixture.get(entry.oddspapiId);
          if (!odds) continue;
          const existing = existingMap.get(entry.dbId) ?? [];
          const rows = await buildRowsFromTournamentOdds(
            odds,
            entry.dbId,
            existing,
            marketCache,
            marketMetadata
          );
          if (!rows.length) continue;
          await persistOddsRows(entry.dbId, rows);
          stats.closingsSynced += 1;
        }
      } catch (error) {
        stats.errors.push(
          `Tournoi ${batch.join(",")} (sport ${sportId}) - clôture par tournoi: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  private async ensureSportRecord(sportId: number) {
    if (this.sportCache.has(sportId)) {
      return this.sportCache.get(sportId)!;
    }

    const { data, error } = await this.db
      .from("sports")
      .select("id")
      .eq("oddspapi_id", sportId)
      .single();

    if (error || !data) {
      throw new Error(`Sport inconnu en base (oddspapi_id=${sportId})`);
    }

    this.sportCache.set(sportId, data.id);
    return data.id;
  }

  private async loadTournamentMetadata(sportId: number) {
    if (this.tournamentCache.has(sportId)) {
      return this.tournamentCache.get(sportId)!;
    }

    const tournaments = await oddsPapiClient.getTournaments(sportId);
    const map = new Map<number, TournamentMeta>();
    tournaments.forEach((tournament) => {
      map.set(tournament.tournamentId, {
        id: tournament.tournamentId,
        name: tournament.tournamentName,
        countrySlug: tournament.categorySlug ?? "international",
      });
    });

    this.tournamentCache.set(sportId, map);
    return map;
  }

  private async ensureBaseMarkets() {
    if (this.baseMarketCache) {
      return this.baseMarketCache;
    }

    const cache: Record<string, MarketCache> = {};

    for (const definition of Object.values(BASE_MARKETS)) {
      const { data: market, error: marketError } = await this.db
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

      if (marketError || !market) {
        throw marketError ?? new Error("Insertion marché impossible");
      }

      const outcomes: Record<string, number> = {};
      for (const outcomeDef of definition.outcomes) {
        const { data: outcome, error: outcomeError } = await this.db
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

        if (outcomeError || !outcome) {
          throw outcomeError ?? new Error("Insertion outcome impossible");
        }
        outcomes[outcomeDef.key] = outcome.id;
      }

      cache[definition.key] = { marketId: market.id, outcomes };
    }

    this.baseMarketCache = cache;
    return cache;
  }

  private async loadMarketMetadata(sportId: number) {
    if (this.marketMetadataCache.has(sportId)) {
      return this.marketMetadataCache.get(sportId)!;
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
    console.log(
      `[AutoSync] Market metadata sport ${sportId}: ${map.size} entrées`
    );

    this.marketMetadataCache.set(sportId, map);
    return map;
  }

  private async updateLastSync() {
    await this.db
      .from("settings")
      .upsert(
        [
          {
            key: "last_sync",
            value: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "key" }
      );
  }

  private async getHistoricalOddsWithCooldown(fixtureId: string) {
    const now = Date.now();
    if (this.lastHistoricalFetch) {
      const elapsed = now - this.lastHistoricalFetch;
      if (elapsed < HISTORICAL_COOLDOWN_MS) {
        await new Promise((resolve) => setTimeout(resolve, HISTORICAL_COOLDOWN_MS - elapsed));
      }
    }
    this.lastHistoricalFetch = Date.now();
    return oddsPapiClient.getHistoricalOdds(fixtureId);
  }
}

type TournamentMeta = {
  id: number;
  name: string;
  countrySlug: string;
};

export const autoSyncService = new AutoSyncService();

function normalizeFixtures(fixtures: OddsPapiFixture[]): NormalizedFixture[] {
  return fixtures
    .map((fixture) => {
      const raw: any = fixture;
      const identifier: string | undefined = raw.id || raw.fixtureId;
      const home = raw.homeTeam || (raw.participant1Id
        ? { id: raw.participant1Id, name: raw.participant1Name }
        : undefined);
      const away = raw.awayTeam || (raw.participant2Id
        ? { id: raw.participant2Id, name: raw.participant2Name }
        : undefined);

      const homeName = normalizeTeamName(home?.name ?? "");
      const awayName = normalizeTeamName(away?.name ?? "");

      if (!identifier || !home?.id || !away?.id || !homeName || !awayName) {
        return null;
      }

      return {
        id: identifier,
        tournamentId: Number(raw.tournamentId),
        startTime: raw.startTime,
        status: raw.status,
        homeTeam: {
          id: home.id,
          name: homeName,
        },
        awayTeam: {
          id: away.id,
          name: awayName,
        },
      } as NormalizedFixture;
    })
    .filter((fixture): fixture is NormalizedFixture => Boolean(fixture));
}

async function ensureLeague(meta: TournamentMeta | undefined, sportDbId: number) {
  const fallbackSlug = meta?.name?.toLowerCase().replace(/\s+/g, "-") ?? `league-${meta?.id ?? "na"}`;
  const countryId = await ensureCountry(meta?.countrySlug ?? "international");

  const { data, error } = await adminDb
    .from("leagues")
    .upsert(
      {
        oddspapi_id: meta?.id ?? -1,
        name: meta?.name ?? "Tournoi inconnu",
        slug: fallbackSlug,
        country_id: countryId,
        sport_id: sportDbId,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Impossible d'insérer la ligue");
  }

  return data.id;
}

async function ensureCountry(slug: string) {
  const { data, error } = await adminDb
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

  if (error || !data) {
    throw error ?? new Error("Impossible d'insérer le pays");
  }

  return data.id;
}

async function ensureTeam(team: NormalizedTeam) {
  const { data, error } = await adminDb
    .from("teams")
    .upsert(
      {
        oddspapi_id: team.id,
        name: team.name,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Impossible d'insérer l'équipe");
  }

  return data.id;
}

async function persistOddsRows(fixtureDbId: number, rows: any[]) {
  await adminDb.from("odds").delete().eq("fixture_id", fixtureDbId);
  if (!rows.length) return;
  const { error } = await adminDb.from("odds").insert(rows);
  if (error) {
    throw error;
  }
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
      if (!summary) continue;

      if (metadata.type === "1X2" && marketCache["1X2"]) {
        const key = normalizeOneXTwoOutcome(metadata.outcomes[outcomeId]);
        if (!key || !marketCache["1X2"].outcomes[key]) continue;
        const row = buildHistoricalOddFromSummary(summary, marketCache["1X2"], key, fixtureDbId);
        if (row) rows.push(row);
      } else if (
        metadata.type === "TOTALS" &&
        marketCache["OVER_UNDER_25"] &&
        isLineMatch(metadata.handicap, 2.5)
      ) {
        const key = normalizeTotalsOutcome(metadata.outcomes[outcomeId]);
        if (!key) continue;
        const row = buildHistoricalOddFromSummary(
          summary,
          marketCache["OVER_UNDER_25"],
          key,
          fixtureDbId
        );
        if (row) rows.push(row);
      } else if (metadata.type === "SPREAD" && typeof metadata.handicap === "number") {
        const key = normalizeSpreadOutcome(metadata.outcomes[outcomeId]);
        if (!key) continue;
        const marketEntry = await ensureAsianHandicapMarket(metadata.handicap, marketCache);
        const row = buildHistoricalOddFromSummary(summary, marketEntry, key, fixtureDbId);
        if (row) rows.push(row);
      }
    }
  }

  return rows.filter(Boolean);
}

async function buildRowsFromTournamentOdds(
  odds: OddsPapiTournamentOdds,
  fixtureDbId: number,
  existingRows: any[],
  marketCache: Record<string, MarketCache>,
  marketMetadata: Map<number, MarketMetadataEntry>
) {
  const map = new Map<string, any>();
  existingRows.forEach((row) => {
    const sanitized = {
      fixture_id: row.fixture_id,
      market_id: row.market_id,
      outcome_id: row.outcome_id,
      opening_price: row.opening_price ?? null,
      opening_timestamp: row.opening_timestamp ?? null,
      closing_price: row.closing_price ?? null,
      closing_timestamp: row.closing_timestamp ?? null,
      is_winner: row.is_winner ?? null,
    };
    map.set(`${sanitized.market_id}:${sanitized.outcome_id}`, sanitized);
  });

  for (const market of odds.markets ?? []) {
    const metadata = marketMetadata.get(market.marketId);
    if (!metadata) continue;

    for (const outcome of market.outcomes ?? []) {
      const normalizedOutcome =
        metadata.outcomes[outcome.outcomeId] ?? outcome.outcomeName;
      if (!normalizedOutcome) continue;

      if (metadata.type === "1X2" && marketCache["1X2"]) {
        const key = normalizeOneXTwoOutcome(normalizedOutcome);
        if (!key || !marketCache["1X2"].outcomes[key]) continue;
        const rowKey = `${marketCache["1X2"].marketId}:${marketCache["1X2"].outcomes[key]}`;
        const row =
          map.get(rowKey) ??
          {
            fixture_id: fixtureDbId,
            market_id: marketCache["1X2"].marketId,
            outcome_id: marketCache["1X2"].outcomes[key],
            opening_price: null,
            opening_timestamp: null,
            closing_price: null,
            closing_timestamp: null,
            is_winner: null,
          };
        row.closing_price = outcome.price ?? row.closing_price;
        row.closing_timestamp = outcome.lastUpdated ?? row.closing_timestamp;
        map.set(rowKey, row);
      } else if (metadata.type === "TOTALS" && marketCache["OVER_UNDER_25"]) {
        const line = typeof outcome.line === "number" ? outcome.line : metadata.handicap;
        if (!isLineMatch(line, 2.5)) continue;
        const key = normalizeTotalsOutcome(normalizedOutcome);
        if (!key || !marketCache["OVER_UNDER_25"].outcomes[key]) continue;
        const entry = marketCache["OVER_UNDER_25"];
        const rowKey = `${entry.marketId}:${entry.outcomes[key]}`;
        const row =
          map.get(rowKey) ??
          {
            fixture_id: fixtureDbId,
            market_id: entry.marketId,
            outcome_id: entry.outcomes[key],
            opening_price: null,
            opening_timestamp: null,
            closing_price: null,
            closing_timestamp: null,
            is_winner: null,
          };
        row.closing_price = outcome.price ?? row.closing_price;
        row.closing_timestamp = outcome.lastUpdated ?? row.closing_timestamp;
        map.set(rowKey, row);
      } else if (metadata.type === "SPREAD" && typeof metadata.handicap === "number") {
        const line = typeof outcome.line === "number" ? outcome.line : metadata.handicap;
        const key = normalizeSpreadOutcome(normalizedOutcome);
        if (key === null) continue;
        const entry = await ensureAsianHandicapMarket(line, marketCache);
        const rowKey = `${entry.marketId}:${entry.outcomes[key]}`;
        const row =
          map.get(rowKey) ??
          {
            fixture_id: fixtureDbId,
            market_id: entry.marketId,
            outcome_id: entry.outcomes[key],
            opening_price: null,
            opening_timestamp: null,
            closing_price: null,
            closing_timestamp: null,
            is_winner: null,
          };
        row.closing_price = outcome.price ?? row.closing_price;
        row.closing_timestamp = outcome.lastUpdated ?? row.closing_timestamp;
        map.set(rowKey, row);
      }
    }
  }

  if (!map.size) {
    return existingRows;
  }

  return Array.from(map.values());
}

async function ensureAsianHandicapMarket(handicap: number, marketCache: Record<string, MarketCache>) {
  const key = `AH_${handicap}`;
  if (marketCache[key]) {
    return marketCache[key];
  }

  const baseDefinition = BASE_MARKETS.ASIAN_HANDICAP;
  const { data: market, error } = await adminDb
    .from("markets")
    .insert({
      oddspapi_id: baseDefinition.oddspapiId,
      name: `${baseDefinition.name} ${handicap}`,
      description: baseDefinition.description ?? null,
    })
    .select("id")
    .single();

  if (error || !market) {
    throw error ?? new Error("Impossible de créer le marché AH");
  }

  const outcomes: Record<string, number> = {};
  for (const outcomeDef of baseDefinition.outcomes) {
    const { data: outcome, error: outcomeError } = await adminDb
      .from("outcomes")
      .insert({
        oddspapi_id: outcomeDef.oddspapiId,
        market_id: market.id,
        name: `${outcomeDef.name} ${handicap}`,
        description: outcomeDef.description ?? null,
      })
      .select("id")
      .single();

    if (outcomeError || !outcome) {
      throw outcomeError ?? new Error("Impossible de créer outcome AH");
    }
    outcomes[outcomeDef.key] = outcome.id;
  }

  marketCache[key] = { marketId: market.id, outcomes };
  return marketCache[key];
}

function normalizeMarketDefinition(definition: OddsPapiMarketDefinition): MarketMetadataEntry | null {
  const outcomes: Record<number, string> = {};
  definition.outcomes?.forEach((outcome) => {
    outcomes[outcome.outcomeId] = outcome.outcomeName;
  });

  const type = definition.marketType?.toLowerCase();
  if (type === "1x2") {
    return { type: "1X2", outcomes };
  }
  if (type === "totals") {
    return { type: "TOTALS", handicap: definition.handicap, outcomes };
  }
  if (type === "spreads") {
    return { type: "SPREAD", handicap: definition.handicap, outcomes };
  }
  return null;
}

type PriceSummary = {
  opening?: OddsPapiHistoricalPricePoint;
  closing?: OddsPapiHistoricalPricePoint;
};

function summarizePriceHistory(history: OddsPapiHistoricalPricePoint[]): PriceSummary | null {
  const valid = history.filter(
    (entry) => typeof entry.price === "number" && !Number.isNaN(entry.price)
  );
  if (!valid.length) {
    return null;
  }

  const sorted = [...valid].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const reverse = [...valid].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const opening = sorted[0];
  const closing = reverse.find((entry) => entry.active) ?? reverse[0];

  return { opening, closing };
}

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

function normalizeOneXTwoOutcome(value?: string) {
  const token = value?.toUpperCase();
  if (!token) return null;
  if (token.includes("HOME") || token === "1") return "1";
  if (token.includes("AWAY") || token === "2") return "2";
  if (token.includes("DRAW") || token === "X") return "X";
  return null;
}

function normalizeTotalsOutcome(value?: string) {
  const token = value?.toUpperCase();
  if (!token) return null;
  if (token.includes("OVER")) return "O25";
  if (token.includes("UNDER")) return "U25";
  return null;
}

function normalizeSpreadOutcome(value?: string) {
  const token = value?.toUpperCase();
  if (!token) return null;
  if (token.includes("HOME") || token.includes("TEAM1")) return "HOME";
  if (token.includes("AWAY") || token.includes("TEAM2")) return "AWAY";
  return null;
}

function isLineMatch(line: number | undefined, target: number) {
  if (typeof line !== "number") return false;
  return Math.abs(line - target) < 0.01;
}
