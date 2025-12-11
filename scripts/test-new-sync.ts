#!/usr/bin/env tsx

/**
 * Script de test de la synchronisation avec le nouveau système (AutoSyncService)
 * Utilise le filtrage par marchés DB que nous venons d'implémenter
 */

import "./load-env";

import { autoSyncService } from "../lib/sync/auto-sync-service";

async function main() {
  console.log("🔄 Test de synchronisation avec filtrage des marchés DB\n");

  const sportId = 10; // Football
  console.log(`📊 Sport ID: ${sportId} (Football)\n`);

  console.log("⏳ Synchronisation en cours...\n");

  try {
    const stats = await autoSyncService.sync({
      sportIds: [sportId],
    });

    console.log("\n━".repeat(50));
    console.log("✅ Synchronisation terminée !\n");
    console.log("📊 Statistiques :");
    console.log(`   Fixtures créés: ${stats.fixturesCreated}`);
    console.log(`   Fixtures finalisés: ${stats.fixturesFinalized}`);
    console.log(`   Openings synchronisés: ${stats.openingsSynced}`);
    console.log(`   Closings synchronisés: ${stats.closingsSynced}`);
    console.log(`   Settlements appliqués: ${stats.settlementsApplied}`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  ${stats.errors.length} erreurs :`);
      stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log("\n━".repeat(50));
    console.log("\n💡 Vérifications à faire :");
    console.log("   1. Regarder les logs ci-dessus pour voir '[Sync] Skipping market X (not in DB)'");
    console.log("   2. Vérifier le nombre d'odds créés avec: npm run check-markets");
    console.log("   3. Tester l'affichage frontend: npm run dev\n");
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error);
  process.exit(1);
});
