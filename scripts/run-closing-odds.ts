import { syncScoresAndClosingOdds } from '../lib/services/theoddsapi/closing-odds';

async function main() {
  try {
    console.log('🏃 Syncing scores and closing odds...');
    const result = await syncScoresAndClosingOdds();

    console.log('');
    console.log('📊 Résultats de la Sync:');
    console.log('  - Événements traités:', result.eventsProcessed);
    console.log('  - Cotes de clôture capturées:', result.closingCaptured);
    console.log('  - Échecs cotes de clôture:', result.closingFailed);
    console.log('  - Crédits utilisés:', result.creditsUsed);
    console.log('  - Erreurs:', result.errors.length);

    if (result.errors.length > 0) {
      console.log('');
      console.log('⚠️  Erreurs rencontrées:');
      result.errors.forEach(err => console.log('  -', err));
    }

    console.log('');
    if (!result.success) {
      console.error('❌ Sync terminée avec des erreurs');
      process.exit(1);
    }

    console.log('✅ Sync terminée avec succès');
  } catch (err: any) {
    console.error('');
    console.error('❌ Erreur fatale:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
