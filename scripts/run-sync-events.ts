import { syncSports, syncAllTrackedEvents } from '../lib/services/theoddsapi/discovery';

async function main() {
  try {
    // Étape 1: Sync Sports
    console.log('🏃 Syncing sports...');
    const sportsResult = await syncSports();

    if (sportsResult.success) {
      console.log('✅ Synced', sportsResult.sportsCount, 'sports');
    } else {
      console.error('❌ Failed to sync sports');
      process.exit(1);
    }

    console.log('');

    // Étape 2: Sync Events
    console.log('🏃 Syncing events for tracked sports...');
    const eventsResult = await syncAllTrackedEvents();

    if (eventsResult.success) {
      const totalEvents = eventsResult.results.reduce((sum, r) => sum + r.eventsCount, 0);
      const totalNew = eventsResult.results.reduce((sum, r) => sum + r.newEventsCount, 0);

      console.log('');
      console.log('📊 Résultats:');
      console.log('  - Total événements:', totalEvents);
      console.log('  - Nouveaux événements:', totalNew);
      console.log('');
      console.log('Détails par sport:');
      eventsResult.results.forEach(r => {
        console.log(`  - ${r.sportKey}: ${r.eventsCount} events (${r.newEventsCount} nouveaux)`);
      });
      console.log('');
      console.log('✅ Sync terminée avec succès');
    } else {
      console.error('❌ Failed to sync events');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('');
    console.error('❌ Erreur fatale:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
