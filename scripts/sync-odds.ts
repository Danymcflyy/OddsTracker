#!/usr/bin/env tsx

/**
 * Script de synchronisation manuelle des cotes OddsPapi → Supabase
 * Récupère les cotes actuelles et les stocke dans la base de données
 */

import "./load-env";

import { getSyncService, SPORTS_CONFIG } from "../lib/oddspapi/sync-service";

async function main() {
  console.log("🔄 Synchronisation des cotes OddsPapi → Supabase\n");

  // Lister les sports configurés
  console.log("📋 Sports/ligues configurés :");
  SPORTS_CONFIG.forEach((config, index) => {
    console.log(`   ${index + 1}. ${config.name} (${config.country})`);
  });
  console.log("");

  const syncService = getSyncService();

  // Démarrer la sync avec affichage de la progression
  console.log("⏳ Synchronisation en cours...\n");

  const result = await syncService.syncCurrent({
    onProgress: (progress) => {
      if (progress.currentLeague) {
        console.log(`   → ${progress.currentLeague}...`);
      }
    },
  });

  console.log("\n━".repeat(50));

  if (result.success) {
    console.log("✅ Synchronisation terminée avec succès !\n");
    console.log("📊 Statistiques :");
    console.log(`   Fixtures traités: ${result.progress.fixturesProcessed}`);
    console.log(`   Cotes ajoutées: ${result.progress.oddsAdded}`);
    console.log(`   Requêtes API: ${result.progress.requestsUsed}`);

    if (result.progress.startTime && result.progress.endTime) {
      const duration =
        result.progress.endTime.getTime() - result.progress.startTime.getTime();
      console.log(`   Durée: ${(duration / 1000).toFixed(2)}s`);
    }

    if (result.progress.errors.length > 0) {
      console.log(`\n⚠️  ${result.progress.errors.length} avertissements :`);
      result.progress.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
    }
  } else {
    console.log("❌ La synchronisation a échoué\n");
    console.log("📊 Statistiques :");
    console.log(`   Fixtures traités: ${result.progress.fixturesProcessed}`);
    console.log(`   Cotes ajoutées: ${result.progress.oddsAdded}`);
    console.log(`   Requêtes API: ${result.progress.requestsUsed}`);

    if (result.progress.errors.length > 0) {
      console.log(`\n❌ Erreurs :`);
      result.progress.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
    }
  }

  console.log("━".repeat(50));

  console.log("\n💡 Prochaines étapes :");
  console.log("   1. Vérifier les données dans Supabase Table Editor");
  console.log("   2. Consulter les logs dans la table sync_logs");
  console.log("   3. Lancer l'application : npm run dev\n");
}

main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error);
  process.exit(1);
});
