#!/usr/bin/env npx tsx

/**
 * Test - Découverte des Événements
 * Découvre tous les événements pour les ligues sélectionnées
 */

import { syncAllTrackedEvents } from '@/lib/services/theoddsapi/discovery';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDiscoverEvents() {
  console.log('🔍 Découverte des événements pour les ligues sélectionnées...\n');

  try {
    const result = await syncAllTrackedEvents();

    if (!result.success) {
      console.error('❌ Échec de la découverte');
      process.exit(1);
    }

    console.log('\n📊 Résultats de la découverte:\n');

    let totalEvents = 0;
    let totalNew = 0;

    for (const sportResult of result.results) {
      const sportKey = sportResult.sportKey;
      const eventsCount = sportResult.eventsCount;
      const newCount = sportResult.newEventsCount;

      totalEvents += eventsCount;
      totalNew += newCount;

      if (eventsCount > 0) {
        console.log(`✅ ${sportKey}: ${eventsCount} événements (${newCount} nouveaux)`);
      } else {
        console.log(`⚠️  ${sportKey}: Aucun événement trouvé`);
      }
    }

    console.log(`\n📈 Total: ${totalEvents} événements (${totalNew} nouveaux)\n`);

    if (totalNew > 0) {
      console.log('✅ Découverte réussie ! Market states créés pour tous les nouveaux événements.\n');
      console.log('📝 Prochaine étape:');
      console.log('   npx tsx scripts/test-opening-odds.ts\n');
    } else if (totalEvents > 0) {
      console.log('✅ Événements déjà présents en base.\n');
      console.log('📝 Vous pouvez scanner les cotes d\'ouverture:');
      console.log('   npx tsx scripts/test-opening-odds.ts\n');
    } else {
      console.log('⚠️  Aucun événement découvert. Vérifiez que des ligues sont bien sélectionnées dans Settings.\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la découverte:', error);
    process.exit(1);
  }
}

testDiscoverEvents();
