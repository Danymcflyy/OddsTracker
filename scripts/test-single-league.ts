#!/usr/bin/env tsx

/**
 * Script de test pour une seule ligue
 * Teste l'intégration complète avant l'extraction massive
 *
 * Usage: npm run test:single-league
 */

import { getSyncService } from "../lib/oddspapi/sync-service";
import { getOdds, getScores } from "../lib/oddspapi/client";

// Configuration du test
const TEST_CONFIG = {
  sportKey: "soccer_epl",       // Premier League
  sportName: "Premier League",
  sportSlug: "football",
  country: "England",
};

async function main() {
  console.log("🧪 TEST D'EXTRACTION - UNE SEULE LIGUE\n");
  console.log("═".repeat(60));
  console.log(`Sport: ${TEST_CONFIG.sportName}`);
  console.log(`Clé API: ${TEST_CONFIG.sportKey}`);
  console.log("═".repeat(60));
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // ÉTAPE 1 : Tester la récupération des cotes
  // ═══════════════════════════════════════════════════════════
  console.log("📊 ÉTAPE 1 : Récupération des cotes\n");

  try {
    const oddsResult = await getOdds(TEST_CONFIG.sportKey, {
      regions: "eu",
      markets: "h2h,spreads,totals",
      bookmakers: "pinnacle",
      oddsFormat: "decimal",
    });

    if (!oddsResult.success || !oddsResult.data) {
      console.log("❌ Échec de la récupération des cotes");
      console.log(`   Erreur: ${oddsResult.error || "Données vides"}`);
      process.exit(1);
    }

    console.log(`✅ Cotes récupérées avec succès`);
    console.log(`   Événements trouvés: ${oddsResult.data.length}`);
    console.log(`   Requêtes API utilisées: ${oddsResult.requestsUsed}`);

    if (oddsResult.data.length === 0) {
      console.log("\n⚠️  Aucun événement à venir pour cette ligue");
      console.log("   Conseil: Testez avec une autre ligue active (ex: soccer_spain_la_liga)\n");
      process.exit(0);
    }

    // Afficher un exemple d'événement
    const sampleEvent = oddsResult.data[0];
    console.log(`\n   Exemple d'événement:`);
    console.log(`   - Match: ${sampleEvent.home_team} vs ${sampleEvent.away_team}`);
    console.log(`   - Date: ${new Date(sampleEvent.commence_time).toLocaleString("fr-FR")}`);
    console.log(`   - Bookmakers: ${sampleEvent.bookmakers?.length || 0}`);
    console.log("");

  } catch (error) {
    console.log(`❌ Erreur lors de la récupération des cotes:`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════
  // ÉTAPE 2 : Tester la récupération des scores
  // ═══════════════════════════════════════════════════════════
  console.log("🏆 ÉTAPE 2 : Récupération des scores\n");

  try {
    const scoresResult = await getScores(TEST_CONFIG.sportKey, {
      daysFrom: 3, // Derniers 3 jours
    });

    if (!scoresResult.success) {
      console.log("⚠️  Échec de la récupération des scores (non bloquant)");
      console.log(`   Erreur: ${scoresResult.error || "Données vides"}`);
    } else {
      console.log(`✅ Scores récupérés avec succès`);
      console.log(`   Matchs terminés: ${scoresResult.data?.length || 0}`);
      console.log(`   Requêtes API utilisées: ${scoresResult.requestsUsed}`);

      if (scoresResult.data && scoresResult.data.length > 0) {
        const sampleScore = scoresResult.data[0];
        const homeScore = sampleScore.scores?.find((s) => s.name === sampleScore.home_team)?.score;
        const awayScore = sampleScore.scores?.find((s) => s.name === sampleScore.away_team)?.score;

        console.log(`\n   Exemple de score:`);
        console.log(`   - Match: ${sampleScore.home_team} ${homeScore || "?"} - ${awayScore || "?"} ${sampleScore.away_team}`);
        console.log(`   - Statut: ${sampleScore.completed ? "Terminé" : "En cours"}`);
      }
    }
    console.log("");

  } catch (error) {
    console.log(`⚠️  Erreur lors de la récupération des scores (non bloquant):`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
  }

  // ═══════════════════════════════════════════════════════════
  // ÉTAPE 3 : Tester la synchronisation dans Supabase
  // ═══════════════════════════════════════════════════════════
  console.log("💾 ÉTAPE 3 : Synchronisation dans Supabase\n");

  try {
    const syncService = getSyncService();

    // On va synchroniser uniquement cette ligue
    // On doit temporairement modifier SPORTS_CONFIG
    const originalConfig = require("../lib/oddspapi/sync-service").SPORTS_CONFIG;

    // Créer un config temporaire avec seulement notre ligue de test
    const testSportsConfig = [
      {
        key: TEST_CONFIG.sportKey,
        name: TEST_CONFIG.sportName,
        sport_slug: TEST_CONFIG.sportSlug,
        country: TEST_CONFIG.country,
      },
    ];

    console.log(`   Synchronisation de ${TEST_CONFIG.sportName}...`);
    console.log("");

    const result = await syncService.syncCurrent({
      onProgress: (progress) => {
        if (progress.currentLeague) {
          console.log(`   → ${progress.currentLeague}`);
        }
      },
      // @ts-ignore - Injection temporaire du config de test
      _testConfig: testSportsConfig,
    });

    console.log("");
    console.log("═".repeat(60));

    if (result.success) {
      console.log("✅ SYNCHRONISATION RÉUSSIE !\n");
      console.log("📊 Statistiques:");
      console.log(`   Fixtures traités: ${result.progress.fixturesProcessed}`);
      console.log(`   Cotes ajoutées: ${result.progress.oddsAdded}`);
      console.log(`   Requêtes API: ${result.progress.requestsUsed}`);

      if (result.progress.startTime && result.progress.endTime) {
        const duration =
          result.progress.endTime.getTime() - result.progress.startTime.getTime();
        console.log(`   Durée: ${(duration / 1000).toFixed(2)}s`);
      }

      if (result.progress.errors.length > 0) {
        console.log(`\n⚠️  Avertissements (${result.progress.errors.length}):`);
        result.progress.errors.forEach((error) => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.log("❌ ÉCHEC DE LA SYNCHRONISATION\n");
      console.log("❌ Erreurs:");
      result.progress.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
      process.exit(1);
    }

  } catch (error) {
    console.log(`❌ Erreur lors de la synchronisation:`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
    if (error instanceof Error && error.stack) {
      console.log(`\n   Stack trace:`);
      console.log(`   ${error.stack}`);
    }
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════
  // ÉTAPE 4 : Vérification dans Supabase
  // ═══════════════════════════════════════════════════════════
  console.log("\n═".repeat(60));
  console.log("🔍 ÉTAPE 4 : Vérification des données\n");

  try {
    const { supabaseAdmin } = await import("../lib/db");

    // Compter les fixtures
    const { count: fixturesCount, error: fixturesError } = await supabaseAdmin
      .from("fixtures")
      .select("*", { count: "exact", head: true });

    if (fixturesError) throw fixturesError;

    console.log(`✅ Fixtures en base: ${fixturesCount}`);

    // Compter les cotes
    const { count: oddsCount, error: oddsError } = await supabaseAdmin
      .from("odds")
      .select("*", { count: "exact", head: true });

    if (oddsError) throw oddsError;

    console.log(`✅ Cotes en base: ${oddsCount}`);

    // Afficher quelques fixtures
    const { data: fixtures, error: fetchError } = await supabaseAdmin
      .from("fixtures")
      .select(
        `
        id,
        start_time,
        home_team:teams!fixtures_home_team_id_fkey(name),
        away_team:teams!fixtures_away_team_id_fkey(name),
        league:leagues(name)
      `
      )
      .order("start_time", { ascending: false })
      .limit(3);

    if (fetchError) throw fetchError;

    if (fixtures && fixtures.length > 0) {
      console.log(`\n   Exemples de fixtures insérés:`);
      fixtures.forEach((f: any, i: number) => {
        console.log(`   ${i + 1}. ${f.home_team?.name} vs ${f.away_team?.name}`);
        console.log(`      - Ligue: ${f.league?.name}`);
        console.log(`      - Date: ${new Date(f.start_time).toLocaleString("fr-FR")}`);
      });
    }

  } catch (error) {
    console.log(`⚠️  Erreur lors de la vérification (non bloquant):`);
    console.log(`   ${error instanceof Error ? error.message : error}`);
  }

  // ═══════════════════════════════════════════════════════════
  // CONCLUSION
  // ═══════════════════════════════════════════════════════════
  console.log("\n═".repeat(60));
  console.log("✅ TEST TERMINÉ AVEC SUCCÈS !\n");
  console.log("💡 Prochaines étapes:");
  console.log("   1. Vérifier les données dans Supabase Table Editor");
  console.log("   2. Si tout est OK, lancer la sync complète: npm run sync:odds");
  console.log("   3. Adapter SPORTS_CONFIG avec toutes les ligues souhaitées");
  console.log("═".repeat(60));
  console.log("");
}

main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error);
  process.exit(1);
});
