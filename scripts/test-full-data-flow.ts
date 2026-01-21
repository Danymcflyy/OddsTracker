#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  // Importer la fonction queries-frontend
  const { fetchEventsForTable } = await import('@/lib/db/queries-frontend');

  console.log('🔍 Test complet du flux de données...\n');

  // Récupérer exactement ce que le frontend reçoit
  const result = await fetchEventsForTable({
    page: 1,
    pageSize: 2,
    sortField: 'commence_time',
    sortDirection: 'asc',
  });

  console.log(`✅ ${result.data.length} événements récupérés\n`);

  if (result.data.length === 0) {
    console.log('❌ Aucun événement dans la base de données');
    return;
  }

  // Analyser le premier événement
  const event = result.data[0];

  console.log(`🏆 ${event.home_team} vs ${event.away_team}`);
  console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
  console.log(`   Status: ${event.status}\n`);

  console.log('📊 Structure opening_odds:');
  console.log(`   Type: ${Array.isArray(event.opening_odds) ? 'Array' : typeof event.opening_odds}`);
  console.log(`   Nombre d'entrées: ${event.opening_odds?.length || 0}\n`);

  if (event.opening_odds && event.opening_odds.length > 0) {
    console.log('📋 Toutes les entrées opening_odds:\n');

    const byMarket = new Map<string, any[]>();

    event.opening_odds.forEach((odd: any) => {
      if (!byMarket.has(odd.market_key)) {
        byMarket.set(odd.market_key, []);
      }
      byMarket.get(odd.market_key)!.push(odd);
    });

    for (const [marketKey, entries] of byMarket.entries()) {
      console.log(`   ✅ ${marketKey}: ${entries.length} variation(s)`);

      // Afficher les points distincts
      const points = entries.map(e => e.odds?.point).filter(p => p !== undefined);
      if (points.length > 0) {
        console.log(`      Points: ${points.join(', ')}`);
      }

      // Afficher un exemple d'odds
      const sample = entries[0];
      console.log(`      Exemple odds:`, JSON.stringify(sample.odds, null, 2));
    }
  }

  console.log('\n\n💡 Vérification du matching dans column-builder:');
  console.log('Le column-builder recherche:');
  console.log('  - row.original.opening_odds.find(m => m.market_key === baseMarketKey && m.odds?.point === targetPoint)');
  console.log('\nDonc il DOIT trouver les données si:');
  console.log('  1. market_key correspond (ex: "spreads")');
  console.log('  2. odds.point correspond (ex: -0.25)\n');
}

run();
