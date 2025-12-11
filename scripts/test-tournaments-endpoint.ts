import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

async function main() {
  console.log("🔍 Test de l'endpoint /odds-by-tournaments\n");

  try {
    // Utiliser un seul tournament ID pour le test
    const TEST_TOURNAMENT = { id: 34, name: "Ligue 1", sport: "Football" };

    console.log("📋 Championnat de test :");
    console.log(`  - [${TEST_TOURNAMENT.id}] ${TEST_TOURNAMENT.name} (${TEST_TOURNAMENT.sport})`);

    console.log(`\n🎯 Test avec tournament ID : ${TEST_TOURNAMENT.id}\n`);

    const tournamentIds = [TEST_TOURNAMENT.id];

    // Appeler l'endpoint /odds-by-tournaments
    const oddsList = await oddsPapiClient.getOddsByTournaments(tournamentIds);

    console.log("═".repeat(80));
    console.log("📊 RÉPONSE DE L'API");
    console.log("═".repeat(80));

    console.log(`\n✅ Total matchs retournés : ${oddsList?.length || 0}\n`);

    if (!oddsList || oddsList.length === 0) {
      console.log("⚠️  Aucun match retourné (normal si pas de matchs à venir)");
      return;
    }

    // Afficher la structure du premier match pour comprendre le format brut
    console.log("🔍 STRUCTURE DU PREMIER MATCH :");
    console.log("─".repeat(80));
    console.log(JSON.stringify(oddsList[0], null, 2));
    console.log("─".repeat(80));
    console.log("\n");

    oddsList.slice(0, 3).forEach((fixture, index) => {
      console.log(`\n📍 Match ${index + 1}`);
      console.log("─".repeat(80));
      console.log(`  Fixture ID : ${fixture.fixtureId}`);
      console.log(`  Tournament : ${fixture.tournamentId}`);
      console.log(`  Sport ID   : ${fixture.sportId}`);
      console.log(`  Dernière MAJ : ${fixture.lastUpdated}`);

      const marketCount = fixture.markets?.length ?? 0;
      console.log(`\n  📈 Marchés disponibles: ${marketCount}`);

      fixture.markets?.slice(0, 3).forEach((market) => {
        console.log(`\n    📌 Market ID ${market.marketId} – ${market.marketName}`);
        market.outcomes?.forEach((outcome) => {
          console.log(
            `       - Outcome ${outcome.outcomeId} (${outcome.outcomeName}) : ${outcome.price}${
              typeof outcome.line === "number" ? ` [line=${outcome.line}]` : ""
            }`
          );
        });
      });
      if (marketCount > 3) {
        console.log(`\n    ... et ${marketCount - 3} autres marchés`);
      }

      const pinnacleMarkets = fixture.bookmakerOdds?.pinnacle?.markets;
      if (pinnacleMarkets) {
        const ids = Object.keys(pinnacleMarkets);
        console.log(`\n  🎰 Bookmaker Pinnacle: ${ids.length} marchés`);
        ids.slice(0, 2).forEach((marketId) => {
          const bookmakerMarket = pinnacleMarkets[marketId];
          if (!bookmakerMarket) return;
          console.log(`    - Market ${marketId}`);
          Object.entries(bookmakerMarket.outcomes ?? {}).forEach(([outcomeId, outcome]) => {
            const price = outcome.players?.["0"]?.price;
            console.log(`        Outcome ${outcomeId}: ${price ?? "N/A"}`);
          });
        });
        if (ids.length > 2) {
          console.log(`    ... et ${ids.length - 2} autres marchés bookmaker`);
        }
      } else {
        console.log("\n  🎰 Aucun détail bookmaker (pinnacle) renvoyé.");
      }
    });

    if (oddsList.length > 3) {
      console.log(`\n... et ${oddsList.length - 3} autres matchs`);
    }

    console.log("\n" + "═".repeat(80));
    console.log("🔍 ANALYSE");
    console.log("═".repeat(80));

    let totalMarkets = 0;
    let totalOutcomes = 0;

    oddsList.forEach((fixture) => {
      fixture.markets?.forEach((market) => {
        totalMarkets += 1;
        totalOutcomes += market.outcomes?.length ?? 0;
      });
    });

    console.log(`\n📊 Statistiques :`);
    console.log(`  - Marchés collectés : ${totalMarkets}`);
    console.log(`  - Issues collectées : ${totalOutcomes}`);

    const fixturesWithMarkets = oddsList.filter((fixture) => (fixture.markets?.length ?? 0) > 0)
      .length;
    console.log(`  - Matchs avec cotes : ${fixturesWithMarkets}`);
    console.log(`  - Matchs sans cotes : ${oddsList.length - fixturesWithMarkets}`);

  } catch (error: any) {
    console.error("\n💥 ERREUR DÉTAILLÉE");
    console.error("═".repeat(80));
    console.error("Message:", error.message);
    console.error("Type:", error.name);

    if (error.status) {
      console.error("Status HTTP:", error.status);
    }

    if (error.body) {
      console.error("\nBody de la réponse:");
      console.error(JSON.stringify(error.body, null, 2));
    }

    if (error.response) {
      console.error("\nResponse axios:");
      console.error("  Status:", error.response.status);
      console.error("  Data:", error.response.data);
    }

    console.error("\nStack trace:");
    console.error(error.stack);
  }
}

main().catch((error) => {
  console.error("💥 Erreur fatale:", error);
  process.exit(1);
});
