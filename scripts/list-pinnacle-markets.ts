import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

// Sports à afficher par défaut
const DEFAULT_SPORTS = [10, 12, 15, 23]; // Football, Tennis, Hockey, Volleyball
const SPORT_NAMES: Record<number, string> = {
  10: "Football",
  12: "Tennis",
  15: "Hockey sur glace",
  23: "Volleyball",
};

async function main() {
  const args = process.argv.slice(2);
  const sportIdFilter = args.find((arg) => arg.startsWith("--sport=") || arg.startsWith("-s="));
  const requestedSportId = sportIdFilter
    ? Number(sportIdFilter.split("=")[1])
    : undefined;

  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Récupération des définitions de marchés Pinnacle...\n");

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  // Grouper par sport
  const bySport = new Map<number, typeof definitions>();
  definitions.forEach((def) => {
    const list = bySport.get(def.sportId) ?? [];
    list.push(def);
    bySport.set(def.sportId, list);
  });

  // Filtrer uniquement les sports qui nous intéressent
  const targetSports = requestedSportId !== undefined
    ? [requestedSportId]
    : DEFAULT_SPORTS;

  const sportIds = targetSports.filter((id) => bySport.has(id)).sort((a, b) => a - b);

  for (const sportId of sportIds) {
    const markets = bySport.get(sportId)!;
    const sportName = SPORT_NAMES[sportId] || `Sport ${sportId}`;
    console.log(`\n━━━ ${sportName} (ID: ${sportId}) • ${markets.length} marchés ━━━`);

    // Grouper par type de marché
    const byType = new Map<string, typeof markets>();
    markets.forEach((m) => {
      const list = byType.get(m.marketType) ?? [];
      list.push(m);
      byType.set(m.marketType, list);
    });

    const types = Array.from(byType.keys()).sort();
    for (const type of types) {
      const typeMarkets = byType.get(type)!;
      console.log(`\n  📊 ${type} (${typeMarkets.length})`);

      // Grouper par période
      const byPeriod = new Map<string, typeof typeMarkets>();
      typeMarkets.forEach((m) => {
        const list = byPeriod.get(m.period) ?? [];
        list.push(m);
        byPeriod.set(m.period, list);
      });

      const periods = Array.from(byPeriod.keys()).sort();
      for (const period of periods) {
        const periodMarkets = byPeriod.get(period)!;
        console.log(`    └─ ${period}: ${periodMarkets.length} marchés`);

        // Afficher quelques exemples
        const samples = periodMarkets.slice(0, 3);
        samples.forEach((m) => {
          const handicapInfo = m.handicap !== undefined ? ` (handicap: ${m.handicap})` : "";
          console.log(
            `       • [${m.marketId}] ${m.marketName}${handicapInfo}`
          );
        });

        if (periodMarkets.length > 3) {
          console.log(`       ... et ${periodMarkets.length - 3} autres`);
        }
      }
    }
  }

  console.log("\n✅ Terminé\n");
  console.log("💡 Sports disponibles : Football (10), Tennis (12), Hockey (15), Volleyball (23)");
  console.log("💡 Utilisez --sport=XX pour filtrer un sport spécifique");
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
