/**
 * Test du nouveau système batché de récupération de cotes
 */

import './load-env';
import { captureOdds } from '@/lib/api/v3/odds-capture';
import { discoverMatches } from '@/lib/api/v3/match-discovery';

async function main() {
  console.log('\n🚀 Test du système batché V3\n');
  console.log('='.repeat(60));

  try {
    // Étape 1: Découverte de matchs
    console.log('\n📋 ÉTAPE 1: Découverte de matchs...');
    const discoveryResult = await discoverMatches('football');

    console.log(`  ✅ ${discoveryResult.discovered} nouveaux matchs`);
    console.log(`  🔄 ${discoveryResult.updated} matchs mis à jour`);

    if (discoveryResult.errors.length > 0) {
      console.warn(`  ⚠️  ${discoveryResult.errors.length} erreurs:`);
      discoveryResult.errors.forEach(err => console.error(`     - ${err}`));
    }

    // Étape 2: Capture de cotes (SANS LIMITE - teste le batching)
    console.log('\n🎯 ÉTAPE 2: Capture de cotes (mode batché)...');
    const oddsResult = await captureOdds('football', null);

    console.log(`\n  ✅ ${oddsResult.matches_updated} matchs traités`);
    console.log(`  📊 ${oddsResult.odds_captured} cotes capturées`);

    if (oddsResult.errors.length > 0) {
      console.warn(`  ⚠️  ${oddsResult.errors.length} erreurs:`);
      oddsResult.errors.forEach(err => console.error(`     - ${err}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test terminé!\n');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
