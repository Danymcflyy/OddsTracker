import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

// Sports à afficher
const SPORTS = [10, 12, 15, 23]; // Football, Tennis, Hockey, Volleyball
const SPORT_NAMES: Record<number, string> = {
  10: "⚽ Football",
  12: "🎾 Tennis",
  15: "🏒 Hockey sur glace",
  23: "🏐 Volleyball",
};

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Récupération des marchés Pinnacle (fulltime + halftime)...\n");

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  // Grouper par sport
  const bySport = new Map<number, typeof definitions>();
  definitions
    .filter((def) => def.period === "fulltime" || def.period === "halftime")
    .forEach((def) => {
      const list = bySport.get(def.sportId) ?? [];
      list.push(def);
      bySport.set(def.sportId, list);
    });

  for (const sportId of SPORTS) {
    const markets = bySport.get(sportId);
    if (!markets) {
      console.log(`${SPORT_NAMES[sportId]} • Aucun marché disponible`);
      continue;
    }

    console.log(`\n${SPORT_NAMES[sportId]} • ${markets.length} marchés\n`);

    // Grouper par période puis par type
    const byPeriod = new Map<string, typeof markets>();
    markets.forEach((m) => {
      const list = byPeriod.get(m.period) ?? [];
      list.push(m);
      byPeriod.set(m.period, list);
    });

    const periods = Array.from(byPeriod.keys()).sort();
    for (const period of periods) {
      const periodMarkets = byPeriod.get(period)!;
      console.log(`  ⏱️  ${period.toUpperCase()} (${periodMarkets.length} marchés)`);

      // Grouper par type
      const byType = new Map<string, typeof periodMarkets>();
      periodMarkets.forEach((m) => {
        const list = byType.get(m.marketType) ?? [];
        list.push(m);
        byType.set(m.marketType, list);
      });

      const types = Array.from(byType.keys()).sort();
      for (const type of types) {
        const typeMarkets = byType.get(type)!;
        console.log(`     📊 ${type} (${typeMarkets.length})`);

        // Afficher quelques exemples
        const samples = typeMarkets.slice(0, 3);
        samples.forEach((m) => {
          const handicapInfo = m.handicap !== undefined ? ` • ligne: ${m.handicap}` : "";
          console.log(`        └─ ${m.marketName}${handicapInfo}`);
        });

        if (typeMarkets.length > 3) {
          console.log(`        └─ ... et ${typeMarkets.length - 3} autres`);
        }
      }
      console.log("");
    }
  }

  console.log("\n✅ Terminé");
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
