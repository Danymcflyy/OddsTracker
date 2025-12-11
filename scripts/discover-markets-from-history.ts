import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

const SPORTS_TO_CHECK = [
  { id: 12, name: "Tennis", sampleTournamentIds: [2567, 2571, 2579] }, // Australian Open, Roland Garros
  { id: 23, name: "Volleyball", sampleTournamentIds: [517, 567, 831] }, // SuperLega, Serie A1, PlusLiga
];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Analyse des marchés Pinnacle via l'historique...\n");

  for (const sport of SPORTS_TO_CHECK) {
    console.log(`\n━━━ ${sport.name} (sportId: ${sport.id}) ━━━\n`);

    // 1. Chercher des fixtures récentes (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const from = sixMonthsAgo.toISOString().split("T")[0];
    const to = new Date().toISOString().split("T")[0];

    console.log(`📅 Recherche de fixtures entre ${from} et ${to}...`);

    try {
      const fixtures = await oddsPapiClient.getFixtures({
        sportId: sport.id,
        from,
        to,
      });

      console.log(`   Trouvé ${fixtures.length} fixtures`);

      if (fixtures.length === 0) {
        console.log(`   ⚠️ Aucune fixture trouvée pour ${sport.name}`);
        continue;
      }

      // 2. Prendre quelques fixtures récentes pour analyser les marchés
      const sampleFixtures = fixtures.slice(0, 5);
      const marketTypes = new Set<string>();
      const marketPeriods = new Set<string>();
      const sampleMarkets = new Map<string, any>();

      console.log(`\n📊 Analyse de ${sampleFixtures.length} fixtures...\n`);

      for (const fixture of sampleFixtures) {
        try {
          console.log(
            `   Fixture: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} (${new Date(fixture.startTime).toLocaleDateString()})`
          );

          const historicalData = await oddsPapiClient.getHistoricalOdds(fixture.id);

          if (historicalData.bookmakers?.pinnacle?.markets) {
            const markets = historicalData.bookmakers.pinnacle.markets;
            const marketEntries = Object.entries(markets);

            console.log(`      → ${marketEntries.length} marchés trouvés`);

            // Analyser les marchés
            for (const [marketKey, marketData] of marketEntries) {
              // Le format de la clé est généralement "marketType_period" ou similaire
              const parts = marketKey.split("_");
              if (parts.length >= 2) {
                const type = parts[0];
                const period = parts[1] || "fulltime";

                marketTypes.add(type);
                marketPeriods.add(period);

                // Garder un exemple de chaque type
                const key = `${type}_${period}`;
                if (!sampleMarkets.has(key)) {
                  sampleMarkets.set(key, {
                    type,
                    period,
                    example: marketKey,
                    data: marketData,
                  });
                }
              }
            }
          }

          await delay(1000); // Rate limit
        } catch (error: any) {
          console.log(`      ⚠️ Erreur: ${error.message}`);
        }
      }

      // 3. Afficher le résumé
      console.log(`\n📋 Résumé pour ${sport.name}:`);
      console.log(`\n   Types de marchés détectés (${marketTypes.size}):`);
      Array.from(marketTypes)
        .sort()
        .forEach((type) => {
          console.log(`      - ${type}`);
        });

      console.log(`\n   Périodes détectées (${marketPeriods.size}):`);
      Array.from(marketPeriods)
        .sort()
        .forEach((period) => {
          console.log(`      - ${period}`);
        });

      console.log(`\n   Exemples de marchés:`);
      sampleMarkets.forEach((market, key) => {
        console.log(`      - ${key}: ${market.example}`);
      });
    } catch (error: any) {
      console.error(`   ❌ Erreur pour ${sport.name}: ${error.message}`);
    }

    await delay(2000);
  }

  console.log("\n✅ Analyse terminée\n");
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
