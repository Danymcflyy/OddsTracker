import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

type MarketMeta = {
  type: "1X2" | "TOTALS" | "SPREAD" | "OTHER";
  handicap?: number;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const map = new Map<string, string>();
  for (const arg of args) {
    const [key, value] = arg.split("=");
    if (value !== undefined) {
      map.set(key.replace(/^-+/, ""), value);
    }
  }
  return map;
}

function roundLine(value: number) {
  return Math.round(value * 1000) / 1000;
}

async function main() {
  const args = parseArgs();
  const sportId = Number(args.get("sport") ?? args.get("s")) || 10;
  const tournamentsArg = args.get("tournaments") ?? args.get("t");
  if (!tournamentsArg) {
    console.error("⚠️  Merci de fournir --tournaments=ID1,ID2,...");
    process.exit(1);
  }
  const tournamentIds = tournamentsArg
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
  if (!tournamentIds.length) {
    console.error("⚠️  Aucun tournoi valide détecté.");
    process.exit(1);
  }

  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log(
    `🔎 Inspection des marchés Pinnacle • sport=${sportId} • tournois=${tournamentIds.join(",")}`
  );

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });
  const metaMap = new Map<number, MarketMeta>();
  definitions
    .filter((definition) => definition.sportId === sportId && definition.period === "fulltime")
    .forEach((definition) => {
      const type = definition.marketType.toLowerCase();
      if (type === "1x2") {
        metaMap.set(definition.marketId, { type: "1X2" });
      } else if (type === "totals") {
        metaMap.set(definition.marketId, {
          type: "TOTALS",
          handicap: definition.handicap,
        });
      } else if (type === "spreads") {
        metaMap.set(definition.marketId, {
          type: "SPREAD",
          handicap: definition.handicap,
        });
      } else {
        metaMap.set(definition.marketId, { type: "OTHER" });
      }
    });

  const totalsLines = new Set<number>();
  const spreadLines = new Set<number>();
  const seenMarkets = new Map<number, string>();

  const oddsList = await oddsPapiClient.getOddsByTournaments(tournamentIds);
  oddsList.forEach((entry) => {
    entry.markets?.forEach((market) => {
      const meta = metaMap.get(market.marketId);
      if (!meta) return;
      seenMarkets.set(market.marketId, market.marketName);

      if (meta.type === "TOTALS") {
        market.outcomes?.forEach((outcome) => {
          const line =
            typeof outcome.line === "number"
              ? outcome.line
              : typeof meta.handicap === "number"
              ? meta.handicap
              : undefined;
          if (typeof line === "number") {
            totalsLines.add(roundLine(line));
          }
        });
      } else if (meta.type === "SPREAD") {
        market.outcomes?.forEach((outcome) => {
          const line =
            typeof outcome.line === "number"
              ? outcome.line
              : typeof meta.handicap === "number"
              ? meta.handicap
              : undefined;
          if (typeof line === "number") {
            spreadLines.add(roundLine(line));
          }
        });
      }
    });
  });

  const formatSet = (set: Set<number>) =>
    Array.from(set)
      .sort((a, b) => a - b)
      .map((value) => (Number.isInteger(value) ? value.toFixed(0) : value.toString()));

  console.log("\n🧮 Lignes Totals détectées :", formatSet(totalsLines));
  console.log("\n🧮 Lignes Handicap détectées :", formatSet(spreadLines));
  console.log("\n📋 Marchés rencontrés :", Array.from(seenMarkets.entries()));
}

main().catch((error) => {
  console.error("💥 Échec de l'inspection :", error);
  process.exit(1);
});
