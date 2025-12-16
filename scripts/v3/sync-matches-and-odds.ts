/**
 * Script simplifié - Import matchs et cotes
 * Skip la découverte des ligues (déjà en DB)
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

import { discoverMatches } from '@/lib/api/v3/match-discovery';
import { captureOdds } from '@/lib/api/v3/odds-capture';

async function main() {
  console.log('🚀 ===== IMPORT MATCHS & COTES =====\n');

  try {
    // Étape 1: Découverte des matchs pour les ligues trackées
    console.log('📋 ÉTAPE 1: Découverte des matchs...');
    console.log('='.repeat(60));

    const matchesResult = await discoverMatches('football');

    console.log(`\n✅ Résultat:`);
    console.log(`   - ${matchesResult.discovered} nouveaux matchs`);
    console.log(`   - ${matchesResult.updated} matchs mis à jour`);

    if (matchesResult.errors.length > 0) {
      console.log(`   - ⚠️  ${matchesResult.errors.length} erreurs:`);
      matchesResult.errors.forEach(err => console.log(`     • ${err}`));
    }

    // Étape 2: Capture des cotes
    console.log('\n🎯 ÉTAPE 2: Capture des cotes...');
    console.log('='.repeat(60));

    const oddsResult = await captureOdds('football', 10);  // Réduit à 10 pour éviter rate limit

    console.log(`\n✅ Résultat:`);
    console.log(`   - ${oddsResult.matches_updated} matchs traités`);
    console.log(`   - ${oddsResult.odds_captured} cotes capturées`);

    if (oddsResult.errors.length > 0) {
      console.log(`   - ⚠️  ${oddsResult.errors.length} erreurs:`);
      oddsResult.errors.forEach(err => console.log(`     • ${err}`));
    }

    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORT TERMINÉ');
    console.log('='.repeat(60));
    console.log('\nRécapitulatif:');
    console.log(`  Matchs découverts: ${matchesResult.discovered}`);
    console.log(`  Matchs mis à jour: ${matchesResult.updated}`);
    console.log(`  Cotes capturées: ${oddsResult.odds_captured}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

// Exécution
main().catch(console.error);
