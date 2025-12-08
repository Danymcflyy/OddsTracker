#!/usr/bin/env tsx

/**
 * Script de test de l'API OddsPapi
 * Vérifie la connexion et affiche les informations de quota
 */

import "./load-env";

import { checkApiStatus, getSports, getOdds } from "../lib/oddspapi/client";

async function main() {
  console.log("🧪 Test de connexion à l'API OddsPapi\n");

  // 1. Vérifier la connexion
  console.log("1️⃣  Vérification de la connexion...");
  const status = await checkApiStatus();

  if (!status.connected) {
    console.error("❌ Erreur de connexion:", status.error);
    console.log("\n💡 Vérifiez que ODDSPAPI_API_KEY est défini dans .env.local");
    process.exit(1);
  }

  console.log("✅ Connexion réussie !");
  console.log(`   Requêtes utilisées: ${status.requestsUsed || "N/A"}`);
  console.log(`   Requêtes restantes: ${status.requestsRemaining || "N/A"}\n`);

  // 2. Lister les sports disponibles
  console.log("2️⃣  Récupération des sports disponibles...");
  const sportsResult = await getSports();

  if (!sportsResult.success || !sportsResult.data) {
    console.error("❌ Erreur:", sportsResult.error);
    process.exit(1);
  }

  console.log(`✅ ${sportsResult.data.length} sports disponibles :`);
  sportsResult.data.slice(0, 10).forEach((sport) => {
    console.log(`   - ${sport.title} (${sport.key})`);
  });
  console.log(`   ... et ${sportsResult.data.length - 10} autres\n`);

  // 3. Tester la récupération de cotes (Premier League)
  console.log("3️⃣  Test de récupération de cotes (Premier League)...");
  const oddsResult = await getOdds("soccer_epl", {
    regions: "eu",
    markets: "h2h",
    bookmakers: "pinnacle",
  });

  if (!oddsResult.success || !oddsResult.data) {
    console.error("❌ Erreur:", oddsResult.error);
  } else {
    console.log(`✅ ${oddsResult.data.length} événements récupérés`);

    if (oddsResult.data.length > 0) {
      const firstEvent = oddsResult.data[0];
      console.log(`\n   Exemple d'événement :`);
      console.log(`   ${firstEvent.home_team} vs ${firstEvent.away_team}`);
      console.log(`   Date: ${new Date(firstEvent.commence_time).toLocaleString("fr-FR")}`);

      const pinnacle = firstEvent.bookmakers?.find((b) =>
        b.key.toLowerCase().includes("pinnacle")
      );
      if (pinnacle && pinnacle.markets.length > 0) {
        const h2h = pinnacle.markets.find((m) => m.key === "h2h");
        if (h2h) {
          console.log(`   Cotes Pinnacle (1X2):`);
          h2h.outcomes.forEach((o) => {
            console.log(`     ${o.name}: ${o.price}`);
          });
        }
      }
    }
  }

  console.log(`\n   Requêtes utilisées: ${oddsResult.requestsUsed || "N/A"}`);
  console.log(`   Requêtes restantes: ${oddsResult.requestsRemaining || "N/A"}\n`);

  // Résumé
  console.log("━".repeat(50));
  console.log("✅ Test terminé avec succès !");
  console.log("━".repeat(50));
  console.log("\n💡 Prochaines étapes :");
  console.log("   1. Exécuter la migration SQL dans Supabase");
  console.log("   2. Lancer une synchronisation : npm run sync:manual");
  console.log("   3. Visualiser les données dans Supabase Table Editor\n");
}

main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error);
  process.exit(1);
});
