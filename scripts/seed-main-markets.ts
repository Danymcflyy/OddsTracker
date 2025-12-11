import "./load-env";

import { supabaseAdmin } from "@/lib/db";
import { oddsPapiClient } from "@/lib/api/oddspapi";

// Configuration des marchés principaux par sport
const MAIN_MARKETS_CONFIG = {
  // Football (10)
  10: {
    types: ["1x2", "totals", "spreads"],
    periods: ["fulltime", "p1"], // p1 = 1ère mi-temps dans Pinnacle
    totalsLines: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5],
    totalsLinesP1: [0.5, 1.5, 2.5], // Mi-temps : moins de buts
    spreadsLines: [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3],
    spreadsLinesP1: [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2],
  },
  // Tennis (12)
  12: {
    types: ["moneyline", "totals-games", "spreads-games", "totals"],
    periods: ["result"],
    totalsGamesLines: [20.5, 21.5, 22.5, 23.5, 24.5], // Total games du match
    spreadGamesLines: [-7.5, -6.5, -5.5, -4.5, -3.5, -2.5, -1.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5], // Game handicap
    totalsLines: [2.5, 3.5, 4.5], // Total sets
    spreadsLines: [-2.5, -1.5, 1.5, 2.5], // Set handicap
  },
  // Hockey (15)
  15: {
    types: ["1x2", "totals", "spreads"],
    periods: ["fulltime"],
    totalsLines: [4.5, 5.5, 6.5, 7.5],
    spreadsLines: [-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5],
  },
  // Volleyball (23)
  23: {
    types: ["moneyline", "totals", "spreads"],
    periods: ["result"],
    totalsLines: [3.5, 4, 4.5], // Total sets
    spreadsLines: [-2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5], // Set handicap
  },
};

interface MarketToInsert {
  oddspapi_id: number;
  sport_id: number;
  name: string;
  market_type: string;
  period: string;
  handicap: number | null;
  player_prop: boolean;
  description: string | null;
}

async function main() {
  oddsPapiClient.setApiKey(process.env.ODDSPAPI_API_KEY);

  // 1. Récupérer le mapping oddspapi_id -> id depuis la table sports
  console.log("📋 Récupération du mapping des sports...\n");
  const { data: sportsData, error: sportsError } = await supabaseAdmin
    .from("sports")
    .select("id, oddspapi_id");

  if (sportsError || !sportsData) {
    console.error("❌ Erreur lors de la récupération des sports :", sportsError);
    process.exit(1);
  }

  const sportIdMap = new Map<number, number>();
  sportsData.forEach((sport: any) => {
    sportIdMap.set(sport.oddspapi_id, sport.id);
  });

  console.log("Mapping des sports :");
  sportIdMap.forEach((dbId, oddspapiId) => {
    console.log(`   oddspapi_id ${oddspapiId} → DB id ${dbId}`);
  });

  console.log("\n🔎 Récupération des définitions de marchés Pinnacle...\n");
  const definitions = await oddsPapiClient.getMarkets({ language: "en" });

  const marketsToInsert: MarketToInsert[] = [];

  for (const [sportIdStr, config] of Object.entries(MAIN_MARKETS_CONFIG)) {
    const oddspapiSportId = Number(sportIdStr);
    const dbSportId = sportIdMap.get(oddspapiSportId);

    if (!dbSportId) {
      console.log(`\n⚠️  Sport ${oddspapiSportId} non trouvé dans la DB, ignoré.`);
      continue;
    }

    console.log(`\n📊 Traitement du sport ${oddspapiSportId} (DB id: ${dbSportId})...`);

    // Récupérer les définitions pour ce sport
    const sportMarkets = definitions.filter(
      (d) =>
        d.sportId === oddspapiSportId &&
        config.periods.includes(d.period) &&
        config.types.includes(d.marketType.toLowerCase())
    );

    console.log(`   Trouvé ${sportMarkets.length} marchés disponibles`);

    // Filtrer les marchés principaux
    for (const market of sportMarkets) {
      const type = market.marketType.toLowerCase();
      const period = market.period;
      const handicap = market.handicap;

      let shouldInclude = false;

      // 1X2 ou Moneyline : toujours inclure avec handicap 0
      if ((type === "1x2" || type === "moneyline") && handicap === 0) {
        shouldInclude = true;
      }
      // Totals : utiliser les lignes appropriées selon la période
      else if (type === "totals" && handicap !== undefined) {
        const linesToCheck =
          period === "p1" && "totalsLinesP1" in config
            ? (config as any).totalsLinesP1
            : config.totalsLines;
        shouldInclude = linesToCheck.includes(handicap);
      }
      // Totals-Games (Tennis) : utiliser totalsGamesLines
      else if (type === "totals-games" && handicap !== undefined) {
        const linesToCheck = (config as any).totalsGamesLines;
        shouldInclude = linesToCheck && linesToCheck.includes(handicap);
      }
      // Spreads : utiliser les lignes appropriées selon la période
      else if (type === "spreads" && handicap !== undefined) {
        const linesToCheck =
          period === "p1" && "spreadsLinesP1" in config
            ? (config as any).spreadsLinesP1
            : config.spreadsLines;
        shouldInclude = linesToCheck.includes(handicap);
      }
      // Spreads-Games (Tennis) : utiliser spreadGamesLines
      else if (type === "spreads-games" && handicap !== undefined) {
        const linesToCheck = (config as any).spreadGamesLines;
        shouldInclude = linesToCheck && linesToCheck.includes(handicap);
      }

      if (shouldInclude) {
        marketsToInsert.push({
          oddspapi_id: market.marketId,
          sport_id: dbSportId,
          name: market.marketName,
          market_type: market.marketType.toLowerCase(),
          period: market.period,
          handicap: market.handicap ?? null,
          player_prop: market.playerProp,
          description: `${market.marketType} - ${market.period}`,
        });
      }
    }
  }

  console.log(`\n✅ Total de marchés à insérer : ${marketsToInsert.length}\n`);

  // Afficher un résumé
  const summary = marketsToInsert.reduce((acc, m) => {
    const key = `${m.sport_id}_${m.market_type}_${m.period}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("📋 Résumé par sport et type :");
  Object.entries(summary).forEach(([key, count]) => {
    console.log(`   ${key}: ${count} marchés`);
  });

  console.log("\n🔄 Insertion dans la base de données...\n");

  // Insérer dans Supabase (upsert pour éviter les doublons)
  const { data, error } = await supabaseAdmin.from("markets").upsert(
    marketsToInsert,
    {
      onConflict: "oddspapi_id",
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error("❌ Erreur lors de l'insertion :", error);
    process.exit(1);
  }

  console.log("✅ Marchés insérés avec succès !");

  // Vérification
  const { data: inserted, error: checkError } = await supabaseAdmin
    .from("markets")
    .select("id, oddspapi_id, sport_id, market_type, period, handicap")
    .in(
      "oddspapi_id",
      marketsToInsert.map((m) => m.oddspapi_id)
    );

  if (checkError) {
    console.error("❌ Erreur lors de la vérification :", checkError);
    process.exit(1);
  }

  console.log(`\n✅ Vérification : ${inserted?.length || 0} marchés dans la DB\n`);

  // Créer les outcomes pour chaque marché
  console.log("🎯 Création des outcomes...\n");

  const outcomesMap = new Map<number, any>();

  for (const market of inserted || []) {
    const marketType = market.market_type.toLowerCase();
    const marketFromApi = definitions.find((d) => d.marketId === market.oddspapi_id);

    if (!marketFromApi || !marketFromApi.outcomes || !Array.isArray(marketFromApi.outcomes)) continue;

    // Créer outcomes à partir des données API (outcomes est un tableau)
    for (const outcome of marketFromApi.outcomes) {
      const oddspapiId = outcome.outcomeId;

      // Dédupliquer par oddspapi_id (ne garder que le premier)
      if (!outcomesMap.has(oddspapiId)) {
        outcomesMap.set(oddspapiId, {
          oddspapi_id: oddspapiId,
          market_id: market.id,
          name: outcome.outcomeName || outcome.outcome || String(oddspapiId),
          description: outcome.outcomeDescription || null,
        });
      }
    }
  }

  const outcomesToInsert = Array.from(outcomesMap.values());

  if (outcomesToInsert.length > 0) {
    console.log(`   Insertion de ${outcomesToInsert.length} outcomes uniques...`);

    const { error: outcomesError } = await supabaseAdmin.from("outcomes").upsert(
      outcomesToInsert,
      {
        onConflict: "oddspapi_id",
        ignoreDuplicates: false,
      }
    );

    if (outcomesError) {
      console.error("❌ Erreur lors de l'insertion des outcomes :", outcomesError);
    } else {
      console.log("✅ Outcomes insérés avec succès !");
    }
  } else {
    console.log("⚠️  Aucun outcome à insérer");
  }

  // Afficher quelques exemples par sport
  const sportNames: Record<number, string> = {
    10: "⚽ Football",
    12: "🎾 Tennis",
    15: "🏒 Hockey",
    23: "🏐 Volleyball",
  };

  for (const [oddspapiId, dbId] of sportIdMap.entries()) {
    const sportMarkets = inserted?.filter((m: any) => m.sport_id === dbId) || [];
    const sportName = sportNames[oddspapiId] || `Sport ${oddspapiId}`;
    console.log(`${sportName} (DB id: ${dbId}): ${sportMarkets.length} marchés`);
    if (sportMarkets.length > 0) {
      sportMarkets.slice(0, 3).forEach((m: any) => {
        const handicapInfo = m.handicap ? ` (${m.handicap})` : "";
        console.log(`   - [${m.oddspapi_id}] ${m.market_type} ${m.period}${handicapInfo}`);
      });
      if (sportMarkets.length > 3) {
        console.log(`   ... et ${sportMarkets.length - 3} autres`);
      }
    }
  }
}

main().catch((error) => {
  console.error("💥 Erreur:", error);
  process.exit(1);
});
