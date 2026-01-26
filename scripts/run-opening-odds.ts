import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  // Dynamic import to ensure env vars are loaded first
  const { scanAllOpeningOdds } = await import('../lib/services/theoddsapi/opening-odds');

  try {
    console.log('🏃 Scanning opening odds...');
    const result = await scanAllOpeningOdds();

    console.log('');
    console.log('📊 Résultats du Scan:');
    console.log('  - Événements scannés:', result.eventsScanned);
    console.log('  - Marchés vérifiés:', result.marketsChecked);
    console.log('  - Marchés capturés:', result.marketsCaptured);
    console.log('  - Crédits utilisés:', result.creditsUsed);
    console.log('  - Erreurs:', result.errors.length);

    if (result.errors.length > 0) {
      console.log('');
      console.log('⚠️  Erreurs rencontrées:');
      result.errors.forEach(err => console.log('  -', err));
    }

    console.log('');
    if (!result.success && result.errors.length > 0) {
      console.error('❌ Scan terminé avec des erreurs');
      process.exit(1);
    }

    console.log('✅ Scan terminé avec succès');
  } catch (err: any) {
    console.error('');
    console.error('❌ Erreur fatale:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
