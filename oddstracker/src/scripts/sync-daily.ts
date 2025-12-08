/**
 * Script de synchronisation des cotes
 * Usage: npm run sync:daily
 */

import 'dotenv/config';
import { getSyncService } from '../lib/sync';

async function main() {
  console.log('\n🔄 Démarrage de la synchronisation...\n');

  const syncService = getSyncService();

  const result = await syncService.syncCurrent({
    onProgress: (progress) => {
      const sport = progress.currentSport || '-';
      const league = progress.currentLeague || '-';
      console.log(
        `[${progress.status}] ${sport} > ${league} | ` +
        `Matchs: ${progress.fixturesProcessed} | ` +
        `Cotes: ${progress.oddsAdded} | ` +
        `Requêtes: ${progress.requestsUsed}`
      );
    },
  });

  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSULTAT DE LA SYNCHRONISATION');
  console.log('═'.repeat(50));
  console.log(`Statut: ${result.status}`);
  console.log(`Matchs traités: ${result.fixturesProcessed}`);
  console.log(`Cotes ajoutées: ${result.oddsAdded}`);
  console.log(`Requêtes API: ${result.requestsUsed}`);
  
  if (result.errors.length > 0) {
    console.log('\n⚠️  Erreurs:');
    result.errors.forEach((e) => console.log(`   - ${e}`));
  }

  console.log('═'.repeat(50));
  
  if (result.startTime && result.endTime) {
    const duration = (result.endTime.getTime() - result.startTime.getTime()) / 1000;
    console.log(`Durée: ${duration.toFixed(1)}s`);
  }
}

main().catch(console.error);
