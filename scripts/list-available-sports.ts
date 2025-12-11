import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Récupération de tous les sports disponibles avec Pinnacle...\n");

  try {
    // 1. Tous les sports de l'API
    const allSports = await oddsPapiClient.getSports();
    console.log(`📋 Total des sports dans l'API OddsPapi : ${allSports.length}\n`);

    // 2. Vérifier lesquels ont des définitions de marchés Pinnacle
    const marketDefinitions = await oddsPapiClient.getMarkets({ language: "en" });

    const sportsWithMarkets = new Map<number, { name: string; marketCount: number }>();

    marketDefinitions.forEach((def) => {
      const sport = allSports.find((s) => s.id === def.sportId);
      const sportName = sport ? sport.name : `Unknown (${def.sportId})`;

      if (!sportsWithMarkets.has(def.sportId)) {
        sportsWithMarkets.set(def.sportId, { name: sportName, marketCount: 0 });
      }

      sportsWithMarkets.get(def.sportId)!.marketCount++;
    });

    console.log("✅ Sports avec des marchés Pinnacle :\n");

    const sortedSports = Array.from(sportsWithMarkets.entries()).sort((a, b) =>
      b[1].marketCount - a[1].marketCount
    );

    sortedSports.forEach(([sportId, info]) => {
      const emoji = sportId === 10 ? "⚽" :
                    sportId === 12 ? "🎾" :
                    sportId === 15 ? "🏒" :
                    sportId === 23 ? "🏐" : "🏅";

      console.log(`   ${emoji} [${sportId}] ${info.name.padEnd(25)} : ${info.marketCount} marchés`);
    });

    // 3. Nos sports cibles
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🎯 Statut de nos sports cibles :\n");

    const targetSports = [
      { id: 10, name: "Football ⚽" },
      { id: 12, name: "Tennis 🎾" },
      { id: 15, name: "Hockey 🏒" },
      { id: 23, name: "Volleyball 🏐" },
    ];

    targetSports.forEach((target) => {
      const info = sportsWithMarkets.get(target.id);
      if (info) {
        console.log(`   ✅ ${target.name.padEnd(20)} : ${info.marketCount} marchés disponibles`);
      } else {
        console.log(`   ❌ ${target.name.padEnd(20)} : NON DISPONIBLE chez Pinnacle`);
      }
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
