#!/usr/bin/env npx tsx

/**
 * Test - Capture des Cotes d'Ouverture v2
 * Capture les cotes d'ouverture pour tous les événements en attente
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  // Dynamic import AFTER env is loaded
  const { scanAllOpeningOdds } = await import('@/lib/services/theoddsapi/opening-odds');

  console.log('📊 Capture des cotes d\'ouverture...\n');

  try {
    const result = await scanAllOpeningOdds();

    if (!result.success) {
      console.error('❌ Échec de la capture');
      process.exit(1);
    }

    console.log('\n✅ Capture terminée!\n');
    console.log(`📈 Résultats:`);
    console.log(`  - Événements traités: ${result.eventsProcessed}`);
    console.log(`  - Marchés capturés: ${result.marketsCaptured}`);
    console.log(`  - Crédits utilisés: ${result.creditsUsed}`);
    console.log(`  - Crédits restants: ${result.creditsRemaining}\n`);

    if (result.eventsProcessed > 0) {
      console.log('📝 Prochaine étape:');
      console.log('   npx tsx scripts/debug-odds-data.ts');
      console.log('   (ou accéder à http://localhost:3000/football)\n');
    } else {
      console.log('⚠️  Aucun événement à scanner. Lancez d\'abord:');
      console.log('   npx tsx scripts/test-discover-v2.ts\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la capture:', error);
    process.exit(1);
  }
}

run();
