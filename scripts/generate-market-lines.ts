import fs from "fs";

import "./load-env";

import { oddsPapiClient, OddsPapiError } from "@/lib/api/oddspapi";
import { SPORT_LABELS, TOURNAMENT_OPTIONS_BY_SPORT } from "@/lib/config/tournaments";

type MarketMeta = {
  type: "1X2" | "TOTALS" | "SPREAD" | "OTHER";
  handicap?: number;
};

const CHUNK_SIZE = 5;
const SAMPLE_PER_SPORT = 5;

function parseArgs() {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const [rawKey, rawValue] = arg.split("=");
    if (!rawValue) continue;
    args.set(rawKey.replace(/^-+/, ""), rawValue);
  }
  return args;
}

function roundLine(value: number) {
  return Math.round(value * 1000) / 1000;
}

function formatValues(values: Set<number>) {
  if (!values.size) return "_Aucune ligne détectée_";
  return Array.from(values)
    .sort((a, b) => a - b)
    .map((value) => (Number.isInteger(value) ? value.toFixed(0) : value.toString()))
    .join(", ");
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectMarketMetaBySport() {
  const definitions = await oddsPapiClient.getMarkets({ language: "en" });
  const bySport = new Map<number, Map<number, MarketMeta>>();

  definitions.forEach((definition) => {
    const type = definition.marketType.toLowerCase();
    let meta: MarketMeta;
    if (type === "1x2") {
      meta = { type: "1X2" };
    } else if (type === "totals") {
      meta = { type: "TOTALS", handicap: definition.handicap };
    } else if (type === "spreads") {
      meta = { type: "SPREAD", handicap: definition.handicap };
    } else {
      meta = { type: "OTHER" };
    }
    const bucket = bySport.get(definition.sportId) ?? new Map<number, MarketMeta>();
    bucket.set(definition.marketId, meta);
    bySport.set(definition.sportId, bucket);
  });

  return bySport;
}

async function collectLinesForSport(
  sportId: number,
  tournamentIds: number[],
  marketMetaMap: Map<number, MarketMeta>
) {
  const totals = new Set<number>();
  const spreads = new Set<number>();
  const seenMarkets = new Set<number>();

  const meta = marketMetaMap;

  for (let i = 0; i < tournamentIds.length; i += CHUNK_SIZE) {
    const chunk = tournamentIds.slice(i, i + CHUNK_SIZE);
    if (!chunk.length) continue;

    const oddsList = await oddsPapiClient.getOddsByTournaments(chunk);
    oddsList.forEach((entry) => {
      entry.markets?.forEach((market) => {
        const marketMeta = meta.get(market.marketId);
        if (!marketMeta) return;
        seenMarkets.add(market.marketId);

        if (marketMeta.type === "TOTALS") {
          market.outcomes?.forEach((outcome) => {
            const line =
              typeof outcome.line === "number"
                ? outcome.line
                : typeof marketMeta.handicap === "number"
                ? marketMeta.handicap
                : undefined;
            if (typeof line === "number") {
              totals.add(roundLine(line));
            }
          });
        } else if (marketMeta.type === "SPREAD") {
          market.outcomes?.forEach((outcome) => {
            const line =
              typeof outcome.line === "number"
                ? outcome.line
                : typeof marketMeta.handicap === "number"
                ? marketMeta.handicap
                : undefined;
            if (typeof line === "number") {
              spreads.add(roundLine(line));
            }
          });
        }
      });
    });

    await delay(1000); // respecte le rate limit /v4/odds-by-tournaments
  }

  return { totals, spreads, marketsCount: seenMarkets.size };
}

async function main() {
  const args = parseArgs();
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  const sections: string[] = [];
  sections.push("# Pinnacle – Lignes détectées");
  sections.push("");
  sections.push(`Généré le ${new Date().toISOString()}`);
  sections.push("");

  const metaBySport = await collectMarketMetaBySport();
  const sportsFilter = args.get("sports") ?? args.get("sport");
  const selectedSports = sportsFilter
    ? sportsFilter
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    : null;

  const sports = Object.keys(TOURNAMENT_OPTIONS_BY_SPORT)
    .filter((sportId) => !selectedSports || selectedSports.includes(sportId))
    .sort();
  for (const sportIdStr of sports) {
    const sportId = Number(sportIdStr);
    const label = SPORT_LABELS[sportIdStr] ?? `Sport ${sportId}`;
    const tournaments = (TOURNAMENT_OPTIONS_BY_SPORT[sportIdStr] ?? []).slice(
      0,
      SAMPLE_PER_SPORT
    );
    const tournamentIds = tournaments.map((t) => t.tournamentId);

    console.log(`\n=== Collecte pour ${label} (sportId ${sportId}) ===`);
    console.log(`Tournois: ${tournamentIds.join(", ")}`);

    sections.push(`## ${label} (sportId ${sportId})`);
    sections.push(
      `Tournois analysés : ${tournaments
        .map((t) => `${t.name} (#${t.tournamentId})`)
        .join(", ")}`
    );

    try {
      if (!tournamentIds.length) {
        throw new Error("Aucun tournoi à analyser.");
      }
      const result = await collectLinesForSport(
        sportId,
        tournamentIds,
        metaBySport.get(sportId) ?? new Map<number, MarketMeta>()
      );
      sections.push("");
      sections.push(`- Lignes Totals détectées : ${formatValues(result.totals)}`);
      sections.push(`- Lignes Handicap détectées : ${formatValues(result.spreads)}`);
      sections.push(`- Marchés rencontrés : ${result.marketsCount}`);
    } catch (error) {
      const message = formatOddsPapiError(error);
      console.error(`Erreur lors de la collecte pour ${label}: ${message}`);
      sections.push("");
      sections.push(
        `- ⚠️ Échec de la récupération : ${
          message
        }`
      );
    }

    sections.push("");
    sections.push("---");
    sections.push("");
  }

  fs.writeFileSync("MARKET_LINES.md", sections.join("\n"), "utf8");
  console.log("📝 Fichier MARKET_LINES.md généré avec succès.");
}

main().catch((error) => {
  console.error("💥 Échec lors de la génération des lignes :", formatOddsPapiError(error));
  process.exit(1);
});

function formatOddsPapiError(error: unknown) {
  if (error instanceof OddsPapiError) {
    const body =
      typeof error.body === "string"
        ? error.body
        : error.body
        ? JSON.stringify(error.body)
        : "Réponse vide";
    return `${error.message} (status ${error.status}) • ${body}`;
  }
  if (error instanceof Error) {
    return `${error.message}`;
  }
  return String(error);
}
