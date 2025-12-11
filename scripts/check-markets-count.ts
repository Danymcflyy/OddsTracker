import "./load-env";

import { supabaseAdmin } from "@/lib/db";

async function main() {
  console.log("📊 Vérification des marchés en base de données...\n");

  // Compter par sport
  const { data: sports } = await supabaseAdmin
    .from("sports")
    .select("id, name, slug");

  if (!sports) {
    console.error("❌ Impossible de charger les sports");
    return;
  }

  for (const sport of sports) {
    const { data: markets } = await supabaseAdmin
      .from("markets")
      .select("id, market_type, period, handicap")
      .eq("sport_id", sport.id);

    console.log(`\n🏆 ${sport.name} (${sport.slug})`);
    console.log(`   Total: ${markets?.length || 0} marchés`);

    if (markets && markets.length > 0) {
      // Grouper par period
      const byPeriod = markets.reduce((acc: any, m: any) => {
        const period = m.period || "unknown";
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      }, {});

      console.log(`   Par période:`);
      Object.entries(byPeriod).forEach(([period, count]) => {
        console.log(`      - ${period}: ${count} marchés`);
      });

      // Grouper par type
      const byType = markets.reduce((acc: any, m: any) => {
        const type = m.market_type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      console.log(`   Par type:`);
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`      - ${type}: ${count} marchés`);
      });
    }

    // Vérifier outcomes
    const { count: outcomesCount } = await supabaseAdmin
      .from("outcomes")
      .select("id", { count: "exact", head: true })
      .in(
        "market_id",
        markets?.map((m: any) => m.id) || []
      );

    console.log(`   Outcomes: ${outcomesCount || 0} outcomes au total`);
  }
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
