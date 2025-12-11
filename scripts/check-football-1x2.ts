import "./load-env";

import { supabaseAdmin } from "@/lib/db";

async function main() {
  console.log("🔍 Vérification des marchés 1X2 Football...\n");

  const { data: sport } = await supabaseAdmin
    .from("sports")
    .select("id")
    .eq("oddspapi_id", 10)
    .single();

  if (!sport) {
    console.error("❌ Sport Football non trouvé");
    return;
  }

  const { data: markets } = await supabaseAdmin
    .from("markets")
    .select(`
      id,
      oddspapi_id,
      market_type,
      period,
      handicap,
      active,
      outcomes:outcomes(id, oddspapi_id, name, description)
    `)
    .eq("sport_id", sport.id)
    .eq("market_type", "1x2")
    .eq("active", true)
    .order("period");

  console.log(`📊 Total marchés 1X2 actifs: ${markets?.length || 0}\n`);

  markets?.forEach((market: any, index: number) => {
    console.log(`${index + 1}. [ID ${market.id}] 1X2 - Period: ${market.period} - OddsPapi ID: ${market.oddspapi_id}`);
    console.log(`   Outcomes (${market.outcomes.length}):`);
    market.outcomes.forEach((outcome: any) => {
      console.log(`      - [${outcome.oddspapi_id}] ${outcome.name} ${outcome.description ? `(${outcome.description})` : ""}`);
    });
    console.log("");
  });

  // Vérifier spreads aussi
  const { data: spreads } = await supabaseAdmin
    .from("markets")
    .select("id, oddspapi_id, market_type, period, handicap, active")
    .eq("sport_id", sport.id)
    .eq("market_type", "spreads")
    .eq("active", true)
    .order("period, handicap");

  console.log(`\n📊 Marchés Spreads actifs: ${spreads?.length || 0}\n`);
  spreads?.forEach((spread: any, index: number) => {
    console.log(`${index + 1}. [ID ${spread.id}] Spreads - Period: ${spread.period} - Handicap: ${spread.handicap}`);
  });
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
