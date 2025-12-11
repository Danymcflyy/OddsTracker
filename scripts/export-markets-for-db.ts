import fs from "fs";
import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

const SPORTS = [10, 12, 15, 23];
const SPORT_NAMES: Record<number, string> = {
  10: "Football",
  12: "Tennis",
  15: "Hockey sur glace",
  23: "Volleyball",
};

interface MarketInfo {
  marketId: number;
  marketName: string;
  marketType: string;
  period: string;
  handicap?: number;
  outcomeCount: number;
  outcomes: string[];
}

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Récupération des marchés Pinnacle...\n");

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  const output: string[] = [];
  output.push("# Marchés Pinnacle - Guide pour la Base de Données");
  output.push("");
  output.push(`Généré le ${new Date().toISOString()}`);
  output.push("");
  output.push("---");
  output.push("");

  for (const sportId of SPORTS) {
    const sportMarkets = definitions.filter((d) => d.sportId === sportId);

    if (sportMarkets.length === 0) {
      output.push(`## ${SPORT_NAMES[sportId]} (sportId: ${sportId})`);
      output.push("");
      output.push("⚠️ **Aucun marché disponible pour ce sport**");
      output.push("");
      output.push("---");
      output.push("");
      continue;
    }

    output.push(`## ${SPORT_NAMES[sportId]} (sportId: ${sportId})`);
    output.push("");
    output.push(`Total de marchés : **${sportMarkets.length}**`);
    output.push("");

    // Grouper par période
    const byPeriod = new Map<string, typeof sportMarkets>();
    sportMarkets.forEach((m) => {
      const periodKey = m.period || "unknown";
      const list = byPeriod.get(periodKey) ?? [];
      list.push(m);
      byPeriod.set(periodKey, list);
    });

    const periods = Array.from(byPeriod.keys()).sort();

    for (const period of periods) {
      const periodMarkets = byPeriod.get(period)!;
      const periodDisplay = period ? period.toUpperCase() : "UNKNOWN";
      output.push(`### ${periodDisplay} (${periodMarkets.length} marchés)`);
      output.push("");

      // Grouper par type
      const byType = new Map<string, typeof periodMarkets>();
      periodMarkets.forEach((m) => {
        const typeKey = m.marketType || "unknown";
        const list = byType.get(typeKey) ?? [];
        list.push(m);
        byType.set(typeKey, list);
      });

      const types = Array.from(byType.keys()).sort();

      for (const type of types) {
        const typeMarkets = byType.get(type)!;
        const typeDisplay = type ? type : "UNKNOWN";
        output.push(`#### ${typeDisplay}`);
        output.push("");
        output.push("| Market ID | Nom du marché | Handicap | Issues |");
        output.push("|-----------|---------------|----------|--------|");

        typeMarkets.forEach((market) => {
          const handicapDisplay = market.handicap !== undefined ? market.handicap.toString() : "-";
          const outcomes = market.outcomes
            ? market.outcomes.map((o) => o.outcomeName || "?").join(", ")
            : "-";
          const marketName = market.marketName || "Unknown";
          output.push(
            `| \`${market.marketId}\` | ${marketName} | ${handicapDisplay} | ${outcomes} |`
          );
        });

        output.push("");
      }
    }

    output.push("---");
    output.push("");
  }

  // Ajouter un résumé pour la DB
  output.push("## 📊 Résumé pour la Base de Données");
  output.push("");
  output.push("### Types de marchés principaux");
  output.push("");

  const allMarkets = definitions.filter((d) => SPORTS.includes(d.sportId));
  const allTypes = new Set(allMarkets.map((m) => m.marketType || "unknown"));

  output.push("```");
  Array.from(allTypes)
    .filter((type) => type)
    .sort()
    .forEach((type) => {
      const count = allMarkets.filter((m) => (m.marketType || "unknown") === type).length;
      output.push(`${type.padEnd(20)} : ${count} marchés`);
    });
  output.push("```");
  output.push("");

  output.push("### Périodes disponibles");
  output.push("");
  const allPeriods = new Set(allMarkets.map((m) => m.period || "unknown"));
  output.push("```");
  Array.from(allPeriods)
    .filter((period) => period)
    .sort()
    .forEach((period) => {
      const count = allMarkets.filter((m) => (m.period || "unknown") === period).length;
      output.push(`${period.padEnd(20)} : ${count} marchés`);
    });
  output.push("```");
  output.push("");

  output.push("### Colonnes suggérées pour la table `markets`");
  output.push("");
  output.push("```sql");
  output.push("CREATE TABLE markets (");
  output.push("  id SERIAL PRIMARY KEY,");
  output.push("  market_id INTEGER NOT NULL UNIQUE,  -- Code API Pinnacle");
  output.push("  sport_id INTEGER NOT NULL,");
  output.push("  market_name VARCHAR(255) NOT NULL,");
  output.push("  market_type VARCHAR(50) NOT NULL,   -- 1x2, totals, spreads, etc.");
  output.push("  period VARCHAR(50) NOT NULL,        -- fulltime, halftime, etc.");
  output.push("  handicap DECIMAL(10,3),             -- Pour totals/spreads");
  output.push("  player_prop BOOLEAN DEFAULT false,");
  output.push("  created_at TIMESTAMP DEFAULT NOW()");
  output.push(");");
  output.push("```");

  const fileName = "PINNACLE_MARKETS.md";
  fs.writeFileSync(fileName, output.join("\n"), "utf8");

  console.log(`✅ Fichier généré : ${fileName}`);
  console.log("");
  console.log("📋 Résumé :");
  for (const sportId of SPORTS) {
    const count = definitions.filter((d) => d.sportId === sportId).length;
    console.log(`   ${SPORT_NAMES[sportId]}: ${count} marchés`);
  }
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
