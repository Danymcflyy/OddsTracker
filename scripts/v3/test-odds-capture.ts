/**
 * Script de test - Capture de cotes uniquement
 * Teste juste l'étape de capture des cotes pour les matchs existants
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

import { captureOdds } from '@/lib/api/v3/odds-capture';

async function main() {
  console.log('🎯 ===== TEST CAPTURE COTES V3 =====\n');

  try {
    console.log('🎯 Capture des cotes pour les matchs existants...');
    console.log('='.repeat(60));

    const oddsResult = await captureOdds('football', 5);  // Seulement 5 matchs pour les tests

    console.log(`\n✅ Résultat:`);
    console.log(`   - ${oddsResult.matches_updated} matchs traités`);
    console.log(`   - ${oddsResult.odds_captured} cotes capturées`);

    if (oddsResult.errors.length > 0) {
      console.log(`   - ⚠️  ${oddsResult.errors.length} erreurs:`);
      oddsResult.errors.forEach(err => console.log(`     • ${err}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST TERMINÉ');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

// Exécution
main().catch(console.error);
