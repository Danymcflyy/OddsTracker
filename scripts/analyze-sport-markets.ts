import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  const SPORTS_TO_ANALYZE = [
    { id: 12, name: "🎾 Tennis" },
    { id: 23, name: "🏐 Volleyball" },
  ];

  console.log("🔎 Analyse détaillée des marchés Tennis & Volleyball...\n");

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  for (const sport of SPORTS_TO_ANALYZE) {
    const sportMarkets = definitions.filter((d) => d.sportId === sport.id);

    console.log(`\n━━━ ${sport.name} (${sportMarkets.length} marchés) ━━━\n`);

    // Grouper par période
    const byPeriod = new Map<string, typeof sportMarkets>();
    sportMarkets.forEach((m) => {
      const period = m.period || "unknown";
      const list = byPeriod.get(period) ?? [];
      list.push(m);
      byPeriod.set(period, list);
    });

    console.log("📅 Périodes disponibles :\n");
    const periods = Array.from(byPeriod.keys()).sort();
    periods.forEach((period) => {
      const count = byPeriod.get(period)!.length;
      console.log(`   ${period.padEnd(20)} : ${count} marchés`);
    });

    // Pour chaque période, afficher les types
    console.log("\n📊 Types de marchés par période :\n");
    for (const period of periods) {
      const periodMarkets = byPeriod.get(period)!;

      // Grouper par type
      const byType = new Map<string, typeof periodMarkets>();
      periodMarkets.forEach((m) => {
        const type = m.marketType || "unknown";
        const list = byType.get(type) ?? [];
        list.push(m);
        byType.set(type, list);
      });

      console.log(`   🔹 ${period.toUpperCase()}`);
      const types = Array.from(byType.keys()).sort();
      types.forEach((type) => {
        const count = byType.get(type)!.length;
        console.log(`      - ${type.padEnd(25)} : ${count} marchés`);

        // Afficher quelques exemples avec handicaps
        const examples = byType.get(type)!.slice(0, 3);
        examples.forEach((ex) => {
          const handicapInfo = ex.handicap !== undefined ? ` (handicap: ${ex.handicap})` : "";
          console.log(`         • [${ex.marketId}] ${ex.marketName}${handicapInfo}`);
        });
      });
      console.log("");
    }

    // Résumé des types uniques
    const allTypes = new Set(sportMarkets.map((m) => m.marketType));
    console.log("🎯 Résumé - Types de marchés uniques :");
    console.log(`   ${Array.from(allTypes).sort().join(", ")}\n`);

    // Résumé pour la config
    console.log("💡 Configuration suggérée pour seed-main-markets.ts :");
    console.log("```typescript");
    console.log(`  ${sport.id}: {`);
    console.log(`    types: [${Array.from(allTypes).map((t) => `"${t.toLowerCase()}"`).join(", ")}],`);
    console.log(`    periods: [${periods.map((p) => `"${p}"`).join(", ")}],`);
    console.log(`    // TODO: Définir les lignes pour totals et spreads`);
    console.log(`  },`);
    console.log("```\n");
  }
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
