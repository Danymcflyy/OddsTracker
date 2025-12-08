import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import * as dotenv from "dotenv";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  BASE_MARKETS,
  LEAGUE_CONFIGS,
  LeagueConfig,
  generateFixtureOddspapiId,
  generateTeamOddspapiId,
  getLeagueConfig,
  normalizeTeamName,
} from "../lib/import/catalog";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables d'environnement manquantes (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CsvRow {
  Div: string;
  Date: string;
  Time: string;
  HomeTeam: string;
  AwayTeam: string;
  FTHG: string;
  FTAG: string;
  FTR: string;
  HTHG?: string;
  HTAG?: string;
  HTR?: string;
  PSH?: string;
  PSD?: string;
  PSA?: string;
  PSCH?: string;
  PSCD?: string;
  PSCA?: string;
  "P>2.5"?: string;
  "P<2.5"?: string;
  "PC>2.5"?: string;
  "PC<2.5"?: string;
  AHh?: string;
  AHCh?: string;
  PAHH?: string;
  PAHA?: string;
  PCAHH?: string;
  PCAHA?: string;
}

type SportCardData = {
  matchId: string;
  fixtureId?: number;
};

type MarketCache = {
  marketId: number;
  outcomes: Record<string, number>;
};

const dryRunState = {
  enabled: process.argv.includes("--dry-run"),
  idCounter: 1,
  teams: new Map<string, number>(),
  fixtures: new Map<string, number>(),
};

function pseudoIdFromString(value: string) {
  return value
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

async function main(inputPath: string, leagueConfig: LeagueConfig) {
  console.log(
    `📁 Fichier d'entrée : ${inputPath} • Ligue : ${leagueConfig.label}${ 
      dryRunState.enabled ? " (dry-run)" : ""
    }`
  );

  const rows = await loadRows(inputPath);
  console.log(`📊 ${rows.length} lignes détectées`);

  const { sportId, leagueId } = await resolveLeagueContext(leagueConfig);
  const marketCache = await ensureBaseMarkets();

  const logId = await startSyncLog(sportId, rows.length);

  let fixturesInserted = 0;
  let fixtureErrors = 0;
  let oddsInserted = 0;

  for (const row of rows) {
    try {
      if (!row.Date || !row.Time || !row.HomeTeam || !row.AwayTeam) {
        console.warn("⚠️ Ligne incomplète ignorée", row);
        fixtureErrors++;
        continue;
      }

      const matchDate = parseDate(row.Date, row.Time);
      const homeTeamId = await ensureTeam(row.HomeTeam);
      const awayTeamId = await ensureTeam(row.AwayTeam);

      const homeScore = parseInt(row.FTHG ?? "0", 10);
      const awayScore = parseInt(row.FTAG ?? "0", 10);

      const oddspapiId = generateFixtureOddspapiId(matchDate, row.HomeTeam, row.AwayTeam);

      const fixtureId = await ensureFixture({
        oddspapiId,
        sportId,
        leagueId,
        homeTeamId,
        awayTeamId,
        matchDate,
        homeScore,
        awayScore,
      });

      if (!fixtureId) continue;

      const insertedOdds = await upsertFixtureOdds(fixtureId, row, matchDate, homeScore, awayScore, marketCache);
      oddsInserted += insertedOdds;
      fixturesInserted++;

      if (fixturesInserted % 10 === 0) {
        console.log(`⏳ ${fixturesInserted}/${rows.length} matchs traités...`);
      }
    } catch (error) {
      fixtureErrors++;
      console.error(`❌ Erreur import match ${row.HomeTeam} vs ${row.AwayTeam}`, error);
    }
  }

  await completeSyncLog(logId, {
    status: fixtureErrors === 0 ? "success" : "error",
    inserted: fixturesInserted,
    errors: fixtureErrors,
  });

  console.log("\n✅ Import terminé");
  console.log(`   - Fixtures insérés/mis à jour : ${fixturesInserted}`);
  console.log(`   - Cotes insérées : ${oddsInserted}`);
  console.log(`   - Erreurs : ${fixtureErrors}`);
}

async function loadRows(filePath: string): Promise<CsvRow[]> {
  const ext = path.extname(filePath).toLowerCase();

  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable : ${filePath}`);
  }

  if (ext === ".xlsx" || ext === ".xls") {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<CsvRow>(sheet, { defval: "" });
  }

  const rows: CsvRow[] = [];
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: CsvRow) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  return rows;
}

async function resolveLeagueContext(config: LeagueConfig) {
  const sportId = await ensureSport(config);
  const countryId = await ensureCountry(config);
  const leagueId = await ensureLeagueRecord(config, sportId, countryId);
  return { sportId, leagueId };
}

async function ensureSport(config: LeagueConfig): Promise<number> {
  if (dryRunState.enabled) {
    return config.sportOddspapiId;
  }

  const { data, error } = await supabase
    .from("sports")
    .upsert(
      {
        oddspapi_id: config.sportOddspapiId,
        name: config.sportName,
        slug: config.sportSlug,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureCountry(config: LeagueConfig): Promise<number> {
  if (dryRunState.enabled) {
    return pseudoIdFromString(config.countrySlug);
  }

  const { data, error } = await supabase
    .from("countries")
    .upsert( { oddspapi_slug: config.countrySlug, name: config.countryName },
      { onConflict: "oddspapi_slug" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureLeagueRecord(
  config: LeagueConfig,
  sportId: number,
  countryId: number
): Promise<number> {
  if (dryRunState.enabled) {
    return config.oddspapiId;
  }

  const { data, error } = await supabase
    .from("leagues")
    .upsert(
      {
        oddspapi_id: config.oddspapiId,
        name: config.name,
        slug: config.slug,
        sport_id: sportId,
        country_id: countryId,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureTeam(name: string): Promise<number> {
  const normalized = normalizeTeamName(name);

  if (dryRunState.enabled) {
    if (!dryRunState.teams.has(normalized)) {
      dryRunState.teams.set(normalized, dryRunState.idCounter++);
    }
    return dryRunState.teams.get(normalized)!;
  }

  const oddspapiId = generateTeamOddspapiId(normalized);
  const { data, error } = await supabase
    .from("teams")
    .upsert(
      {
        oddspapi_id: oddspapiId,
        name: normalized,
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureFixture(params: {
  oddspapiId: string;
  sportId: number;
  leagueId: number;
  homeTeamId: number;
  awayTeamId: number;
  matchDate: Date;
  homeScore: number;
  awayScore: number;
}): Promise<number | undefined> {
  if (dryRunState.enabled) {
    if (!dryRunState.fixtures.has(params.oddspapiId)) {
      dryRunState.fixtures.set(params.oddspapiId, dryRunState.idCounter++);
    }
    return dryRunState.fixtures.get(params.oddspapiId);
  }

  const { data, error } = await supabase
    .from("fixtures")
    .upsert(
      {
        oddspapi_id: params.oddspapiId,
        sport_id: params.sportId,
        league_id: params.leagueId,
        home_team_id: params.homeTeamId,
        away_team_id: params.awayTeamId,
        start_time: params.matchDate.toISOString(),
        home_score: params.homeScore,
        away_score: params.awayScore,
        status: "finished",
      },
      { onConflict: "oddspapi_id" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("Erreur upsert fixture", error);
    return undefined;
  }

  return data.id;
}

async function ensureBaseMarkets(): Promise<Record<string, MarketCache>> {
  const cache: Record<string, MarketCache> = {};

  for (const definition of Object.values(BASE_MARKETS)) {
    if (dryRunState.enabled) {
      cache[definition.key] = {
        marketId: definition.oddspapiId,
        outcomes: definition.outcomes.reduce<Record<string, number>>((acc, outcome) => {
          acc[outcome.key] = outcome.oddspapiId;
          return acc;
        }, {}),
      };
      continue;
    }

    const { data: market, error: marketError } = await supabase
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

    if (marketError) {
      throw marketError;
    }

    const outcomes: Record<string, number> = {};
    for (const outcomeDef of definition.outcomes) {
      const { data: outcome, error: outcomeError } = await supabase
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

      if (outcomeError) {
        throw outcomeError;
      }
      outcomes[outcomeDef.key] = outcome.id;
    }

    cache[definition.key] = {
      marketId: market.id,
      outcomes,
    };
  }

  return cache;
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

  if (dryRunState.enabled) {
    const marketId = pseudoIdFromString(`ah-market-${normalizedLine}`);
    const outcomes = {
      HOME: pseudoIdFromString(`ah-home-${normalizedLine}`),
      AWAY: pseudoIdFromString(`ah-away-${normalizedLine}`),
    };
    const entry: MarketCache = { marketId, outcomes };
    cache[key] = entry;
    return entry;
  }

  const marketOddspapiId = pseudoIdFromString(`ah-market-${normalizedLine}`);
  const { data: market, error: marketError } = await supabase
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

  const outcomes: Record<string, number> = {};
  const homeOddspapiId = pseudoIdFromString(`ah-home-${normalizedLine}`);
  const awayOddspapiId = pseudoIdFromString(`ah-away-${normalizedLine}`);

  const [{ data: homeOutcome, error: homeError }, { data: awayOutcome, error: awayError }] =
    await Promise.all([
      supabase
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
      supabase
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

  outcomes["HOME"] = homeOutcome.id;
  outcomes["AWAY"] = awayOutcome.id;

  const entry: MarketCache = { marketId: market.id, outcomes };
  cache[key] = entry;
  return entry;
}

async function upsertFixtureOdds(
  fixtureId: number,
  row: CsvRow,
  matchDate: Date,
  homeScore: number,
  awayScore: number,
  marketCache: Record<string, MarketCache>
): Promise<number> {
  if (dryRunState.enabled) {
    return 0;
  }

  await supabase.from("odds").delete().eq("fixture_id", fixtureId);

  const odds: any[] = [];
  const timestamp = matchDate.toISOString();

  // 1X2
  if (marketCache["1X2"]) {
    odds.push(
      buildOdd(row.PSH, row.PSCH, marketCache["1X2"], "1", fixtureId, timestamp, determine1X2Winner(homeScore, awayScore, "1")),
      buildOdd(row.PSD, row.PSCD, marketCache["1X2"], "X", fixtureId, timestamp, determine1X2Winner(homeScore, awayScore, "X")),
      buildOdd(row.PSA, row.PSCA, marketCache["1X2"], "2", fixtureId, timestamp, determine1X2Winner(homeScore, awayScore, "2"))
    );
  }

  // Over / Under 2.5
  if (marketCache["OVER_UNDER_25"]) {
    odds.push(
      buildOdd(
        row["P>2.5"],
        row["PC>2.5"],
        marketCache["OVER_UNDER_25"],
        "O25",
        fixtureId,
        timestamp,
        determineOverUnderWinner(homeScore, awayScore, "over", 2.5)
      ),
      buildOdd(
        row["P<2.5"],
        row["PC<2.5"],
        marketCache["OVER_UNDER_25"],
        "U25",
        fixtureId,
        timestamp,
        determineOverUnderWinner(homeScore, awayScore, "under", 2.5)
      )
    );
  }

  // Asian Handicap (ligne unique par match)
  const ahLine = parseFloat(row.AHh ?? row.AHCh ?? "");
  if (!Number.isNaN(ahLine)) {
    const ahMarket = await ensureAsianHandicapMarket(ahLine, marketCache);
    const winnerHome = determineAsianHandicapWinner(homeScore, awayScore, ahLine, "home");
    const winnerAway = determineAsianHandicapWinner(homeScore, awayScore, ahLine, "away");

    odds.push(
      buildOdd(row.PAHH, row.PCAHH, ahMarket, "HOME", fixtureId, timestamp, winnerHome),
      buildOdd(row.PAHA, row.PCAHA, ahMarket, "AWAY", fixtureId, timestamp, winnerAway)
    );
  }

  const filtered = odds.filter(Boolean);
  if (!filtered.length) {
    console.warn(`⚠️ Pas de cotes disponibles pour fixture ${fixtureId}`);
    return 0;
  }

  const { error } = await supabase.from("odds").insert(filtered);
  if (error) {
    console.error("Erreur insertion des cotes", error);
    return 0;
  }

  return filtered.length;
}

function buildOdd(
  opening: string | undefined,
  closing: string | undefined,
  market: MarketCache,
  outcomeKey: string,
  fixtureId: number,
  timestamp: string,
  winner: boolean | null
) {
  const openingPrice = opening ? parseFloat(opening) : null;
  const closingPrice = closing ? parseFloat(closing) : null;
  if (openingPrice === null && closingPrice === null) {
    return null;
  }

  return {
    fixture_id: fixtureId,
    market_id: market.marketId,
    outcome_id: market.outcomes[outcomeKey],
    opening_price: openingPrice,
    closing_price: closingPrice,
    opening_timestamp: openingPrice ? timestamp : null,
    closing_timestamp: closingPrice ? timestamp : null,
    is_winner: winner,
  };
}

function determine1X2Winner(home: number, away: number, outcome: "1" | "X" | "2"): boolean {
  if (outcome === "1") return home > away;
  if (outcome === "2") return away > home;
  return home === away;
}

function determineOverUnderWinner(home: number, away: number, type: "over" | "under", line: number): boolean {
  const total = home + away;
  return type === "over" ? total > line : total < line;
}

function determineAsianHandicapWinner(
  home: number,
  away: number,
  handicap: number,
  side: "home" | "away"
): boolean | null {
  const adjustedHome = home + handicap;
  if (side === "home") {
    if (adjustedHome > away) return true;
    if (adjustedHome === away) return null;
    return false;
  }
  if (away > adjustedHome) return true;
  if (away === adjustedHome) return null;
  return false;
}

function normalizeHandicapLine(value: number) {
  const formatted = Number(value.toFixed(2));
  return formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toString();
}

async function startSyncLog(sportId: number, fetched: number) {
  if (dryRunState.enabled) return null;
  const { data, error } = await supabase
    .from("sync_logs")
    .insert({
      sport_id: sportId,
      status: "running",
      records_fetched: fetched,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) {
    console.error("Impossible de créer le log de sync", error);
    return null;
  }
  return data.id;
}

async function completeSyncLog(
  logId: number | null,
  payload: { status: "success" | "error"; inserted: number; errors: number }
) {
  if (!logId || dryRunState.enabled) return;
  const { error } = await supabase
    .from("sync_logs")
    .update({
      status: payload.status,
      records_inserted: payload.inserted,
      error_message: payload.errors ? `${payload.errors} erreurs pendant l'import CSV` : null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", logId);
  if (error) {
    console.error("Impossible de finaliser le log de sync", error);
  }
}

function parseDate(dateStr: string, timeStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

(async () => {
  try {
    const { filePath, leagueConfig } = await resolveInputs();
    await main(filePath, leagueConfig);
    if (dryRunState.enabled) {
      console.log("✅ Dry-run terminé (aucune écriture en base)");
    }
    process.exit(0);
  } catch (error) {
    console.error("💥 Import échoué", error);
    process.exit(1);
  }
})();

async function resolveInputs() {
  let filePathArg: string | undefined;
  let leagueKeyArg: string | undefined;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") continue;
    if (arg.startsWith("--league=")) {
      leagueKeyArg = arg.split("=")[1];
      continue;
    }
    if (!filePathArg) {
      filePathArg = arg;
      continue;
    }
  }

  const filePath = path.resolve(filePathArg ?? "F1.csv");
  const leagueConfig = await selectLeagueConfig(leagueKeyArg);

  return { filePath, leagueConfig };
}

async function selectLeagueConfig(initialKey?: string): Promise<LeagueConfig> {
  let config = initialKey ? getLeagueConfig(initialKey) : undefined;

  if (config) {
    return config;
  }

  console.log("🏟️  Ligues disponibles ஒன்றிணை :");
  LEAGUE_CONFIGS.forEach((cfg) => {
    console.log(`  - ${cfg.key}${cfg.aliases ? ` (alias: ${cfg.aliases.join(", ")})` : ""} : ${cfg.label}`);
  });

  const rl = createInterface({ input, output });
  const answer = (await rl.question("Choisissez une ligue : ")).trim().toLowerCase();
  rl.close();

  config = getLeagueConfig(answer);
  if (!config) {
    throw new Error(`Ligue inconnue: ${answer}`);
  }
  return config;
}
