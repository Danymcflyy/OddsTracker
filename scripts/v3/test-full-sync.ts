/**
 * Script de test - Synchronisation complète V3
 * Teste la découverte de ligues, matchs et cotes
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

import { discoverAndSyncLeagues } from '@/lib/api/v3/league-discovery';
import { discoverMatches } from '@/lib/api/v3/match-discovery';
import { captureOdds } from '@/lib/api/v3/odds-capture';

async function main() {
  console.log('🚀 ===== TEST SYNCHRONISATION V3 =====\n');

  try {
    // Étape 1: Découverte des ligues
    console.log('📋 ÉTAPE 1: Découverte et synchronisation des ligues...');
    console.log('=' + '='.repeat(50));

    const leaguesResult = await discoverAndSyncLeagues('football', 'football');

    console.log(`\n✅ Résultat:`);
    console.log(`   - ${leaguesResult.leagues.length} ligues découvertes`);
    console.log(`   - ${leaguesResult.synced} ligues synchronisées`);

    if (leaguesResult.errors.length > 0) {
      console.log(`   - ⚠️  ${leaguesResult.errors.length} erreurs:`);
      leaguesResult.errors.forEach(err => console.log(`     • ${err}`));
    }

    console.log(`\n📋 Ligues découvertes:`);
    leaguesResult.leagues.slice(0, 10).forEach(league => {
      console.log(`   • ${league.name} (${league.oddsapi_key})`);
    });

    if (leaguesResult.leagues.length > 10) {
      console.log(`   ... et ${leaguesResult.leagues.length - 10} autres ligues`);
    }

    // Pause
    console.log('\n' + '='.repeat(60));
    console.log('⏸️  PAUSE: Allez dans Supabase et marquez quelques ligues comme tracked=true');
    console.log('   Ensuite, appuyez sur Entrée pour continuer...');
    console.log('='.repeat(60));

    await waitForEnter();

    // Étape 2: Découverte des matchs
    console.log('\n📋 ÉTAPE 2: Découverte des matchs pour les ligues trackées...');
    console.log('=' + '='.repeat(50));

    const matchesResult = await discoverMatches('football');

    console.log(`\n✅ Résultat:`);
    console.log(`   - ${matchesResult.discovered} nouveaux matchs`);
    console.log(`   - ${matchesResult.updated} matchs mis à jour`);

    if (matchesResult.errors.length > 0) {
      console.log(`   - ⚠️  ${matchesResult.errors.length} erreurs:`);
      matchesResult.errors.forEach(err => console.log(`     • ${err}`));
    }

    // Étape 3: Capture des cotes
    console.log('\n🎯 ÉTAPE 3: Capture des cotes...');
    console.log('=' + '='.repeat(50));

    const oddsResult = await captureOdds('football', 20);

    console.log(`\n✅ Résultat:`);
    console.log(`   - ${oddsResult.matches_updated} matchs traités`);
    console.log(`   - ${oddsResult.odds_captured} cotes capturées`);

    if (oddsResult.errors.length > 0) {
      console.log(`   - ⚠️  ${oddsResult.errors.length} erreurs:`);
      oddsResult.errors.forEach(err => console.log(`     • ${err}`));
    }

    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST TERMINÉ AVEC SUCCÈS');
    console.log('='.repeat(60));
    console.log('\nRécapitulatif:');
    console.log(`  Ligues synchronisées: ${leaguesResult.synced}`);
    console.log(`  Matchs découverts: ${matchesResult.discovered}`);
    console.log(`  Cotes capturées: ${oddsResult.odds_captured}`);
    console.log('\nVérifiez dans Supabase:');
    console.log(`  - Table 'leagues': ${leaguesResult.synced} ligues`);
    console.log(`  - Table 'matches': ${matchesResult.discovered} matchs`);
    console.log(`  - Table 'teams': créées automatiquement`);
    console.log(`  - Table 'odds': ${oddsResult.odds_captured} cotes`);
    console.log(`  - Table 'league_sync_log': logs de sync`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

/**
 * Attend que l'utilisateur appuie sur Entrée
 */
function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
}

// Exécution
main().catch(console.error);
