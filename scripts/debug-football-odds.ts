import "./load-env";

import { supabaseAdmin } from "@/lib/db";

async function main() {
  console.log("🔍 Debug des odds Football...\n");

  // Récupérer un fixture avec ses odds
  const { data: fixtures } = await supabaseAdmin
    .from("fixtures")
    .select(`
      id,
      home_team:home_team_id(name),
      away_team:away_team_id(name),
      odds:odds(
        id,
        opening_price,
        closing_price,
        market:market_id(
          id,
          oddspapi_id,
          name,
          description,
          market_type,
          period,
          handicap
        ),
        outcome:outcome_id(
          id,
          oddspapi_id,
          name,
          description
        )
      )
    `)
    .eq("sport_id", 10)
    .limit(1);

  if (!fixtures || fixtures.length === 0) {
    console.log("❌ Aucun fixture trouvé");
    return;
  }

  const fixture = fixtures[0];
  console.log(`📊 Fixture: ${fixture.home_team?.name} vs ${fixture.away_team?.name}`);
  console.log(`Total odds: ${fixture.odds?.length || 0}\n`);

  // Grouper par type de marché
  const oddsByType = new Map<string, any[]>();

  fixture.odds?.forEach((odd: any) => {
    const marketType = odd.market?.market_type || "unknown";
    if (!oddsByType.has(marketType)) {
      oddsByType.set(marketType, []);
    }
    oddsByType.get(marketType)!.push(odd);
  });

  // Afficher par type
  console.log("═".repeat(80));

  for (const [type, odds] of oddsByType.entries()) {
    console.log(`\n📌 ${type.toUpperCase()} (${odds.length} odds)`);
    console.log("─".repeat(80));

    // Afficher quelques exemples
    odds.slice(0, 5).forEach((odd: any) => {
      console.log(`\n  Market ID: ${odd.market?.id}`);
      console.log(`  Market Name: "${odd.market?.name}"`);
      console.log(`  Market Description: "${odd.market?.description || "null"}"`);
      console.log(`  Period: ${odd.market?.period}`);
      console.log(`  Handicap: ${odd.market?.handicap}`);
      console.log(`  Outcome Name: "${odd.outcome?.name}"`);
      console.log(`  Outcome Description: "${odd.outcome?.description || "null"}"`);
      console.log(`  Opening: ${odd.opening_price}`);
    });

    if (odds.length > 5) {
      console.log(`\n  ... et ${odds.length - 5} autres odds`);
    }
  }

  console.log("\n" + "═".repeat(80));
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
