import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  console.log("🔍 Debug des outcomes des marchés Pinnacle...\n");

  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  // Prendre quelques exemples de chaque type pour football
  const football = definitions.filter((d) => d.sportId === 10);

  const sample1x2 = football.find((m) => m.marketType.toLowerCase() === "1x2");
  const sampleTotal = football.find(
    (m) => m.marketType.toLowerCase() === "totals" && m.period === "fulltime"
  );
  const sampleSpread = football.find(
    (m) => m.marketType.toLowerCase() === "spreads" && m.period === "fulltime"
  );

  console.log("📊 Exemple 1X2 :");
  console.log(JSON.stringify(sample1x2, null, 2));

  console.log("\n📊 Exemple Totals :");
  console.log(JSON.stringify(sampleTotal, null, 2));

  console.log("\n📊 Exemple Spreads :");
  console.log(JSON.stringify(sampleSpread, null, 2));
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
