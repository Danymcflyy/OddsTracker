import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

const TARGET_SPORTS = [10, 12, 15, 23];
const SPORT_NAMES: Record<number, string> = {
  10: "⚽ Football",
  12: "🎾 Tennis",
  15: "🏒 Hockey sur glace",
  23: "🏐 Volleyball",
};

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Vérification de la disponibilité Pinnacle...\n");

  // 1. Vérifier les sports disponibles
  console.log("📋 Étape 1 : Sports disponibles dans l'API");
  const allSports = await oddsPapiClient.getSports();
  console.log(`   Total sports : ${allSports.length}\n`);

  for (const sportId of TARGET_SPORTS) {
    const sport = allSports.find((s) => s.id === sportId);
    if (sport) {
      console.log(`   ✅ ${SPORT_NAMES[sportId]} (${sport.slug}) - DISPONIBLE`);
    } else {
      console.log(`   ❌ ${SPORT_NAMES[sportId]} - NON DISPONIBLE`);
    }
  }

  // 2. Vérifier les définitions de marchés
  console.log("\n📊 Étape 2 : Définitions de marchés Pinnacle");
  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  for (const sportId of TARGET_SPORTS) {
    const sportMarkets = definitions.filter((d) => d.sportId === sportId);
    const fulltimeMarkets = sportMarkets.filter((d) => d.period === "fulltime");
    const halftimeMarkets = sportMarkets.filter((d) => d.period === "halftime");

    console.log(`\n   ${SPORT_NAMES[sportId]}`);
    console.log(`      Total marchés : ${sportMarkets.length}`);
    console.log(`      - Fulltime : ${fulltimeMarkets.length}`);
    console.log(`      - Halftime : ${halftimeMarkets.length}`);

    if (sportMarkets.length > 0) {
      const types = new Set(sportMarkets.map((m) => m.marketType));
      console.log(`      Types : ${Array.from(types).join(", ")}`);
    }
  }

  // 3. Vérifier les tournois disponibles
  console.log("\n🏆 Étape 3 : Tournois disponibles (avec bookmaker=pinnacle)");

  for (const sportId of TARGET_SPORTS) {
    try {
      const tournaments = await oddsPapiClient.getTournaments(sportId);
      const withFixtures = tournaments.filter(
        (t) => t.futureFixtures > 0 || t.upcomingFixtures > 0 || t.liveFixtures > 0
      );

      console.log(`\n   ${SPORT_NAMES[sportId]}`);
      console.log(`      Total tournois : ${tournaments.length}`);
      console.log(`      Tournois avec fixtures : ${withFixtures.length}`);

      if (withFixtures.length > 0) {
        console.log(`      Exemples :`);
        withFixtures.slice(0, 3).forEach((t) => {
          console.log(
            `         - ${t.tournamentName} (${t.categoryName}) • ${t.futureFixtures + t.upcomingFixtures} fixtures`
          );
        });
      }
    } catch (error: any) {
      console.log(`\n   ${SPORT_NAMES[sportId]}`);
      console.log(`      ❌ Erreur : ${error.message}`);
    }

    await delay(500);
  }

  console.log("\n✅ Vérification terminée\n");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
