/**
 * Script de synchronisation pour GitHub Actions
 * Exécute directement dans GitHub Actions (pas via Vercel)
 *
 * Avantages:
 * - Timeout: 6 heures (vs 60s sur Vercel Hobby)
 * - Gratuit illimité sur repo public
 * - Pas de limite de scalabilité
 */

import './load-env';
import { discoverMatches } from '@/lib/api/v3/match-discovery';
import { captureOdds } from '@/lib/api/v3/odds-capture';

async function main() {
  const startTime = Date.now();

  console.log('🚀 ===== DÉBUT SYNC GITHUB ACTIONS =====');
  console.log(`⏰ ${new Date().toISOString()}`);

  try {
    // Étape 1: Découverte de matchs
    console.log('\n📋 ÉTAPE 1: Découverte de matchs...');
    const discoveryResult = await discoverMatches('football');

    console.log(`  ✅ ${discoveryResult.discovered} nouveaux matchs`);
    console.log(`  🔄 ${discoveryResult.updated} matchs mis à jour`);

    if (discoveryResult.errors.length > 0) {
      console.warn(`  ⚠️  ${discoveryResult.errors.length} erreurs de découverte`);
      discoveryResult.errors.forEach(err => console.error(`     - ${err}`));
    }

    // Étape 2: Capture de cotes
    console.log('\n🎯 ÉTAPE 2: Capture de cotes...');
    const oddsResult = await captureOdds('football', null);

    console.log(`  ✅ ${oddsResult.matches_updated} matchs traités`);
    console.log(`  📊 ${oddsResult.odds_captured} cotes capturées`);

    if (oddsResult.errors.length > 0) {
      console.warn(`  ⚠️  ${oddsResult.errors.length} erreurs de capture`);
      oddsResult.errors.forEach(err => console.error(`     - ${err}`));
    }

    // Résumé
    const duration = Date.now() - startTime;
    const totalErrors = discoveryResult.errors.length + oddsResult.errors.length;
    const overallStatus = totalErrors === 0 ? 'success' : 'partial_success';

    console.log('\n' + '='.repeat(50));
    console.log(`✅ SYNC TERMINÉ (${duration}ms = ${(duration / 1000).toFixed(1)}s)`);
    console.log(`   Status: ${overallStatus}`);
    console.log(`   Matchs découverts: ${discoveryResult.discovered}`);
    console.log(`   Matchs mis à jour: ${discoveryResult.updated}`);
    console.log(`   Cotes capturées: ${oddsResult.odds_captured}`);
    console.log(`   Erreurs totales: ${totalErrors}`);
    console.log('='.repeat(50) + '\n');

    // Exit code basé sur les erreurs
    if (totalErrors > 0) {
      console.warn('⚠️  Sync terminé avec des erreurs');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ ERREUR CRITIQUE SYNC:', errorMessage);
    console.error(error);

    console.log('\n' + '='.repeat(50));
    console.log(`❌ SYNC ÉCHOUÉ (${duration}ms)`);
    console.log('='.repeat(50) + '\n');

    process.exit(1);
  }
}

main();
