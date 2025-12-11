import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔎 Vérification des marchés halftime pour Football...\n");

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  // Filtrer pour Football (sport 10)
  const footballMarkets = definitions.filter((d) => d.sportId === 10);

  console.log(`Total marchés football : ${footballMarkets.length}\n`);

  // Grouper par période
  const byPeriod = footballMarkets.reduce((acc: any, m: any) => {
    const period = m.period || "unknown";
    acc[period] = (acc[period] || 0) + 1;
    return acc;
  }, {});

  console.log("📊 Répartition par période :");
  Object.entries(byPeriod)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([period, count]) => {
      console.log(`   ${period.padEnd(20)} : ${count} marchés`);
    });

  // Vérifier si halftime existe
  const halftimeMarkets = footballMarkets.filter((m) => m.period === "halftime");

  console.log(`\n🎯 Marchés halftime trouvés : ${halftimeMarkets.length}`);

  if (halftimeMarkets.length > 0) {
    console.log("\nExemples de marchés halftime :");
    halftimeMarkets.slice(0, 10).forEach((m) => {
      console.log(
        `   [${m.marketId}] ${m.marketType} - ${m.period} ${
          m.handicap !== undefined ? `(${m.handicap})` : ""
        }`
      );
    });
  } else {
    console.log("\n⚠️  Aucun marché avec period='halftime' trouvé !");
    console.log("\nPériodes disponibles :");
    Object.keys(byPeriod).forEach((period) => console.log(`   - ${period}`));
  }
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
